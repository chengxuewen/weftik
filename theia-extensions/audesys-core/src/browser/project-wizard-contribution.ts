import { injectable, inject } from '@theia/core/shared/inversify';
import {
    Command, CommandContribution, CommandRegistry,
    MenuContribution, MenuModelRegistry,
} from '@theia/core/lib/common';
import { CommonMenus, QuickInputService } from '@theia/core/lib/browser';
import { URI } from '@theia/core/lib/common/uri';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileDialogService } from '@theia/filesystem/lib/browser/file-dialog/file-dialog-service';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { MessageService } from '@theia/core/lib/common/message-service';
import { BinaryBuffer } from '@theia/core/lib/common/buffer';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables/env-variables-protocol';
import { validateProjectName, projectTemplateFiles, DEFAULT_PROJECTS_DIR } from './project-model';

export namespace ProjectWizardCommands {
    export const CATEGORY = 'AUDESYS';

    export const NEW_PROJECT: Command = {
        id: 'audesys.new.project',
        label: 'New AUDESYS Project…',
        category: CATEGORY,
    };
}

/**
 * New AUDESYS Project wizard (A-工程管理).
 * Creates the standard directory convention (Programs/FBs/Functions/GVL) plus a
 * lightweight `project.yaml` manifest.
 *
 * Two modes:
 *  - No workspace open → picks a parent directory (default ~/AUDESYS-Projects/,
 *    browseable), creates {parent}/{name}/ and opens it as the new workspace.
 *  - Workspace open → creates the project at the current workspace root (the
 *    workspace root IS the project root, D114). Existing files never overwritten.
 */
