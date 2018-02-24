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
