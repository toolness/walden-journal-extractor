import { h, Component, render } from 'preact';

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
