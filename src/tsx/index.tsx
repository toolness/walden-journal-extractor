import { h, Component, render } from 'preact';
import { remote } from 'electron';
import { default as SaveGameType } from '../savegame';

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

const SaveGame = remote.require('./dist/savegame').default as typeof SaveGameType;

SaveGame.retrieveAll('bop').catch((e) => {
    console.log('error', e);
});
