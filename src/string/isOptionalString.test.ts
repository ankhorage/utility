import { expect, test } from 'bun:test';

import { isOptionalString } from './index.js';

test('accepts absent values and every primitive string without requiring content', () => {
  for (const value of [undefined, '', ' ', 'text']) {
    expect(isOptionalString(value)).toBe(true);
  }
});

test('rejects null and non-string values', () => {
  for (const value of [null, false, 0, NaN, {}, [], ['text'], () => 'text']) {
    expect(isOptionalString(value)).toBe(false);
  }
});

test('narrows unknown values through the public string entrypoint', () => {
  const values: readonly unknown[] = [undefined, 'text', null, 0];
  const strings: (string | undefined)[] = values.filter(isOptionalString);

  expect(strings).toEqual([undefined, 'text']);
});
