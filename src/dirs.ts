import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const exists = promisify(fs.exists);

export async function findWaldenDir(): Promise<string | undefined> {
    const userProfileDir = process.env['USERPROFILE'];

    if (userProfileDir) {
        const waldenDir = path.join(
            userProfileDir, 'AppData', 'LocalLow', 'Game Innovation Lab',
            'Walden, a game'
        );

        if (await exists(waldenDir)) {
            return waldenDir;
        }
    }

    return undefined;
}

export async function findSaveGameDir(waldenDir: string): Promise<string | undefined> {
    const saveGameDir = path.join(waldenDir, 'Assets', 'SaveGames');

    if (await exists(saveGameDir)) {
        return saveGameDir;
    }

    return undefined;
}
