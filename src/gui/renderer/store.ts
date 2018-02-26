import SaveGame from '../../savegame';
import * as remote from './remote';

interface LoadingState {
    type: 'loading';
}

interface ErrorState {
    type: 'error';
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

async function startLoading(dispatch: Dispatcher) {
    try {
        const waldenDir = await remote.findWaldenDir();

        if (!waldenDir) {
            throw new Error('Unable to find Walden game dir!');
        }

        const saveGameDir = await remote.findSaveGameDir(waldenDir);

        if (!saveGameDir) {
            throw new Error('Unable to find Walden save game dir!');
        }

        const saveGames = await remote.SaveGame.retrieveAll(saveGameDir);

        dispatch({
            type: 'loaded',
            saveGames,
        });
    } catch (e) {
        dispatch({
            type: 'error',
            message: e.message || 'Unknown error'
        });
    }
}

function applyAction(state: AppState, action: AppAction, dispatch: Dispatcher): AppState {
    switch (action.type) {
        case 'init':
        startLoading(dispatch);
        return { type: 'loading' };

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
