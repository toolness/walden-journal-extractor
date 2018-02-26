import SaveGame from '../../savegame';
import * as remote from './remote';

interface LoadingState {
    type: 'loading';
}

interface ErrorState {
    type: 'error'|'friendlyError';
    message: string;
}

interface LoadedState {
    type: 'loaded';
    saveGames: SaveGame[];
}

export type AppState = LoadingState | ErrorState | LoadedState;

interface SimpleAction {
    type: 'init';
}

export type AppAction = SimpleAction | ErrorState | LoadedState;

export type Dispatcher = (action: AppAction) => void;

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

function dispatchAsync(promise: Promise<AppAction>, dispatch: Dispatcher) {
    promise.then(dispatch).catch(e => {
        dispatch({
            type: 'error',
            message: e.message || 'Unknown error'
        });
    });
}

function applyAction(state: AppState, action: AppAction, dispatch: Dispatcher): AppState {
    switch (action.type) {
        case 'init':
        dispatchAsync(startLoading(), dispatch);
        return { type: 'loading' };

        case 'friendlyError':
        case 'error':
        case 'loaded':
        return action;
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

    dispatch(action: AppAction) {
        this.state = applyAction(this.state, action, this.dispatch);
        this.renderer(this.state, this.dispatch);
    }
}
