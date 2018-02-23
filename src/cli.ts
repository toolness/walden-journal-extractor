import * as fs from 'fs';
import * as path from 'path';
import 'source-map-support/register'

import SaveGame from './savegame';
import { journalTextToMarkdown } from './util';

function writeln(msg: string) {
    process.stdout.write(`${msg}\n`);
}

function ewriteln(msg: string) {
    process.stderr.write(`${msg}\n`);
}

function findWaldenDir(): string | undefined {
    const userProfileDir = process.env['USERPROFILE'];

    if (userProfileDir) {
        const waldenDir = path.join(
            userProfileDir, 'AppData', 'LocalLow', 'Game Innovation Lab',
            'Walden, a game'
        );

        if (fs.existsSync(waldenDir)) {
            return waldenDir;
        }
    }

    return undefined;
}

function findSaveGameDir(waldenDir: string): string {
    const saveGameDir = path.join(waldenDir, 'Assets', 'SaveGames');

    if (!fs.existsSync(saveGameDir)) {
        throw new Error('Walden save game directory not found!');
    }

    return saveGameDir;
}

async function getSlots(saveGameDir: string,
                        indent: string = '  '): Promise<string> {
    const games = await SaveGame.retrieveAll(saveGameDir);

    if (games.length === 0) {
        return `${indent}No saved games found.`;
    } else {
        return games.map(g => `${indent}${g.slot} - ${g.name}`).join('\n');
    }
}

async function main(argv: string[]) {
    const waldenDir = process.env['WALDEN_DIR'] || findWaldenDir();

    if (!waldenDir) {
        ewriteln(
            'Walden directory not found. Please define the WALDEN_DIR ' +
            'environment variable to point at it.'
        );
        return process.exit(1);
    }

    const saveGameDir = findSaveGameDir(waldenDir);
    let [cmd, slot] = argv;

    cmd = path.basename(cmd);

    if (slot === undefined) {
        ewriteln(`Usage: ${cmd} <save-slot>\n`);
        ewriteln(`save-slot can be one of:\n`);
        ewriteln(await getSlots(saveGameDir));
        return process.exit(1);
    } else {
        const game = (await SaveGame.retrieveAll(saveGameDir))
          .filter(g => g.slot === parseInt(slot))[0];
        if (!game) {
            ewriteln(`Save slot '${slot}' does not exist.\n`);
            ewriteln(`Please choose from one of the following:\n`);
            ewriteln(await getSlots(saveGameDir));
            return process.exit(1);
        } else {
            writeln(journalTextToMarkdown(await game.getJournal()));
        }
    }
}

if (module.parent === null) {
    main(process.argv.slice(1));
}
