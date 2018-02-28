import * as fs from 'fs';
import { promisify } from 'util';

import { clipboard } from 'electron';
import { h } from 'preact';
import { render } from 'preact-render-to-string';

const writeFile = promisify(fs.writeFile);

export type TagType = 'h1'|'h2'|'p';

export interface JournalNode {
    readonly tag: TagType;
    readonly text: string;
}

export default class Journal {
    readonly nodes: JournalNode[];

    constructor(nodes: JournalNode[]) {
        this.nodes = nodes;
    }

    asMarkdown(): string {
        return this.nodes.map((node): string => {
            switch (node.tag) {
                case 'p': return node.text;
                case 'h1': return `# ${node.text}`;
                case 'h2': return `## ${node.text}`;
            }
        }).join('\n\n');
    }

    asJSX(): JSX.Element[] {
        return this.nodes.map(node => h(node.tag, {}, node.text));
    }

    asHTML(): string {
        return render(h('div', {}, this.asJSX()), null, {
            pretty: true,
            xml: false,
            shallow: false
        });
    }

    toClipboard() {
        clipboard.write({
            text: this.asMarkdown(),
            html: this.asHTML()
        });
    }

    toHTMLFile(path: string): Promise<void> {
        let title = 'Untitled Journal';

        if (this.nodes[0] && this.nodes[0].tag === 'h1') {
            title = this.nodes[0].text;
        }

        const html = [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '\t<meta charset="utf-8">',
            `\t<title>${title}</title>`,
            '</head>',
            render(h('body', {}, this.asJSX()), null, {
                pretty: true,
                xml: false,
                shallow: false
            }),
            '</html>',
        ].join('\n');
        return writeFile(path, html, 'utf-8');
    }

    static fromText(text: string): Journal {
        const ALL_UNDERSCORES = /^_+$/;
        const inputLines = text.split('\n');
        const nodes: JournalNode[] = [];
        let lastLine: string | null = null;

        inputLines.forEach((line, i) => {
            let tag: TagType = 'p';
            if (i === 0) {
                tag = 'h1';
            }
            if (ALL_UNDERSCORES.test(line) && lastLine) {
                // Convert anything with a '_____' under it into a H2.
                const lastNode = nodes[nodes.length - 1];
                nodes[nodes.length - 1] = { ...lastNode, tag: 'h2' };
                line = '';
            }
            if (line.length) {
                nodes.push({ tag, text: line });
            }
            lastLine = line;
        });

        return new Journal(nodes);
    }
}
