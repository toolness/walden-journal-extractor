#! /bin/bash

set -e

export PATH=${PATH}:./node_modules/.bin

export TMPDIR=/staging/tmp

export ZIPFILE=wje-osx.zip

export APPNAME="Walden Journal Extractor"

export DESTDIR_NAME=release-builds

export DESTDIR=/app/${DESTDIR_NAME}

mkdir -p ${TMPDIR}

echo "Copying repository to staging directory..."

cd /staging

rm -rf app

cp -R /app/ app

cd app

echo "Packaging app for OS X..."

npm run package-osx -- --download.cache=${TMPDIR}

cd "release-builds/${APPNAME}-darwin-x64"

zip -y -r ${ZIPFILE} "${APPNAME}.app"

mkdir -p ${DESTDIR}

cp ${ZIPFILE} ${DESTDIR}

echo "Done. The packaged OS X app is in ${DESTDIR_NAME}/${ZIPFILE}."
