import { remote } from 'electron';
import slugify from 'slugify';

import { Dispatcher, FileFormat } from './store';

const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

export default function saveAs(format: FileFormat, title: string, dispatch: Dispatcher) {
    const slugifiedTitle = slugify(title, { remove: /([^A-Za-z0-9 ])/g });
    const path = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        title: 'Save As',
        defaultPath: `Journal-${slugifiedTitle}`,
        filters: [
            {name: 'HTML pages', extensions: ['html']},
        ]
    });
    if (path) {
        dispatch({ type: 'export', format, path });
    }
}
