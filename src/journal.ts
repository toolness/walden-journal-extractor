import * as fs from 'fs';
import { promisify } from 'util';

import { clipboard } from 'electron';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as docx from 'docx';

import * as journalHtml from './journal-html';
import { toPlatformNewlines, normalizeNewlines } from './util';

const writeFile = promisify(fs.writeFile);

export type HeadingTagType = 'h1'|'h2';

export type TagType = HeadingTagType|'p';

export interface JournalNode {
    readonly tag: TagType;
    readonly text: string;
}

function heading(tag: TagType, topHeading: HeadingTagType): string {
    if (topHeading === 'h1') {
        return tag;
    }

    switch (tag) {
        case 'h1': return 'h2';
        case 'h2': return 'h3';
        default: return tag;
    }
}

function toDocxTextRun(node: JournalNode): docx.TextRun {
    const run = new docx.TextRun(node.text);

    switch (node.tag) {
        case 'h1': return run.bold().size(48);
        case 'h2': return run.bold().size(36);
        case 'p': return run;
    }
}

interface JSXOptions {
    topHeading: HeadingTagType;
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

    asDocx(): docx.Document {
        const doc = new docx.Document();

        this.nodes.forEach((node, i) => {
            if (i > 0) {
                doc.addParagraph(new docx.Paragraph());
            }

            const textRun = toDocxTextRun(node);
            doc.addParagraph(new docx.Paragraph().addRun(textRun));
        });

        return doc;
    }

    asJSX(options: JSXOptions = { topHeading: 'h1' }): JSX.Element[] {
        return this.nodes.map((node, i) => {
            const tag = heading(node.tag, options.topHeading);
            return React.createElement(tag, {
                key: i
            }, node.text)
        });
    }

    asHTML(): string {
        return renderToStaticMarkup(journalHtml.fragment(this.asJSX()));
    }

    toClipboard() {
        clipboard.write({
            text: toPlatformNewlines(this.asMarkdown()),
            html: toPlatformNewlines(this.asHTML())
        });
    }

    toDocxFile(path: string): Promise<void> {
        const doc = this.asDocx();
        const exporter = new docx.LocalPacker(doc);
        return exporter.pack(path);
    }

    toPDFFile(path: string): Promise<void> {
        const doc = this.asDocx();
        const exporter = new docx.LocalPacker(doc);
        return exporter.packPdf(path);
    }

    toHTMLFile(path: string): Promise<void> {
        let title = 'Untitled Journal';

        if (this.nodes[0] && this.nodes[0].tag === 'h1') {
            title = this.nodes[0].text;
        }

        const jsx = journalHtml.page(title, this.asJSX());
        const html = '<!DOCTYPE html>\n' + renderToStaticMarkup(jsx);
        return writeFile(path, toPlatformNewlines(html), 'utf-8');
    }

    static fromText(text: string): Journal {
        const ALL_UNDERSCORES = /^_+$/;
        const inputLines = normalizeNewlines(text).split('\n');
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
