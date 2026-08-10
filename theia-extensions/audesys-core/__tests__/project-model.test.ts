import { describe, it, expect } from 'vitest';
import {
    PROJECT_YAML_NAME, validateProjectName,
    projectTemplateFiles, projectYaml, parseProjectYaml,
} from '../src/browser/project-model';

describe('validateProjectName (A-工程管理)', () => {
    it('accepts valid IEC identifiers', () => {
        for (const name of ['pump', '_ctrl', 'Axis_1', 'PID_Controller', 'a']) {
            expect(validateProjectName(name), name).toBe(true);
        }
    });

    it('rejects invalid identifiers', () => {
        for (const name of ['', '1axis', 'my project', 'my.project', 'my/project', 'a-b', 'my-project']) {
            expect(validateProjectName(name), name).toBe(false);
        }
    });
});

describe('projectTemplateFiles', () => {
    it('returns a manifest plus the standard directory convention', () => {
        const files = projectTemplateFiles('demo');
        const paths = files.map(f => f.path);
        expect(paths).toContain(PROJECT_YAML_NAME);
        expect(paths).toContain('Programs/Main.st');
        expect(paths).toContain('GVL/Globals.gvl');
        expect(paths).toContain('FBs/README.md');
        expect(paths).toContain('Functions/README.md');
    });

    it('names the manifest with the project name', () => {
        const yaml = projectTemplateFiles('demo').find(f => f.path === PROJECT_YAML_NAME)?.content;
        expect(yaml).toBeDefined();
        expect(yaml).toContain('name: demo');
    });

    it('Main.st and Globals.gvl use the expected templates', () => {
        const main = projectTemplateFiles('demo').find(f => f.path === 'Programs/Main.st')!.content;
        const gvl = projectTemplateFiles('demo').find(f => f.path === 'GVL/Globals.gvl')!.content;
        expect(main).toContain('PROGRAM Main');
        expect(main).toContain('END_PROGRAM');
        expect(gvl).toContain('VAR_GLOBAL');
        expect(gvl).toContain('END_VAR');
    });
});

describe('projectYaml', () => {
    it('embeds the project name and the minimal manifest fields', () => {
        const yaml = projectYaml('demo');
        expect(yaml).toContain('name: demo');
        expect(yaml).toContain('version: "1.0"');
        expect(yaml).toContain('runtime: audesys-rt');
        expect(yaml).toContain('programs: Programs/');
    });
});

describe('parseProjectYaml', () => {
    it('parses name and version from a generated manifest', () => {
        const yaml = projectYaml('demo');
        expect(parseProjectYaml(yaml)).toEqual({ name: 'demo', version: '1.0' });
    });

    it('parses quoted values', () => {
        const yaml = 'name: "my_proj"\nversion: "2.3"\n';
        expect(parseProjectYaml(yaml)).toEqual({ name: 'my_proj', version: '2.3' });
    });

    it('returns null when name or version is missing', () => {
        expect(parseProjectYaml('name: demo\n')).toBeNull();
        expect(parseProjectYaml('version: "1.0"\n')).toBeNull();
        expect(parseProjectYaml('# no fields here\n')).toBeNull();
        expect(parseProjectYaml('')).toBeNull();
    });
});