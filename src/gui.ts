import * as path from 'path';
import * as url from 'url';

import 'source-map-support/register'
import { app, BrowserWindow, ipcMain, IpcMessageEvent } from 'electron';

let win: BrowserWindow | null = null;

function createWindow() {
    win = new BrowserWindow({ width: 800, height: 600 });

    win.loadURL(url.format({
        pathname: path.join(__dirname, '..', 'index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

function sleep(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        if (timeout <= 0) {
            return reject(new Error('timeout must be a positive number'));
        }
        setTimeout(resolve, timeout);
    });
}

export interface GuiRequest {
    ms: number;
    id: number;
}

export interface GuiResponse {
    id: number;
    error: string | null;
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
