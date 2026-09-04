import { expect, test } from 'bun:test';

import { resolveNavigableLocation } from './resolveNavigableLocation.js';

test('preserves search and hash when the runtime location matches the pathname', () => {
  const location = { pathname: '/orders', search: '?filter=open', hash: '#row-1' };

  expect(resolveNavigableLocation('/orders', location)).toBe('/orders?filter=open#row-1');
  expect(resolveNavigableLocation('/customers', location)).toBe('/customers');
});
