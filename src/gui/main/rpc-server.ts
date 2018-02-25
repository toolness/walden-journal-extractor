import { ipcMain, IpcMessageEvent } from 'electron';

import SaveGame from '../../savegame';
import * as dirs from '../../dirs';
import * as rpc from '../rpc';

const serverMethods: rpc.RpcMethods = {
    async getSaveGameInfos(): Promise<rpc.SaveGameInfo[]> {
        const waldenDir = await dirs.findWaldenDir();

        if (!waldenDir) {
            throw new Error('Unable to find Walden game directory!');
        }

        const saveGameDir = await dirs.findSaveGameDir(waldenDir);

        if (!saveGameDir) {
            throw new Error('Unable to find Walden save game directory!');
        }

        const games = await SaveGame.retrieveAll(saveGameDir);

        return games.map((game): rpc.SaveGameInfo => ({
            name: game.name,
            slot: game.slot
        }));
    }
};

ipcMain.on('gui-request', (event: IpcMessageEvent, request: rpc.GuiRequest) => {
    const method = serverMethods[request.method];

    let promise: Promise<any>;

    if (typeof(method) === 'function') {
        promise = method.apply(null, request.args);
    } else {
        promise = Promise.reject(new Error(`RPC method ${request.method} does not exist!`));
    }

    promise.then((returnValue: any) => {
        const response: rpc.GuiResponse = {
            kind: 'success',
            id: request.id,
            returnValue
        };
        event.sender.send('gui-response', response);
    }).catch((e: any) => {
        let message = 'Unknown error';

        if (e && typeof(e.message) === 'string') {
            message = e.message;
        }

        console.error(`Error occurred in gui-request ${request.id}.`);
        console.error(e);

        const response: rpc.GuiResponse = {
            kind: 'error',
            id: request.id,
            message,
        };
        event.sender.send('gui-response', response);
    });
});
