import * as xml2js from 'xml2js';

// This is just a promise-ified wrapper for xml2js.parseString().
export function parseXML(content: string): Promise<any> {
    return new Promise((resolve, reject) => {
        xml2js.parseString(content, (err, result) => {
            if (err) {
                return reject(err);
            }

            resolve(result);
        });
    });
}

// This just accesses the given dotted path in the given object,
// raising a friendly error on failure, e.g.:
//
//   const obj = {a: {b: {c: 1}}};
//   friendlyGet(obj, 'a.b.c') === 1
//
// The difference between the above and simply writing 'obj.a.b.c'
// is that if it had failed because e.g. 'b' did not exist on 'a',
// the following error would have been raised:
//
//   Error: 'b' does not exist in '.a.b.c'!
export function friendlyGet(obj: any, path: string): any {
    const props = path.split('.');
    let curr: any = obj;

    props.forEach(prop => {
        if (typeof(curr) === 'object' && prop in curr) {
            curr = curr[prop];
        } else {
            throw new Error(`'${prop}' does not exist in '.${path}'!`);
        }
    });

    return curr;
}

// This converts the journal text of a Walden save game into Markdown.
export function journalTextToMarkdown(text: string): string {
    const ALL_UNDERSCORES = /^_+$/;
    const inputLines = text.split('\n');
    const lines: string[] = [];
    let lastLine: string | null = null;

    inputLines.forEach((line, i) => {
        if (i === 0) {
            // Make the very first line a H1.
            line = `# ${line}`;
        }
        if (ALL_UNDERSCORES.test(line) && lastLine) {
            // Convert anything with a '_____' under it into a H2.
            lines[lines.length - 1] = `## ${lines[lines.length - 1]}`;
            line = '';
        }
        lines.push(line);
        lastLine = line;
    });

    return lines.join('\n');
}
