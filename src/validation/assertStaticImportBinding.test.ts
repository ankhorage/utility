import { expect, test } from 'bun:test';

import { assertStaticImportBinding } from './index.js';

test('accepts the supported package, alias, and relative static import forms', () => {
  for (const module of ['react', '@example/runtime', '@/screens/Home', './Home', '../Home']) {
    expect(() => assertStaticImportBinding(module, 'Home', 'Screen')).not.toThrow();
  }
});

test('rejects injection, traversal, and invalid named exports with caller-owned descriptions', () => {
  for (const module of [
    "x'; alert(1); //",
    '../../escape',
    './x/../escape',
    'x\\bad',
    'https://example.test',
  ]) {
    expect(() => assertStaticImportBinding(module, 'Home', 'Screen')).toThrow(
      'Screen has an unsafe module specifier.',
    );
  }
  for (const name of ['Home;danger', 'has space', '1st', '']) {
    expect(() => assertStaticImportBinding('@example/runtime', name, 'Adapter')).toThrow(
      'Adapter has an invalid exported symbol.',
    );
  }
});
