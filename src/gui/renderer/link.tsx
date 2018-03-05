import * as React from 'react';
import { shell } from 'electron';

interface LinkProps {
    href: string;
    children: any;
}

function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    shell.openExternal(e.currentTarget.href);
}

export default function Link({ href, children }: LinkProps): JSX.Element {
    return <a href={href} onClick={handleClick}>{children}</a>;
}
