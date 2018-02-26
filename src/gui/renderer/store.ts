import SaveGame from '../../savegame';
import Journal from '../../journal';
import * as remote from './remote';

export interface LoadingState {
    type: 'loading';
}

export interface ErrorState {
    type: 'error'|'friendlyError';
    message: string;
}

export interface LoadedState {
    type: 'loaded';
    saveGames: SaveGame[];
}

export interface LoadedJournalState {
    type: 'loadedjournal';
    name: string;
    journal: Journal;
    log: string[];
}

export type AppState = LoadingState | ErrorState | LoadedState | LoadedJournalState;

export interface SimpleAction {
    type: 'init';
}

export interface LoadGameAction {
    type: 'loadgame';
    saveGame: SaveGame;
}

export interface ExportAction {
    type: 'export';
    format: 'clipboard';
}

export type AppAction = SimpleAction | ErrorState | LoadedState | LoadGameAction |
                        LoadedJournalState | ExportAction;

export type Dispatcher = (action: AppAction|Promise<AppAction>) => void;

export type Renderer = (state: AppState, dispatch: Dispatcher) => void;

async function startLoading(): Promise<AppAction> {
    const waldenDir = await remote.findWaldenDir();

    if (!waldenDir) {
        return {
            type: 'friendlyError',
            message: 'Alas, I was unable to find the Walden game directory.'
        };
    }

    const saveGameDir = await remote.findSaveGameDir(waldenDir);
    const noSavedGamesErr: AppAction = {
        type: 'friendlyError',
        message: ('Alas, I found the Walden game directory, but I was ' +
                  'unable to find any saved games.')
    };

    if (!saveGameDir) {
        return noSavedGamesErr;
    }
    
    const saveGames = await remote.SaveGame.retrieveAll(saveGameDir);

    if (saveGames.length === 0) {
        return noSavedGamesErr;
    }

    return { type: 'loaded', saveGames };
}

async function loadGame(saveGame: SaveGame): Promise<AppAction> {
    const journal = await saveGame.getJournal();

    return { type: 'loadedjournal', name: saveGame.name, journal, log: [] };
}

async function exportJournal(state: LoadedJournalState, action: ExportAction): Promise<AppAction> {
    switch (action.format) {
        case 'clipboard':
        state.journal.toClipboard();
        return { ...state, log: [...state.log, 'Journal exported to clipboard.'] };
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
        return action;

        case 'loadgame':
        dispatch(loadGame(action.saveGame));
        return { type: 'loading' };

        case 'export':
        if (state.type !== 'loadedjournal') {
            console.log(`Received ${action.type} action but state is ${state.type}!`);
            return state;
        }
        dispatch(exportJournal(state, action));
        return state;
    }
}

export class AppStore {
    private renderer: Renderer;
    private state: AppState;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.state = { type: 'loading' };
        this.dispatch = this.dispatch.bind(this);
        this.renderer(this.state, this.dispatch);
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
            this.renderer(this.state, this.dispatch);
        }
    }
}
