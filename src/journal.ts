export type TagType = 'h1'|'h2'|'p';

export interface JournalNode {
    tag: TagType;
    text: string;
}

export default class Journal {
    nodes: JournalNode[];

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
                nodes[nodes.length - 1].tag = 'h2';
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
