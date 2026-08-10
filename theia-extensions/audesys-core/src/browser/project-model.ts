/**
 * IEC 61131-3 project manifest — pure model (A-工程管理).
 * The workspace root doubles as the project root (Theia "Open Folder" mode).
 * A lightweight `project.yaml` manifest records name/version/target/paths while
 * the directory convention (Programs/FBs/Functions/GVL) stays the source of truth.
 * Zero @theia dependency so it can be unit-tested without a DOM.
 */

/** The manifest file living at the workspace/project root. */
export const PROJECT_YAML_NAME = 'project.yaml';

/** A file to be created within a new project, relative to the project root. */
export interface ProjectFile {
    /** Path relative to the project root, `/`-separated. */
    path: string;
    content: string;
}

export interface ProjectMeta {
    name: string;
    version: string;
}

/** Valid IEC 61131-3 identifier: letter/underscore, then letters/digits/underscores. */
export function validateProjectName(name: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/** Minimal project.yaml manifest (see task spec §3). */
export function projectYaml(projectName: string): string {
    return [
        `name: ${projectName}`,
        'version: "1.0"',
        'audesys_version: "0.1.0"',
        'target:',
        '  runtime: audesys-rt',
        'paths:',
        '  programs: Programs/',
        '  function_blocks: FBs/',
        '  functions: Functions/',
        '  global_variables: GVL/',
        '',
    ].join('\n');
}

function mainTemplate(): string {
    return '(* Main — Structured Text Program *)\n\nPROGRAM Main\nVAR\n    (* variables *)\nEND_VAR\n\n(* code *)\n\nEND_PROGRAM\n';
}

function gvlTemplate(): string {
    return '(* Globals — Global Variable List *)\n\nVAR_GLOBAL\n    (* global variables *)\nEND_VAR\n';
}

const README_TPL = (title: string): string =>
    `# ${title}\n\nPlace IEC 61131-3 ${title.toLowerCase()} here.\n`;

/**
 * The standard empty-project file set: manifest + Programs/Main.st +
 * GVL/Globals.gvl + FBs/README + Functions/README. Only created when missing
 * (the wizard never overwrites existing content).
 */
export function projectTemplateFiles(projectName: string): ProjectFile[] {
    return [
        { path: PROJECT_YAML_NAME, content: projectYaml(projectName) },
        { path: 'Programs/Main.st', content: mainTemplate() },
        { path: 'GVL/Globals.gvl', content: gvlTemplate() },
        { path: 'FBs/README.md', content: README_TPL('Function Blocks') },
        { path: 'Functions/README.md', content: README_TPL('Functions') },
    ];
}

/**
 * Minimal YAML parser for the two manifest fields the tooling needs.
 * Hand-rolled (no js-yaml dependency): matches `name:` and `version:` at column
 * 0, optionally quoted. Returns null when either field is missing/unparsable.
 */
export function parseProjectYaml(yaml: string): ProjectMeta | null {
    const name = /^name:\s*"?([A-Za-z0-9._-]+)"?\s*$/m.exec(yaml)?.[1];
    const version = /^version:\s*"?([A-Za-z0-9._-]+)"?\s*$/m.exec(yaml)?.[1];
    if (!name || !version) {
        return null;
    }
    return { name, version };
}