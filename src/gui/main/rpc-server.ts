import { ipcMain, IpcMessageEvent } from 'electron';

import * as rpc from '../rpc';

function sleep(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        if (timeout <= 0) {
            return reject(new Error('timeout must be a positive number'));
        }
        setTimeout(resolve, timeout);
    });
}

async function processRequest(request: rpc.GuiRequest): Promise<rpc.GuiResponse> {
    switch (request.kind) {
        case 'sleep':
            await sleep(request.ms);
            return { kind: 'null' };
        case 'add':
            return { kind: 'number', value: request.a + request.b };
    }
}

ipcMain.on('gui-request', (event: IpcMessageEvent, request: rpc.GuiRequestWrapper) => {
    processRequest(request.payload).then((response) => {
        const wrapper: rpc.GuiResponseWrapper = {
            kind: 'success',
            id: request.id,
            payload: response,
        };
        event.sender.send('gui-response', wrapper);
    }).catch(e => {
        let message = 'Unknown error';

        if (e && typeof(e.message) === 'string') {
            message = e.message;
        }

        console.error(`Error occurred in gui-request ${request.id}.`);
        console.error(e);

        const response: rpc.GuiResponseWrapper = {
            kind: 'error',
            id: request.id,
            message,
        };
        event.sender.send('gui-response', response);
    });
});
