import 'source-map-support/register'
import { h, Component, render } from 'preact';

import { AppStore, AppState, ErrorState, LoadedState, Dispatcher } from './store';

interface BaseAppProps<T> {
    state: T;
    dispatch: Dispatcher;
}

type AppProps = BaseAppProps<AppState>;

function Loading(): JSX.Element {
    return (
        <p>Please wait...</p>
    );
}

function ErrorView(props: BaseAppProps<ErrorState>): JSX.Element {
    let errInfo: JSX.Element;

    if (props.state.type == 'friendlyError') {
        errInfo = <p>{props.state.message}</p>;
    } else {
        errInfo = <p>Alas, an error occurred: {props.state.message}</p>;
    }

    return (
        <div>
            {errInfo}
            <button onClick={() => props.dispatch({ type: 'init' })}>
              Retry
            </button>
        </div>
    );
}

function Loaded(props: BaseAppProps<LoadedState>): JSX.Element {
    return (
        <ul>
          {props.state.saveGames.map(saveGame => (
              <li>
                  <button onClick={() => props.dispatch({ type: 'loadgame', saveGame })}>
                      {saveGame.name}
                  </button>
              </li>
          ))}
        </ul>
    );
}

function App(props: AppProps): JSX.Element {
    const { state, dispatch } = props;

    switch (state.type) {
        case 'loading': return <Loading/>;

        case 'friendlyError':
        case 'error':
        return <ErrorView {...{ state, dispatch }} />;

        case 'loaded': return <Loaded {...{ state, dispatch }} />;
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
