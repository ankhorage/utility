import { describe, expect, test } from 'bun:test';

import { applySelectionIntent } from './applySelectionIntent.js';

describe('applySelectionIntent', () => {
  test('replaces the current selection', () => {
    expect(applySelectionIntent(['a', 'b'], 'c', 'replace')).toEqual(['c']);
  });

  test('clears a repeated lone replacement', () => {
    expect(applySelectionIntent(['a'], 'a', 'replace')).toEqual([]);
  });

  test('reduces a multi-selection to the activated replacement', () => {
    expect(applySelectionIntent(['a', 'b'], 'a', 'replace')).toEqual(['a']);
  });

  test('adds an unselected value in stable order', () => {
    expect(applySelectionIntent(['a'], 'b', 'toggle')).toEqual(['a', 'b']);
  });

  test('removes an already-selected value', () => {
    expect(applySelectionIntent(['a', 'b', 'c'], 'b', 'toggle')).toEqual(['a', 'c']);
  });
});
