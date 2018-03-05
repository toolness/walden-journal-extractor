import { execSync } from 'child_process';

export function ensureRunAsScript(module: NodeModule) {
    if (module.parent) {
        throw new Error(`${module.filename} should only be run as a script`);
    }
}

export function runSync(cmd: string) {
    execSync(cmd, { stdio: 'inherit' });
}

export function cmdSequence(...cmds: string[]) {
    return cmds.join('\\\n && ');
}
