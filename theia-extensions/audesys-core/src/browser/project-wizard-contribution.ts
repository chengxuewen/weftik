import { injectable, inject } from '@theia/core/shared/inversify';
import {
    Command, CommandContribution, CommandRegistry,
    MenuContribution, MenuModelRegistry,
} from '@theia/core/lib/common';
import { CommonMenus, QuickInputService } from '@theia/core/lib/browser';
import { URI } from '@theia/core/lib/common/uri';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { MessageService } from '@theia/core/lib/common/message-service';
import { BinaryBuffer } from '@theia/core/lib/common/buffer';
import { validateProjectName, projectTemplateFiles } from './project-model';

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
 * lightweight `project.yaml` manifest at the workspace root. The workspace root
 * IS the project root (Theia "Open Folder" mode) — the project name only feeds
 * the manifest's `name` field. Existing files are never overwritten.
 */
@injectable()
export class ProjectWizardContribution implements CommandContribution, MenuContribution {
    @inject(FileService) protected readonly fileService!: FileService;
    @inject(WorkspaceService) protected readonly workspaceService!: WorkspaceService;
    @inject(MessageService) protected readonly messageService!: MessageService;
    @inject(QuickInputService) protected readonly quickInput!: QuickInputService;

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
        const workspaceRoot = this.workspaceService.tryGetRoots()[0];
        if (!workspaceRoot) {
            this.messageService.warn('No workspace folder open. Open a project first.');
            return;
        }
        const name = await this.pickName();
        if (!name) {
            return;
        }
        const root = workspaceRoot.resource;
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
            if (created.length > 0) {
                this.messageService.info(`AUDESYS project "${name}" created: ${created.join(', ')}`);
            }
            if (skipped.length > 0) {
                this.messageService.warn(`Skipped existing files (not overwritten): ${skipped.join(', ')}`);
            }
        } catch (e) {
            this.messageService.error(`Failed to create AUDESYS project: ${String(e)}`);
        }
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