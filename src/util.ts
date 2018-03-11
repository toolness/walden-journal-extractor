import * as assert from 'assert';
import * as fs from 'fs';

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

// This is just a promisified version of fs.exists().
//
// We can't just use util.promisify() because older versions of
// Node don't support it properly.
export function fileExists(path: string): Promise<boolean> {
    return new Promise(resolve => { fs.exists(path, resolve); });
}

// This is a class that wraps the getting of properties
// of an object in a runtime-checked, type-safe way, raising
// friendly errors when properties don't exist or are of the
// wrong type.
export class FriendlyGetter {
    obj: any;
    name: string;

    constructor(obj: any, name: string) {
        this.obj = obj;
        this.name = name;
    }

    getObj(key: string): FriendlyGetter {
        const val = this.obj[key];

        if (!(val && typeof(val) === 'object')) {
            throw new Error(
                `Expected "${key}" in ${this.name} to be an object`
            );
        }

        return new FriendlyGetter(val, `${this.name}["${key}"]`);
    }

    getStr(key: string): string {
        const val = this.obj[key];

        if (typeof(val) !== 'string') {
            throw new Error(
                `Expected "${key}" in ${this.name} to be a string`
            );
        }

        return val;
    }
}

// Normalize the newlines of the given string to be UNIX-like.
export function normalizeNewlines(text: string): string {
    return text.replace(/\r\n/g, '\n');
}

// Convert the given string to the given platform's newlines.
// It only really accounts for UNIX-like platforms and win32.
export function toPlatformNewlines(text: string, platform: string = process.platform): string {
    text = normalizeNewlines(text);
    if (platform === 'win32') {
        return text.split('\n').join('\r\n');
    }
    return text;
}

// This is just like assert.deepEqual(), but returns a boolen
// instead of throwing.
export function isDeepEqual(a: any, b: any): boolean {
    try {
        assert.deepEqual(a, b);
        return true;
    } catch (e) {
        return false;
    }
}
