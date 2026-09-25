import { describe, expect, test } from 'bun:test';

import { slugifyAscii } from './slugifyAscii.js';

describe('slugifyAscii', () => {
  test.each([
    [' Release Monitor ', 'release-monitor'],
    ['Button / primary', 'button-primary'],
    ['foo---bar', 'foo-bar'],
    ['Café Déjà Vu', 'caf-d-j-vu'],
    ['---', ''],
    ['', ''],
  ])('normalizes %j to %j', (value, expected) => {
    expect(slugifyAscii(value)).toBe(expected);
  });
});
