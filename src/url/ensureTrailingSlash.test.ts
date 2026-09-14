import { expect, test } from 'bun:test';

import { ensureTrailingSlash } from './ensureTrailingSlash.js';

test('adds a trailing slash when missing', () => {
  expect(ensureTrailingSlash('https://registry.npmjs.org')).toBe('https://registry.npmjs.org/');
});

test('preserves an existing trailing slash', () => {
  expect(ensureTrailingSlash('https://registry.npmjs.org/')).toBe('https://registry.npmjs.org/');
});

test('turns an empty value into a slash', () => {
  expect(ensureTrailingSlash('')).toBe('/');
});
