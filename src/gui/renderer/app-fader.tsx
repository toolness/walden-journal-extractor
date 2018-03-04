import * as React from 'react';
import Transition from 'react-transition-group/Transition';

import { AppState } from './store';
import { AppProps, App } from './app';
import { TransitionState, cls } from './style';

const FADE_TIME_CSS_PROP = '--fade-time';
const DEFAULT_FADE_TIME = 50;

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
    show: boolean;
    isFadedOut: boolean;
    fadeTime: number;
}

export default class AppFader extends React.Component<AppProps<AppState>, AppFaderState> {
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
            show: false,
            isFadedOut: true,
            fadeTime: getFadeTime()
        });
    }

    componentWillReceiveProps(nextProps: AppProps<AppState>) {
        const { shownState, show, isFadedOut } = this.state;
        const isFadingOut = !show && !isFadedOut;
        if (shownState.type !== 'loading' && nextProps.state.type === 'loading') {
            // We've just moved from an interactive state to a loading
            // state; keep showing the interactive state, but start
            // fading out.
            this.setState({
                show: false,
                isFadedOut: false
            });
        } else if (!isFadingOut && nextProps.state.type !== 'loading') {
            // We're not in the process of fading out, so change what
            // we're showing.
            this.setState({
                shownState: nextProps.state,
                show: true
            });
        }
    }

    handleFadedOut() {
        // We've gracefully faded out; now fade-in whatever the current
        // state is. This could be a loading screen, or it could be
        // a real interactive state.
        this.setState({
            show: true,
            shownState: this.props.state,
            isFadedOut: true
        });
    }

    render() {
        const show = this.state.show;
        const state = this.state.shownState;
        const dispatch = show ? this.props.dispatch : () => {};
        const timeout = this.state.fadeTime;

        return (
            <Transition in={show} timeout={timeout} onExited={this.handleFadedOut}>
                {(tState: TransitionState) => (
                    <div {...cls('app-fader', tState)}>
                        <App state={state} dispatch={dispatch} />
                    </div>
                )}
            </Transition>
        );
    }
}
