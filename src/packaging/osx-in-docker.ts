import { execSync } from 'child_process';

import { productName, shortName, version } from './config';

const TMPDIR = '/staging/tmp';

const APPNAME = productName;

const ZIPFILE = `${shortName}-${version}-osx.zip`;

const DESTDIR_NAME = 'release-builds';

const DESTDIR = `/app/${DESTDIR_NAME}`;

function run(cmd: string) {
    execSync(cmd, { stdio: 'inherit' });
}

run([
    `mkdir -p ${TMPDIR}`,
    `echo "Copying repository to staging directory..."`,
    `cd /staging`,
    `rm -rf app`,
    `cp -R /app/ app`,
    `cd app`,
    `echo "Packaging app for OS X..."`,
    `npm run package-osx -- --download.cache=${TMPDIR}`,
    `cd "release-builds/${APPNAME}-darwin-x64"`,
    `zip -y -r ${ZIPFILE} "${APPNAME}.app"`,
    `mkdir -p ${DESTDIR}`,
    `cp ${ZIPFILE} ${DESTDIR}`,
    `echo "The packaged OS X app is in ${DESTDIR_NAME}/${ZIPFILE}."`
].join('\\\n && '));
