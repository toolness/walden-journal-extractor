import { FriendlyGetter } from './util';

const packageJson = new FriendlyGetter(require('../../package.json'), 'package.json');

export const shortName = packageJson.getStr('name');

export const productName = packageJson.getStr('productName');

export const version = packageJson.getStr('version');

export function zipfileName(platform: 'osx'|'windows'): string {
    return `${shortName}-${version}-${platform}.zip`;
}

export const releaseDir = 'release-builds';
