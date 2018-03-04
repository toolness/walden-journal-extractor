const packageJson = require('../../package.json');

function getString(name: string): string {
    const val = packageJson[name];

    if (typeof(val) !== 'string') {
        throw new Error(
            `Expected ${name} prop of package.json to be a string`
        );
    }

    return val;
}

export const shortName = getString('name');

export const productName = getString('productName');

export const version = getString('version');
