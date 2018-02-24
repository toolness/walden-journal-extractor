import { ipcMain, IpcMessageEvent } from 'electron';

import { GuiRequest, GuiResponse } from '../rpc';

function sleep(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        if (timeout <= 0) {
            return reject(new Error('timeout must be a positive number'));
        }
        setTimeout(resolve, timeout);
    });
}

function respond(event: IpcMessageEvent, response: GuiResponse) {
    event.sender.send('gui-response', response);
}

ipcMain.on('gui-request', (event: IpcMessageEvent, request: GuiRequest) => {
    sleep(request.ms).then(() => {
        respond(event, { id: request.id, error: null });
    }).catch(e => {
        let message = 'Unknown error';

        if (e && typeof(e.message) === 'string') {
            message = e.message;
        }

        console.error(`Error occurred in gui-request ${request.id}.`);
        console.error(e);

        respond(event, { id: request.id, error: message });
    });
});
