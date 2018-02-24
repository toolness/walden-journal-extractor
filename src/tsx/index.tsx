import { h, Component, render } from 'preact';
import { ipcRenderer, IpcMessageEvent } from 'electron';

import { GuiRequest, GuiResponse } from '../gui';

export interface AppProps {
    msg: string;
}

export interface AppState {
}

export class App extends Component<AppProps, AppState> {
    render(props: AppProps, state: AppState) {
        return <p>{props.msg}</p>;
    }
}

render(<App msg="Hello."></App>, document.getElementById('app'));

interface RequestPromiseCallbacks {
    resolve: (response: GuiResponse) => void;
    reject: (e: Error) => void;
}

const requestMap: Map<number, RequestPromiseCallbacks> = new Map();

function sendRequest(request: GuiRequest): Promise<GuiResponse> {
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

sendRequest({
    id: Math.random(),
    ms: 1000,
}).then((response) => {
    console.log('callback promise returned!', response);
}).catch(e => {
    console.log('an error occurred', e.message);
});
