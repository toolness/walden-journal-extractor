import * as path from 'path';
import 'source-map-support/register'

import SaveGame from './savegame';
import { findWaldenDir, findSaveGameDir } from './dirs';

function writeln(msg: string) {
    process.stdout.write(`${msg}\n`);
}

function ewriteln(msg: string) {
    process.stderr.write(`${msg}\n`);
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

async function main(argv: string[]): Promise<void> {
    const waldenDir = process.env['WALDEN_DIR'] || await findWaldenDir();

    if (!waldenDir) {
        ewriteln(
            'Walden directory not found. Please define the WALDEN_DIR ' +
            'environment variable to point at it.'
        );
        return process.exit(1);
    }

    const saveGameDir = await findSaveGameDir(waldenDir);

    if (!saveGameDir) {
        ewriteln(
            'Walden directory found, but the save game directory' +
            'was not!'
        );
        return process.exit(1);
    }

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
            const journal = await game.getJournal();
            writeln(journal.asMarkdown());
        }
    }
}

if (module.parent === null) {
    main(process.argv.slice(1)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
