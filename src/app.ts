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

function findSaveGameDir(): string {
    const userProfileDir = process.env['USERPROFILE'];

    if (!userProfileDir) {
        throw new Error('USERPROFILE environment variable not found!');
    }
    
    const waldenDir = path.join(
        userProfileDir, 'AppData', 'LocalLow', 'Game Innovation Lab',
        'Walden, a game'
    );
    
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
    const saveGameDir = findSaveGameDir();
    let [cmd, slot] = argv;

    cmd = path.basename(cmd);

    if (slot === undefined) {
        ewriteln(`Usage: ${cmd} <save-slot>\n`);
        ewriteln(`save-slot can be one of:\n`);
        ewriteln(await getSlots(saveGameDir));
        process.exit(1);
    } else {
        const game = (await SaveGame.retrieveAll(saveGameDir))
          .filter(g => g.slot === parseInt(slot))[0];
        if (!game) {
            ewriteln(`Save slot '${slot}' does not exist.\n`);
            ewriteln(`Please choose from one of the following:\n`);
            ewriteln(await getSlots(saveGameDir));
            process.exit(1);
        } else {
            writeln(journalTextToMarkdown(await game.getJournal()));
        }
    }
}

if (module.parent === null) {
    main(process.argv.slice(1));
}
