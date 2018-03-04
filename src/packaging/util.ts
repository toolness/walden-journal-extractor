import { execSync } from 'child_process';

export function runSync(cmd: string) {
    execSync(cmd, { stdio: 'inherit' });
}

export class FriendlyGetter {
    obj: any;
    name: string;

    constructor(obj: any, name: string) {
        this.obj = obj;
        this.name = name;
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
