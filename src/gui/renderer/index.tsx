import 'source-map-support/register'
import { h, Component, render } from 'preact';

import { AppStore, AppState, Dispatcher } from './store';

interface AppProps {
    state: AppState;
    dispatch: Dispatcher;
}

function App(props: AppProps): JSX.Element {
    switch (props.state.type) {
        case 'loading': return <p>Please wait...</p>;
        case 'friendlyError': return <p>{props.state.message}</p>;
        case 'error': return <p>Alas, an error occurred: {props.state.message}</p>;
        case 'loaded': return (
            <ul>
              {props.state.saveGames.map(game => (
                  <li>{game.slot} - {game.name}</li>
              ))}
            </ul>
        );
    }
}

type AppWrapperState = AppProps;

export class AppWrapper extends Component<{}, AppWrapperState> {
    store: AppStore;

    constructor(props: {}) {
        super(props);
        this.store = new AppStore((state, dispatch) => {
            this.setState({ state, dispatch });
        });
    }

    componentDidMount() {
        this.store.dispatch({ type: 'init' });
    }

    render() {
        return <App {...this.state}/>;
    }
}

export function start(root: HTMLElement) {
    render(<AppWrapper/>, root);
}
