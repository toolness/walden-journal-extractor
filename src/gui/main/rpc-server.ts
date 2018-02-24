import { ipcMain, IpcMessageEvent } from 'electron';

import * as rpc from '../rpc';

const serverMethods: rpc.RpcMethods = {
    sleep(timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (timeout <= 0) {
                return reject(new Error('timeout must be a positive number'));
            }
            setTimeout(resolve, timeout);
        });
    },

    async add(a: number, b: number): Promise<number> {
        return a + b;
    }
};

ipcMain.on('gui-request', (event: IpcMessageEvent, request: rpc.GuiRequest) => {
    const method = (serverMethods as any)[request.method];

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
