import { expect, test } from 'bun:test';

import { isEmail, isHttpUrl, isPhone, isUsername } from './index.js';

test('validates email addresses', () => {
  expect(isEmail('hello@example.com')).toBe(true);
  expect(isEmail(' team+dev@ankhorage.com ')).toBe(true);
  expect(isEmail('hello@example')).toBe(false);
  expect(isEmail('hello@-example.com')).toBe(false);
  expect(isEmail('hello@exam_ple.com')).toBe(false);
  expect(isEmail('hello@example.c')).toBe(false);
});

test('validates phone numbers', () => {
  expect(isPhone('+41 79 123 45 67')).toBe(true);
  expect(isPhone('(044) 123-45-67')).toBe(true);
  expect(isPhone('123456')).toBe(false);
  expect(isPhone('41 +79 123 45 67')).toBe(false);
  expect(isPhone(')044( 123 45 67')).toBe(false);
});

test('validates usernames', () => {
  expect(isUsername('fabio_123')).toBe(true);
  expect(isUsername('a.b')).toBe(true);
  expect(isUsername('ab')).toBe(false);
  expect(isUsername('fabio g')).toBe(false);
});

test('validates HTTP and HTTPS URLs', () => {
  expect(isHttpUrl('https://ankhorage.com')).toBe(true);
  expect(isHttpUrl('http://localhost:3000/path')).toBe(true);
  expect(isHttpUrl('ftp://ankhorage.com')).toBe(false);
  expect(isHttpUrl('https://ankhorage.com/has space')).toBe(false);
});
