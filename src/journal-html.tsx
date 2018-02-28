import * as React from 'react';

export function fragment(elements: JSX.Element[]): JSX.Element {
    return (
        <React.Fragment>
            {elements}
        </React.Fragment>
    );
}

export function page(title: String, elements: JSX.Element[]): JSX.Element {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <title>{title}</title>
            </head>
            <body>
                {fragment(elements)}
            </body>
        </html>
    );
}
