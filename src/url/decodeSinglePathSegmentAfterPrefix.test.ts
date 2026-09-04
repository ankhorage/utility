import { expect, test } from 'bun:test';

import { decodeSinglePathSegmentAfterPrefix } from './decodeSinglePathSegmentAfterPrefix.js';

test('round-trips one encoded detail segment and rejects empty, nested, or invalid input', () => {
  const prefix = '/ankh/modules/';
  const encoded = '/ankh/modules/vendor%2Fmodule%20%2F%20caf%C3%A9';

  expect(decodeSinglePathSegmentAfterPrefix(encoded, prefix)).toBe('vendor/module / café');
  expect(decodeSinglePathSegmentAfterPrefix('/ankh/modules', prefix)).toBeNull();
  expect(decodeSinglePathSegmentAfterPrefix('/ankh/modules/', prefix)).toBeNull();
  expect(decodeSinglePathSegmentAfterPrefix('/ankh/modules/module/extra', prefix)).toBeNull();
  expect(decodeSinglePathSegmentAfterPrefix('/ankh/modules/%E0%A4%A', prefix)).toBeNull();
});
