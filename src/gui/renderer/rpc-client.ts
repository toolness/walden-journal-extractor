import { ipcRenderer, IpcMessageEvent } from 'electron';

import * as rpc from '../rpc';

const clientMethods: rpc.RpcMethods = {
    sleep(timeout: number): Promise<void> {
        return sendRequest('sleep', [timeout]);
    },

    async add(a: number, b: number): Promise<number> {
        return sendRequest('add', [a, b]);
    }
};

export default clientMethods;

interface RequestPromiseCallbacks {
    resolve: (response: rpc.GuiResponse) => void;
    reject: (e: Error) => void;
}

const requestMap: Map<number, RequestPromiseCallbacks> = new Map();

let nextId = Date.now();

function sendRequest(method: string, args: any[]): Promise<any> {
    const id = nextId++;
    const request: rpc.GuiRequest = { id, method, args };
    ipcRenderer.send('gui-request', request);
    return new Promise((resolve, reject) => {
        requestMap.set(id, { resolve, reject });
    });
}

ipcRenderer.on('gui-response', (event: IpcMessageEvent, response: rpc.GuiResponse) => {
    const callbacks = requestMap.get(response.id);
    if (!callbacks) {
        console.error(`Callbacks for request ${response.id} not found!`);
        return;
    }

    requestMap.delete(response.id);

    switch (response.kind) {
        case 'success': return callbacks.resolve(response.returnValue);
        case 'error': return callbacks.reject(new Error(response.message));
    }
});
