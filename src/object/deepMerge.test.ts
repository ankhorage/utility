import { describe, expect, test } from 'bun:test';

import { deepMerge } from './deepMerge.js';

describe('deepMerge', () => {
  test('merges nested records without mutating either input', () => {
    const target = {
      mode: 'light',
      tokens: { spacing: { s: 4, m: 8 }, weights: { regular: 400 } },
    };
    const source = {
      tokens: { spacing: { m: 10 } },
    };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      mode: 'light',
      tokens: { spacing: { s: 4, m: 10 }, weights: { regular: 400 } },
    });
    expect(target.tokens.spacing.m).toBe(8);
    expect(source.tokens.spacing.m).toBe(10);
  });

  test('replaces arrays and scalar values instead of merging them', () => {
    const result = deepMerge(
      { values: [1, 2], nested: { enabled: false } },
      { values: [3], nested: { enabled: true } },
    );

    expect(result).toEqual({ values: [3], nested: { enabled: true } });
  });

  test('ignores undefined source values and keeps target values', () => {
    const result = deepMerge(
      { id: 'theme', nested: { value: 1 } },
      { id: undefined, nested: undefined },
    );

    expect(result).toEqual({ id: 'theme', nested: { value: 1 } });
  });

  test('adds defined source-only properties', () => {
    const target: { id: string; description?: string } = { id: 'theme' };
    const result = deepMerge(target, { description: 'Theme' });

    expect(result).toEqual({ id: 'theme', description: 'Theme' });
  });
});
