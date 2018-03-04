import * as path from 'path';
import { productName, zipfileName, releaseDir } from './config';
import { runSync } from './util';
import { APP_DIR, STAGING_DIR } from './docker';

const downloadCacheDir = path.join(STAGING_DIR, 'tmp');

const appStagingDir = path.join(STAGING_DIR, 'app');

const zipfile = zipfileName('osx');

const absReleaseDir = path.join(APP_DIR, releaseDir);

runSync([
    `mkdir -p ${downloadCacheDir}`,
    `echo "Copying repository to staging directory..."`,
    `rm -rf ${appStagingDir}`,
    `cp -R ${APP_DIR}/ ${appStagingDir}`,
    `cd ${appStagingDir}`,
    `echo "Packaging app for OS X..."`,
    `npm run package-osx -- --download.cache=${downloadCacheDir}`,
    `cd "release-builds/${productName}-darwin-x64"`,
    `zip -y -r ${zipfile} "${productName}.app"`,
    `mkdir -p ${absReleaseDir}`,
    `cp ${zipfile} ${absReleaseDir}`,
    `echo "The packaged OS X app is in ${releaseDir}/${zipfile}."`
].join('\\\n && '));
