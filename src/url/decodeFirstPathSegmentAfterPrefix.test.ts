import { expect, test } from 'bun:test';

import { decodeFirstPathSegmentAfterPrefix } from './decodeFirstPathSegmentAfterPrefix.js';

test('decodes the first contextual segment after a required prefix', () => {
  const prefix = '/ankh/bindings/';

  expect(decodeFirstPathSegmentAfterPrefix('/ankh/bindings/node-1', prefix)).toBe('node-1');
  expect(decodeFirstPathSegmentAfterPrefix('/ankh/bindings/node%201', prefix)).toBe('node 1');
  expect(decodeFirstPathSegmentAfterPrefix('/ankh/apis', prefix)).toBeNull();
});
