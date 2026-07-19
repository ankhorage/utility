import { expect, test } from 'bun:test';

import { EMAIL_PATTERN, URL_PATTERN, isEmailLike, isUrlLike } from './index.js';

test('recognizes practical email-like values', () => {
  expect(isEmailLike('hello@example.com')).toBe(true);
  expect(isEmailLike('hello@example')).toBe(false);
  expect(isEmailLike('hello example.com')).toBe(false);
  expect(EMAIL_PATTERN.test('team+dev@ankhorage.com')).toBe(true);
});

test('recognizes HTTP and HTTPS URL-like values', () => {
  expect(isUrlLike('https://ankhorage.com')).toBe(true);
  expect(isUrlLike('http://localhost:3000/path')).toBe(true);
  expect(isUrlLike('ftp://ankhorage.com')).toBe(false);
  expect(isUrlLike('https://ankhorage.com/has space')).toBe(false);
  expect(URL_PATTERN.test('https://example.com?q=1')).toBe(true);
});
