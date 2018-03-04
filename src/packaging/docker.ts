import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { FriendlyGetter } from './util';

const ROOT_DIR = path.normalize(path.join(__dirname, '..', '..'));

if (!fs.existsSync(path.join(ROOT_DIR, 'package.json'))) {
    throw new Error(`Assertion failure, ${ROOT_DIR} is incorrect`);
}

if (!process.env['IS_RUNNING_IN_DOCKER']) {
    process.exit(proxyScriptToDocker());
}

const env = new FriendlyGetter(process.env, 'docker environment');

export const APP_DIR = env.getStr('APP_DIR');

export const STAGING_DIR = env.getStr('STAGING_DIR');

function proxyScriptToDocker(argv: string[] = process.argv): number {
    if (argv.length < 2) {
        throw new Error('Assertion failure on argv.length');
    }

    const scriptName = argv[1];
    const relPath = path.relative(ROOT_DIR, scriptName)
      .split(path.sep)
      .join(path.posix.sep);
    const extraArgs = argv.slice(2);
    let cmdline = `node ${relPath}`;

    if (extraArgs.length) {
        cmdline += ' ' + extraArgs.join(' ');
    }

    console.log(`Proxying "${cmdline}" to run within Docker...`);

    try {
        child_process.execFileSync('docker-compose', [
            'run',
            'app',
            'node',
            relPath,
            ...extraArgs,
        ], { stdio: 'inherit' });
    } catch (e) {
        console.log(
            `An error occurred while attempting to run ` +
            `the script in Docker: ${e}`
        );
        return 1;
    }
    return 0;
}
