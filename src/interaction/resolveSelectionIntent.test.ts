import { describe, expect, test } from 'bun:test';

import { resolveSelectionIntent } from './resolveSelectionIntent.js';

describe('resolveSelectionIntent', () => {
  test('replaces on an unmodified desktop activation', () => {
    expect(resolveSelectionIntent({ kind: 'pointer' })).toBe('replace');
  });

  test('toggles for Command-modified activation', () => {
    expect(resolveSelectionIntent({ kind: 'pointer', modifiers: { metaKey: true } })).toBe(
      'toggle',
    );
  });

  test('toggles for Control-modified activation', () => {
    expect(resolveSelectionIntent({ kind: 'keyboard', modifiers: { ctrlKey: true } })).toBe(
      'toggle',
    );
  });

  test('toggles touch activation without keyboard modifiers', () => {
    expect(resolveSelectionIntent({ kind: 'touch' })).toBe('toggle');
  });
});
