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

sendRequest({
    ms: 1000,
}).then((response) => {
    console.log('callback promise returned!', response);
}).catch(e => {
    console.log('an error occurred', e.message);
});
