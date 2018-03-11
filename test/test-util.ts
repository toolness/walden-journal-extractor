import { expect } from 'chai';

import { toPlatformNewlines } from '../src/util';

describe('toPlatformNewlines()', () => {
    it('works on darwin', () => {
        expect(toPlatformNewlines('foo\r\nbar\r\n', 'darwin'))
          .to.eq('foo\nbar\n');
    });

    it('works on win32', () => {
        expect(toPlatformNewlines('foo\nbar\n', 'win32'))
          .to.eq('foo\r\nbar\r\n');
    });
});
