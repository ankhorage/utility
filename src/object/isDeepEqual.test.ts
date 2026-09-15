import { describe, expect, test } from 'bun:test';

import { isDeepEqual } from './isDeepEqual.js';

describe('isDeepEqual', () => {
  test('compares primitives and NaN values', () => {
    expect(isDeepEqual('value', 'value')).toBe(true);
    expect(isDeepEqual('value', 'other')).toBe(false);
    expect(isDeepEqual(Number.NaN, Number.NaN)).toBe(true);
  });

  test('compares nested arrays and records structurally', () => {
    expect(
      isDeepEqual(
        { enabled: true, nested: { values: ['a', { count: 2 }] } },
        { enabled: true, nested: { values: ['a', { count: 2 }] } },
      ),
    ).toBe(true);
  });

  test('rejects different array lengths, record keys, and value shapes', () => {
    expect(isDeepEqual([1, 2], [1])).toBe(false);
    expect(isDeepEqual({ value: 1 }, { value: 1, extra: true })).toBe(false);
    expect(isDeepEqual({ value: [1] }, { value: { 0: 1 } })).toBe(false);
  });
});
