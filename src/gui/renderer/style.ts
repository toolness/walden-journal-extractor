export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

export type CssClass =
    'simple-layout' | 'layout-top' | 'huge-logo' | 'all-caps' | 'layout-bottom' |
    'unstyled-list' | 'big' | 'tripart-layout' | 'layout-top-left' |
    'layout-bottom-left' | 'layout-right' | 'journal' | 'app-fader' |
    TransitionState;

export function cls(...names: CssClass[]): { className: string } {
    return { className: names.join(' ') };
}
