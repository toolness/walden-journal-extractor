import * as React from 'react';

import { AppState, ErrorState, LoadedState, Dispatcher,
         LoadedJournalState, LoadedCreditsState } from './store';
import * as config from '../../config';
import Link from './link';
import saveAs from './save-as';
import { cls } from './style';

export interface AppProps<T> {
    state: T;
    dispatch: Dispatcher;
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
            <button {...cls('bottom-right', 'muted')}
                onClick={() => dispatch({ type: 'credits' })}>
              ?
            </button>
        </div>
    );
}

function LoadedCredits({ dispatch }: AppProps<LoadedCreditsState>): JSX.Element {
    return (
        <div {...cls('simple-layout')}>
            <div {...cls('layout-top')}>
                <p>{config.productName} version {config.version}</p>
                <p>This software has been dedicated to the public domain by Atul Varma.</p>
                <p>Contributions and feedback are welcome on <Link href={config.repoUrl}>GitHub</Link>.</p>
                <p><Link href="https://www.waldengame.com/">Walden, a Game</Link> is copyright Tracy Fullerton and the Walden Team.</p>
            </div>
            <ul {...cls('layout-bottom', 'unstyled-list')}>
                <BigListButton onClick={() => dispatch({ type: 'init' })} label="Back"/>
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

export function App({ state, dispatch }: AppProps<AppState>): JSX.Element {
    switch (state.type) {
        case 'loading': return <Loading/>;

        case 'friendlyError':
        case 'error':
        return <ErrorView {...{ state, dispatch }} />;

        case 'loadedcredits': return <LoadedCredits {...{ state, dispatch}} />;
        case 'loaded': return <Loaded {...{ state, dispatch }} />;
        case 'loadedjournal': return <LoadedJournal {...{ state, dispatch }} />;
    }
}
