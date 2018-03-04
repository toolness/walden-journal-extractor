import * as path from 'path';
import * as url from 'url';

import 'source-map-support/register'
import { app, BrowserWindow } from 'electron';

let win: BrowserWindow | null = null;

// Taken from https://github.com/sindresorhus/electron-is-dev.
const isDev = /node_modules[\\/]electron[\\/]/.test(process.execPath);

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        resizable: true,
        autoHideMenuBar: true,
        show: false,
        icon: 'icon.png',
        webPreferences: {
            zoomFactor: 0.75,
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, '..', '..', '..', 'index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    if (isDev) {
        win.webContents.openDevTools();
    }

    win.on('closed', () => {
        win = null;
    });

    win.once('ready-to-show', () => {
        if (win) {
            win.show();
        }
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
