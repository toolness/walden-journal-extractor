import { shortName, version } from '../config';

export * from '../config';

export function zipfileName(platform: 'osx'|'windows'): string {
    return `${shortName}-${version}-${platform}.zip`;
}

export const releaseDir = 'release-builds';
