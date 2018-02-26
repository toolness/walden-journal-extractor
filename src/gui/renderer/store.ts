import SaveGame from '../../savegame';
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

export type AppState = LoadingState | ErrorState | LoadedState;

export interface SimpleAction {
    type: 'init';
}

export interface LoadGameAction {
    type: 'loadgame';
    saveGame: SaveGame;
}

export type AppAction = SimpleAction | ErrorState | LoadedState | LoadGameAction;

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

    if (!saveGameDir) {
        return {
            type: 'friendlyError',
            message: ('Alas, I found the Walden game directory, but I was ' +
                      'unable to find any saved games.')
        };
    }
    
    const saveGames = await remote.SaveGame.retrieveAll(saveGameDir);

    return { type: 'loaded', saveGames };
}

async function loadGame(saveGame: SaveGame): Promise<AppAction> {
    throw new Error('TODO FINISH THIS');
}

function applyAction(state: AppState, action: AppAction, dispatch: Dispatcher): AppState {
    switch (action.type) {
        case 'init':
        dispatch(startLoading());
        return { type: 'loading' };

        case 'friendlyError':
        case 'error':
        case 'loaded':
        return action;

        case 'loadgame':
        dispatch(loadGame(action.saveGame));
        return { type: 'loading' };
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
