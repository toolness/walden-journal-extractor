import * as fs from 'fs';
import * as path from 'path';

import { parseXML, friendlyGet } from './util';

export default class SaveGame {
    slot: number;
    path: string;
    name: string;

    constructor(slot: number, name: string, rootDir: string) {
        this.slot = slot;
        this.name = name;
        this.path = path.join(rootDir, `SaveGame_${slot}.xml`);
    }

    async getJournal(): Promise<string> {
        const xml = fs.readFileSync(this.path, 'utf-8');

        return friendlyGet(await parseXML(xml), 'SaveGame.writtenJournal.0');
    }

    static async retrieveAll(rootDir: string): Promise<SaveGame[]> {
        const listFile = path.join(rootDir, 'SaveGameList.xml');
        const xml = fs.readFileSync(listFile, 'utf-8');
        const content = await parseXML(xml);

        return friendlyGet(content, 'SaveSlotList.SaveSlotList.0.SaveSlot')
            .map((obj: any): SaveGame => {
                const slot = parseInt(friendlyGet(obj, '$.SaveSlot'));
                const name = friendlyGet(obj, 'saveGameUIName.0');

                if (isNaN(slot)) {
                    throw new Error('Save slot is not an integer!');
                }
                
                if (typeof(name) !== 'string') {
                    throw new Error('Save name is not a string!');
                }

                return new SaveGame(slot, name, rootDir);
            });
    }
}
