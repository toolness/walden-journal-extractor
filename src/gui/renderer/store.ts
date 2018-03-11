import * as dirs from '../../dirs';
import SaveGame from '../../savegame';
import Journal from '../../journal';
import { isDeepEqual } from '../../util';

export interface LoadingState {
    readonly type: 'loading';
}

export interface ErrorState {
    readonly type: 'error'|'friendlyError';
    readonly message: string;
}

export interface LoadedState {
    readonly type: 'loaded';
    readonly saveGames: SaveGame[];
}

export interface LoadedJournalState {
    readonly type: 'loadedjournal';
    readonly name: string;
    readonly journal: Journal;
    readonly log: string[];
    readonly isBusy: boolean;
}

export interface LoadedCreditsState {
    readonly type: 'loadedcredits';
}

export type AppState = LoadingState | ErrorState | LoadedState | LoadedJournalState |
                       LoadedCreditsState;

export interface SimpleAction {
    type: 'init'|'credits';
}

export interface LoadGameAction {
    type: 'loadgame';
    saveGame: SaveGame;
}

export interface ExportToClipboardAction {
    type: 'export';
    format: 'clipboard';
}

export type FileFormat = 'html'|'docx'|'pdf';

export interface ExportToFileAction {
    type: 'export';
    format: FileFormat;
    path: string;
}

export type ExportAction = ExportToClipboardAction | ExportToFileAction;

export type AppAction = SimpleAction | ErrorState | LoadedState | LoadGameAction |
                        LoadedJournalState | ExportAction | LoadedCreditsState;

export type Dispatcher = (action: AppAction|Promise<AppAction>) => void;

export type Renderer = (state: AppState, dispatch: Dispatcher) => void;

async function startLoading(): Promise<AppAction> {
    const waldenDir = await dirs.findWaldenDir();

    if (!waldenDir) {
        return {
            type: 'friendlyError',
            message: 'Alas, I was unable to find the Walden game directory.'
        };
    }

    const saveGameDir = await dirs.findSaveGameDir(waldenDir);
    const noSavedGamesErr: AppAction = {
        type: 'friendlyError',
        message: ('Alas, I found the Walden game directory, but I was ' +
                  'unable to find any saved games.')
    };

    if (!saveGameDir) {
        return noSavedGamesErr;
    }

    const saveGames = await SaveGame.retrieveAll(saveGameDir);

    if (saveGames.length === 0) {
        return noSavedGamesErr;
    }

    return { type: 'loaded', saveGames };
}

async function loadGame(saveGame: SaveGame): Promise<AppAction> {
    const journal = await saveGame.getJournal();

    return { type: 'loadedjournal', name: saveGame.name, journal, log: [], isBusy: false };
}

async function loadCredits(): Promise<AppAction> {
    return { type: 'loadedcredits' };
}

async function exportJournal(state: LoadedJournalState, action: ExportAction): Promise<AppAction> {
    const done = (dest: string) => ({
        ...state,
        log: [...state.log, `Journal exported to ${dest}.`],
        isDone: true
    });

    switch (action.format) {
        case 'clipboard':
        state.journal.toClipboard();
        return done('clipboard');

        case 'html':
        await state.journal.toHTMLFile(action.path);
        return done(action.path);

        case 'docx':
        await state.journal.toDocxFile(action.path);
        return done(action.path);

        case 'pdf':
        await state.journal.toPDFFile(action.path);
        return done(action.path);
    }
}

function applyAction(state: AppState, action: AppAction, dispatch: Dispatcher): AppState {
    switch (action.type) {
        case 'init':
        dispatch(startLoading());
        return { type: 'loading' };

        case 'friendlyError':
        case 'error':
        case 'loaded':
        case 'loadedjournal':
        case 'loadedcredits':
        return action;

        case 'credits':
        dispatch(loadCredits());
        return { type: 'loading' };

        case 'loadgame':
        dispatch(loadGame(action.saveGame));
        return { type: 'loading' };

        case 'export':
        if (state.type !== 'loadedjournal') {
            console.log(`Received ${action.type} action but state is ${state.type}!`);
            return state;
        }
        dispatch(exportJournal(state, action));
        return {...state, isBusy: true};
    }
}

const POLL_MS = 1000;

export class AppStore {
    private renderer: Renderer;
    private state: AppState;
    private pollTimeout: NodeJS.Timer|null;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.state = { type: 'loading' };
        this.dispatch = this.dispatch.bind(this);
        this.poll = this.poll.bind(this);
        this.pollTimeout = null;
        this.renderer(this.state, this.dispatch);
    }

    private poll(lastLoadedAction: LoadedState) {
        startLoading().then(action => {
            if (isDeepEqual(action, lastLoadedAction)) {
                this.setPolling(lastLoadedAction);
            } else {
                this.dispatch(action);
            }
        }).catch(e => {
            console.warn('Exception thrown during poll!');
            console.error(e);
            this.setPolling(lastLoadedAction);
        });
    }

    private clearPolling() {
        if (this.pollTimeout !== null) {
            clearTimeout(this.pollTimeout);
            this.pollTimeout = null;
        }
    }

    private setPolling(lastLoadedAction: LoadedState) {
        if (this.state.type === 'loaded') {
            this.pollTimeout = setTimeout(() => {
                this.poll(lastLoadedAction);
            }, POLL_MS);
        }
    }

    dispatch(action: AppAction|Promise<AppAction>) {
        if (action instanceof Promise) {
            action.then(this.dispatch).catch(e => {
                this.dispatch({
                    type: 'error',
                    message: e.message || 'Unknown error'
                });
            });
        } else {
            this.state = applyAction(this.state, action, this.dispatch);
            this.clearPolling();
            if (action.type === 'loaded') this.setPolling(action);
            this.renderer(this.state, this.dispatch);
        }
    }
}
