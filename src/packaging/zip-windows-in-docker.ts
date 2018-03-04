import * as fs from 'fs';
import * as path from 'path';
import { productName, zipfileName, releaseDir } from './config';
import { runSync, cmdSequence, ensureRunAsScript } from './util';
import { APP_DIR } from './docker';

const winReleaseDir = `${productName}-win32-ia32`;
const relWinReleaseDir = path.join(releaseDir, winReleaseDir);
const absWinReleaseDir = path.join(APP_DIR, relWinReleaseDir);
const absReleaseDir = path.join(APP_DIR, releaseDir);
const zipfile = zipfileName('windows');

ensureRunAsScript(module);

if (!fs.existsSync(absWinReleaseDir)) {
    throw new Error(`${relWinReleaseDir} does not exist, please run electron-packager.`);
}

runSync(cmdSequence(
    `cd ${absReleaseDir}`,
    `echo "Creating ZIP archive..."`,
    `zip -r -q ${zipfile} "${winReleaseDir}"`,
    `echo "The packaged Windows app is in ${releaseDir}/${zipfile}".`,
));