@injectable()
export class ProjectWizardContribution implements CommandContribution, MenuContribution {
    @inject(FileService) protected readonly fileService!: FileService;
    @inject(WorkspaceService) protected readonly workspaceService!: WorkspaceService;
    @inject(MessageService) protected readonly messageService!: MessageService;
    @inject(QuickInputService) protected readonly quickInput!: QuickInputService;
    @inject(FileDialogService) protected readonly fileDialogService!: FileDialogService;
    @inject(EnvVariablesServer) protected readonly envServer!: EnvVariablesServer;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(ProjectWizardCommands.NEW_PROJECT, {
            execute: () => this.runWizard(),
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        // Project-level command → File top-level (aligns with CODESYS/TwinCAT: File > New Project)
        menus.registerMenuAction(CommonMenus.FILE, {
            commandId: ProjectWizardCommands.NEW_PROJECT.id,
            label: 'New AUDESYS Project…',
            order: '0',
        });
    }

    protected async runWizard(): Promise<void> {
        const existingRoot = this.workspaceService.tryGetRoots()[0];
        const name = await this.pickName();
        if (!name) {
            return;
        }

        // M1: if a workspace is open, create inside it (back-compat). Otherwise
        // create a brand-new project dir and open it as the workspace.
        const root = existingRoot
            ? await this.projectDirInWorkspace(name, existingRoot.resource)
            : await this.projectDirFromScratch(name);
        if (!root) {
            return; // user cancelled or a pre-flight check failed (message already shown)
        }

        const created: string[] = [];
        const skipped: string[] = [];
        try {
            for (const file of projectTemplateFiles(name)) {
                await this.ensureDirChain(root, file.path);
                const fileUri = root.resolve(file.path);
                if (await this.fileService.exists(fileUri)) {
                    skipped.push(file.path);
                    continue;
                }
                await this.fileService.writeFile(fileUri, BinaryBuffer.fromString(file.content));
                created.push(file.path);
            }
        } catch (e) {
            // M2: write failure (e.g. sandboxed backend) → user must pick a writable location
            this.messageService.error(`Failed to create AUDESYS project: ${String(e)}`);
            return;
        }

        if (created.length > 0) {
            this.messageService.info(`AUDESYS project "${name}" created: ${created.join(', ')}`);
        }
        if (skipped.length > 0) {
            this.messageService.warn(`Skipped existing files (not overwritten): ${skipped.join(', ')}`);
        }

        // L2: when created from scratch, open the new project dir as the workspace.
        // The info message above is shown before reload; acceptable for now.
        if (!existingRoot) {
            await this.workspaceService.open(root, { preserveWindow: true });
        }
    }

    /** Create the project inside the current workspace root (back-compat). */
    protected async projectDirInWorkspace(name: string, workspaceRoot: URI): Promise<URI> {
        return workspaceRoot;
    }

    /** Pick a parent dir (default ~/AUDESYS-Projects/), create {name}/, return its URI. */
    protected async projectDirFromScratch(name: string): Promise<URI | undefined> {
        const parent = await this.pickParentDir();
        if (!parent) {
            return undefined;
        }
        const projectUri = parent.resolve(name);
        // M1: top-level dir name collision — never auto-overwrite an existing project dir.
        if (await this.fileService.exists(projectUri)) {
            this.messageService.error(`A project "${name}" already exists at ${projectUri.path.toString()}. Pick a different name or location.`);
            return undefined;
        }
        try {
            await this.fileService.createFolder(projectUri);
        } catch (e) {
            // M2: write failure → fall back to forcing the user to pick a writable dir.
            this.messageService.error(`Cannot create project directory: ${String(e)}`);
            const fallback = await this.pickParentDir(true);
            if (!fallback) {
                return undefined;
            }
            const fallbackUri = fallback.resolve(name);
            if (await this.fileService.exists(fallbackUri)) {
                this.messageService.error(`A project "${name}" already exists at ${fallbackUri.path.toString()}.`);
                return undefined;
            }
            await this.fileService.createFolder(fallbackUri);
            return fallbackUri;
        }
        return projectUri;
    }

    /** Dialog to choose the parent directory for a new project. */
    protected async pickParentDir(forceDialog = false): Promise<URI | undefined> {
        if (!forceDialog) {
            const defaultUri = await this.defaultProjectsUri();
            const choice = await this.quickInput.showQuickPick(
                [
                    { label: DEFAULT_PROJECTS_DIR, detail: defaultUri.path.toString(), id: 'default' },
                    { label: 'Browse…', detail: 'Choose another location', id: 'browse' },
                ],
                { placeholder: 'Where to create the project?' },
            );
            if (!choice) {
                return undefined;
            }
            if (choice.id === 'default') {
                return defaultUri;
            }
        }
        const selection = await this.fileDialogService.showOpenDialog({
            title: 'Select project location',
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
        });
        if (!selection) {
            return undefined;
        }
        const uri = Array.isArray(selection) ? selection[0] : selection;
        return uri as URI;
    }

    /** The default projects parent dir: {home}/AUDESYS-Projects/. */
    protected async defaultProjectsUri(): Promise<URI> {
        const home = await this.envServer.getHomeDirUri();
        return new URI(home).resolve(DEFAULT_PROJECTS_DIR);
    }

    protected async pickName(): Promise<string | undefined> {
        return this.quickInput.input({
            title: 'New AUDESYS Project',
            prompt: 'Name of the AUDESYS project (used in project.yaml)',
            placeHolder: 'e.g. my-project',
            validateInput: async (value) => {
                const trimmed = value.trim();
                if (!validateProjectName(trimmed)) {
                    return 'Must be a valid IEC identifier (letter/underscore, then letters/digits/underscores).';
                }
                return undefined;
            },
        }).then(value => value?.trim() || undefined);
    }

    /** Create every parent directory of a relative path, if missing. */
    protected async ensureDirChain(root: URI, relPath: string): Promise<void> {
        const segments = relPath.split('/');
        segments.pop(); // drop the file name
        let current = root;
        for (const seg of segments) {
            current = current.resolve(seg);
            if (!(await this.fileService.exists(current))) {
                await this.fileService.createFolder(current);
            }
        }
    }
}