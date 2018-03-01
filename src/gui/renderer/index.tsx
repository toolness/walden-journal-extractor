import 'source-map-support/register'
import * as React from 'react';
import { render } from 'react-dom';

import { AppStore, AppState, ErrorState, LoadedState, Dispatcher,
         LoadedJournalState } from './store';
import saveAs from './save-as';

type CssClass =
    'simple-layout' | 'layout-top' | 'huge-logo' | 'all-caps' | 'layout-bottom' |
    'unstyled-list' | 'big' | 'tripart-layout' | 'layout-top-left' |
    'layout-bottom-left' | 'layout-right' | 'journal';

interface AppProps<T> {
    state: T;
    dispatch: Dispatcher;
}

function cls(...names: CssClass[]): { className: string } {
    return { className: names.join(' ') };
}

function BigListButton(props: { onClick: () => void, label: string }): JSX.Element {
    return (
        <li>
            <button {...cls('big')} onClick={props.onClick}>{props.label}</button>
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
    return (
        <div {...cls('tripart-layout')}>
            <div {...cls('layout-top-left')}>
                <h1>{state.name}</h1>
                <pre role="log">
                {state.log.map((msg, i) => <div key={i}>{msg}</div>)}
                </pre>
            </div>
            <ul {...cls('layout-bottom-left', 'unstyled-list')}>
                <BigListButton
                    onClick={() => dispatch({ type: 'export', format: 'clipboard' })}
                    label="Copy to clipboard"/>
                <BigListButton
                    onClick={() => saveAs('docx', state.name, dispatch)}
                    label="Save as MS Word"/>
                <BigListButton
                    onClick={() => saveAs('pdf', state.name, dispatch)}
                    label="Save as PDF"/>
                <BigListButton
                    onClick={() => saveAs('html', state.name, dispatch)}
                    label="Save as HTML"/>
                <BigListButton
                    onClick={() => dispatch({ type: 'init' })}
                    label="Back"/>
            </ul>
            <div {...cls('layout-right', 'journal')}>
                {state.journal.asJSX({ topHeading: 'h2' })}
            </div>
        </div>
    );
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
        render(<App state={state} dispatch={dispatch} />, root);
    });
    store.dispatch({ type: 'init' });
}
