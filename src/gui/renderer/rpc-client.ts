import { ipcRenderer, IpcMessageEvent } from 'electron';

import { GuiRequest, GuiResponse } from '../rpc';

interface RequestPromiseCallbacks {
    resolve: (response: GuiResponse) => void;
    reject: (e: Error) => void;
}

const requestMap: Map<number, RequestPromiseCallbacks> = new Map();

export function sendRequest(request: GuiRequest): Promise<GuiResponse> {
    ipcRenderer.send('gui-request', request);
    return new Promise((resolve, reject) => {
        requestMap.set(request.id, { resolve, reject });
    });
}

ipcRenderer.on('gui-response', (event: IpcMessageEvent, response: GuiResponse) => {
    const callbacks = requestMap.get(response.id);
    if (!callbacks) {
        console.error(`Callbacks for request ${response.id} not found!`);
        return;
    }

    if (response.error === null) {
        callbacks.resolve(response);
    } else {
        callbacks.reject(new Error(response.error));
    }
});
