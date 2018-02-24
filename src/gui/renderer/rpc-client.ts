import { ipcRenderer, IpcMessageEvent } from 'electron';

import * as rpc from '../rpc';

interface RequestPromiseCallbacks {
    resolve: (response: rpc.GuiResponse) => void;
    reject: (e: Error) => void;
}

const requestMap: Map<number, RequestPromiseCallbacks> = new Map();

let nextId = Date.now();

export function sendRequest(request: rpc.GuiRequest): Promise<rpc.GuiResponse> {
    const id = nextId++;
    const wrapper: rpc.GuiRequestWrapper = { id, payload: request };
    ipcRenderer.send('gui-request', wrapper);
    return new Promise((resolve, reject) => {
        requestMap.set(id, { resolve, reject });
    });
}

ipcRenderer.on('gui-response', (event: IpcMessageEvent, response: rpc.GuiResponseWrapper) => {
    const callbacks = requestMap.get(response.id);
    if (!callbacks) {
        console.error(`Callbacks for request ${response.id} not found!`);
        return;
    }

    switch (response.kind) {
        case 'success': return callbacks.resolve(response.payload);
        case 'error': return callbacks.reject(new Error(response.message));
    }
});
