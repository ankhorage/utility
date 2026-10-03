import { describe, expect, test } from 'bun:test';

import { applySelectionIntent } from './applySelectionIntent.js';

describe('applySelectionIntent', () => {
  test('replaces the current selection', () => {
    expect(applySelectionIntent(['a', 'b'], 'c', 'replace')).toEqual(['c']);
  });

  test('reuses an unchanged single replacement', () => {
    const selected = ['a'] as const;
    expect(applySelectionIntent(selected, 'a', 'replace')).toBe(selected);
  });

  test('adds an unselected value in stable order', () => {
    expect(applySelectionIntent(['a'], 'b', 'toggle')).toEqual(['a', 'b']);
  });

  test('removes an already-selected value', () => {
    expect(applySelectionIntent(['a', 'b', 'c'], 'b', 'toggle')).toEqual(['a', 'c']);
  });
});
