import * as path from 'path';

import { fileExists } from './util';

export async function findWaldenDir(): Promise<string | undefined> {
    const userProfileDir = process.env['USERPROFILE'];

    if (userProfileDir) {
        const waldenDir = path.join(
            userProfileDir, 'AppData', 'LocalLow', 'Game Innovation Lab',
            'Walden, a game'
        );

        if (await fileExists(waldenDir)) {
            return waldenDir;
        }
    }

    return undefined;
}

export async function findSaveGameDir(waldenDir: string): Promise<string | undefined> {
    const saveGameDir = path.join(waldenDir, 'Assets', 'SaveGames');

    if (await fileExists(saveGameDir)) {
        return saveGameDir;
    }

    return undefined;
}
