import 'source-map-support/register'
import * as React from 'react';
import { render } from 'react-dom';
import Transition from 'react-transition-group/Transition';

import { AppStore, AppState, ErrorState, LoadedState, Dispatcher,
         LoadedJournalState } from './store';
import saveAs from './save-as';

const FADE_TIME_CSS_PROP = '--fade-time';
const DEFAULT_FADE_TIME = 50;

type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

type CssClass =
    'simple-layout' | 'layout-top' | 'huge-logo' | 'all-caps' | 'layout-bottom' |
    'unstyled-list' | 'big' | 'tripart-layout' | 'layout-top-left' |
    'layout-bottom-left' | 'layout-right' | 'journal' | 'app-fader' |
    TransitionState;

interface AppProps<T> {
    state: T;
    dispatch: Dispatcher;
}

function cls(...names: CssClass[]): { className: string } {
    return { className: names.join(' ') };
}

interface BigListButtonProps {
    onClick: () => void;
    label: string;
    disabled?: boolean;
}

function BigListButton(props: BigListButtonProps): JSX.Element {
    return (
        <li>
            <button {...cls('big')} onClick={props.onClick}
                    disabled={props.disabled}>{props.label}</button>
        </li>
    );
}

function Loading(): JSX.Element {
    return (
        <div {...cls('simple-layout')}>
            <div {...cls('layout-top')}>
                <h1>Please wait&hellip;</h1>
            </div>
            <div {...cls('layout-bottom')}></div>
        </div>
    );
}

function ErrorView({ state, dispatch }: AppProps<ErrorState>): JSX.Element {
    let errInfo: JSX.Element;

    if (state.type == 'friendlyError') {
        errInfo = <p>{state.message}</p>;
    } else {
        errInfo = <p>Alas, an error occurred: {state.message}</p>;
    }

    return (
        <div {...cls('simple-layout')}>
            <div {...cls('layout-top')}>
                <h1>Uh oh&hellip;</h1>
                <p>{errInfo}</p>
            </div>
            <ul {...cls('layout-bottom', 'unstyled-list')}>
                <BigListButton onClick={() => dispatch({ type: 'init' })} label="Retry"/>
            </ul>
        </div>
    );
}

function Loaded({ state, dispatch }: AppProps<LoadedState>): JSX.Element {
    return (
        <div {...cls('simple-layout')}>
            <div {...cls('layout-top')}>
                <h1 {...cls('huge-logo', 'all-caps')}>Walden, A Game</h1>
                <p {...cls('all-caps')}>Journal extractor</p>
            </div>
            <ul {...cls('layout-bottom', 'unstyled-list')}>
            {state.saveGames.map(saveGame => (
                <BigListButton key={saveGame.slot}
                    onClick={() => dispatch({ type: 'loadgame', saveGame })}
                    label={saveGame.name} />
            ))}
            </ul>
        </div>
    );
}

function LoadedJournal({ state, dispatch }: AppProps<LoadedJournalState>): JSX.Element {
    let logMsg = '';

    if (state.log.length > 0) {
        logMsg = state.log[state.log.length - 1];
    }

    return (
        <div {...cls('tripart-layout')}>
            <div {...cls('layout-top-left')}>
                <h1>{state.name}</h1>
                <pre role="log">{logMsg}</pre>
            </div>
            <ul {...cls('layout-bottom-left', 'unstyled-list')}>
                <BigListButton disabled={state.isBusy}
                    onClick={() => dispatch({ type: 'export', format: 'clipboard' })}
                    label="Copy to clipboard"/>
                <BigListButton disabled={state.isBusy}
                    onClick={() => saveAs('docx', state.name, dispatch)}
                    label="Save as MS Word"/>
                <BigListButton disabled={state.isBusy}
                    onClick={() => saveAs('pdf', state.name, dispatch)}
                    label="Save as PDF"/>
                <BigListButton disabled={state.isBusy}
                    onClick={() => saveAs('html', state.name, dispatch)}
                    label="Save as HTML"/>
                <BigListButton disabled={state.isBusy}
                    onClick={() => dispatch({ type: 'init' })}
                    label="Back"/>
            </ul>
            <div {...cls('layout-right', 'journal')}>
                {state.journal.asJSX({ topHeading: 'h2' })}
            </div>
        </div>
    );
}

function getFadeTime(): number {
    const rawValue = window.getComputedStyle(document.body)
      .getPropertyValue(FADE_TIME_CSS_PROP);
    const match = /^\s(\d+)ms$/.exec(rawValue);
    if (!match) {
        console.warn(
            `Unable to find or parse ${FADE_TIME_CSS_PROP} in CSS! ` +
            `Defaulting to ${DEFAULT_FADE_TIME}ms.`
        );
        return DEFAULT_FADE_TIME;
    }
    return parseInt(match[1], 10);
}

interface AppFaderState {
    shownState: AppState;
    fadeIn: boolean;
    isFadedOut: boolean;
    fadeTime: number;
}

class AppFader extends React.Component<AppProps<AppState>, AppFaderState> {
    constructor(props: AppProps<AppState>) {
        super(props);
        this.handleFadedOut = this.handleFadedOut.bind(this);
    }

    componentWillMount() {
        const currStateType = this.props.state.type;

        if (currStateType !== 'loading') {
            console.warn(
                `Expected state type at mount to be loading, ` +
                `but it is ${currStateType}.`
            );
        }

        this.setState({
            shownState: this.props.state,
            fadeIn: false,
            isFadedOut: true,
            fadeTime: getFadeTime()
        });
    }

    componentWillReceiveProps(nextProps: AppProps<AppState>) {
        const { shownState, fadeIn, isFadedOut } = this.state;
        const fadeOut = !fadeIn;
        const isFadingOut = fadeOut && !isFadedOut;
        if (shownState.type !== 'loading' && nextProps.state.type === 'loading') {
            // We've just moved from an interactive state to a loading
            // state; keep showing the interactive state, but start
            // fading out.
            this.setState({
                fadeIn: false,
                isFadedOut: false
            });
        } else if (!isFadingOut && nextProps.state.type !== 'loading') {
            // We're not in the process of fading out, so change what
            // we're showing.
            this.setState({
                shownState: nextProps.state,
                fadeIn: true
            });
        }
    }

    handleFadedOut() {
        // We've gracefully faded out; now fade-in whatever the current
        // state is. This could be a loading screen, or it could be
        // a real interactive state.
        this.setState({
            fadeIn: true,
            shownState: this.props.state,
            isFadedOut: true
        });
    }

    render() {
        const fadeIn = this.state.fadeIn;
        const state = this.state.shownState;
        const dispatch = fadeIn ? this.props.dispatch : () => {};
        const timeout = this.state.fadeTime;

        return (
            <Transition in={fadeIn} timeout={timeout} onExited={this.handleFadedOut}>
                {(tState: TransitionState) => (
                    <div {...cls('app-fader', tState)}>
                        <App state={state} dispatch={dispatch} />
                    </div>
                )}
            </Transition>
        );
    }
}

function App({ state, dispatch }: AppProps<AppState>): JSX.Element {
    switch (state.type) {
        case 'loading': return <Loading/>;

        case 'friendlyError':
        case 'error':
        return <ErrorView {...{ state, dispatch }} />;

        case 'loaded': return <Loaded {...{ state, dispatch }} />;
        case 'loadedjournal': return <LoadedJournal {...{ state, dispatch }} />;
    }
}

export function start(root: HTMLElement) {
    const store = new AppStore((state, dispatch) => {
        render(<AppFader state={state} dispatch={dispatch} />, root);
    });
    store.dispatch({ type: 'init' });
}
