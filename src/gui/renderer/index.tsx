import { h, Component, render } from 'preact';

import rpcMethods from './rpc-client';

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
    console.log(await rpcMethods.sleep(1000));
    console.log(await rpcMethods.add(3, 5));
}

doStuff();
