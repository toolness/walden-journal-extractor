import 'source-map-support/register'
import * as React from 'react';
import { render } from 'react-dom';

import { AppStore } from './store';
import AppFader from './app-fader';

export function start(root: HTMLElement) {
    const store = new AppStore((state, dispatch) => {
        render(<AppFader state={state} dispatch={dispatch} />, root);
    });
    store.dispatch({ type: 'init' });
}
