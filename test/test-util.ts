import { expect } from 'chai';

import * as util from '../src/util';

describe('toPlatformNewlines()', () => {
    it('works on darwin', () => {
        expect(util.toPlatformNewlines('foo\r\nbar\r\n', 'darwin'))
          .to.eq('foo\nbar\n');
    });

    it('works on win32', () => {
        expect(util.toPlatformNewlines('foo\nbar\n', 'win32'))
          .to.eq('foo\r\nbar\r\n');
    });
});

describe('isDeepEqual()', () => {
    it('returns true when args are equal', () => {
        expect(util.isDeepEqual({ foo: { bar: [1] } }, { foo: { bar: [1] } }))
          .to.be.true;
    });

    it('returns false when args are not equal', () => {
        expect(util.isDeepEqual({ foo: { bar: [1] } }, { foo: { bar: [5] } }))
          .to.be.false;
    });
});
