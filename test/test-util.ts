import { expect } from 'chai';

import * as util from '../src/util';

describe('normalizeNewlines()', () => {
    it('works with windows-style newlines', () => {
        expect(util.normalizeNewlines('foo\r\nbar\r\n'))
          .to.eq('foo\nbar\n');
    });

    it('works with OS X-style newlines', () => {
        expect(util.normalizeNewlines('foo\nbar\n'))
          .to.eq('foo\nbar\n');
    });
});

describe('toPlatformNewlines()', () => {
    it('works on darwin', () => {
        expect(util.toPlatformNewlines('foo\r\nbar\r\n', 'darwin'))
          .to.eq('foo\nbar\n');
    });

    it('works on win32', () => {
        expect(util.toPlatformNewlines('foo\nbar\n', 'win32'))
          .to.eq('foo\r\nbar\r\n');
    });

    it('is idempotent', () => {
        const a = util.toPlatformNewlines('foo\nbar\n', 'win32');
        const b = util.toPlatformNewlines(a, 'win32');
        expect(a).to.eq(b);
    });
});
