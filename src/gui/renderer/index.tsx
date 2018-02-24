import { h, Component, render } from 'preact';

import { sendRequest } from './rpc-client';

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

async function doStuff() {
    console.log(await sendRequest({ kind: 'sleep', ms: 1000 }));
    console.log(await sendRequest({ kind: 'add', a: 5, b: 3 }));
}

doStuff();
