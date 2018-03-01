import { remote, FileFilter } from 'electron';
import slugify from 'slugify';

import { Dispatcher, FileFormat } from './store';

const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

function getFilters(format: FileFormat): FileFilter[] {
    switch (format) {
        case 'html':
        return [{ name: 'Web Page', extensions: ['html'] }];

        case 'docx':
        return [{ name: 'Microsoft Word', extensions: ['docx'] }];

        case 'pdf':
        return [{ name: 'PDF Document', extensions: ['pdf'] }];
    }
}

export default function saveAs(format: FileFormat, title: string, dispatch: Dispatcher) {
    const slugifiedTitle = slugify(title, { remove: /([^A-Za-z0-9 ])/g });
    const path = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        title: 'Save As',
        defaultPath: `Journal-${slugifiedTitle}`,
        filters: getFilters(format),
    });
    if (path) {
        dispatch({ type: 'export', format, path });
    }
}
