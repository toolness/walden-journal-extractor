import { h, Component, render } from 'preact';

import { SaveGameInfo } from '../rpc';

import rpcMethods from './rpc-client';

interface AppProps {
}

interface LoadingState {
    type: 'loading';
}

interface ErrorState {
    type: 'error';
    message: string;
}

interface LoadedState {
    type: 'loaded';
    saveGames: SaveGameInfo[],
}

type AppState = LoadingState | ErrorState | LoadedState;

export class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = { type: 'loading' };
    }

    componentDidMount() {
        rpcMethods.getSaveGameInfos().then(saveGames => {
            const newState: AppState = {
                type: 'loaded',
                saveGames,
            };
            this.setState(newState);
        }).catch(e => {
            const newState: AppState = {
                type: 'error',
                message: e.message || 'Unknown error'
            };
            this.setState(newState);
        });
    }

    render(props: AppProps, state: AppState) {
        switch (state.type) {
            case 'loading': return <p>Please wait...</p>;
            case 'error': return <p>Alas, an error occurred: {state.message}</p>;
            case 'loaded': return (
                <ul>
                  {state.saveGames.map(game => (
                      <li>{game.slot} - {game.name}</li>
                  ))}
                </ul>
            );
        }
    }
}

render(<App/>, document.getElementById('app'));
