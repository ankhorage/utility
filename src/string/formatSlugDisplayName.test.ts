import { describe, expect, test } from 'bun:test';

import { formatSlugDisplayName } from './index.js';

describe('formatSlugDisplayName', () => {
  test.each([
    ['my-app', 'My App'],
    ['chess-trainer', 'Chess Trainer'],
    ['my---app', 'My App'],
    ['-my-app-', 'My App'],
    ['42-model', '42 Model'],
    ['my-API', 'My API'],
    ['foo_bar', 'Foo_bar'],
    ['', ''],
    ['---', ''],
  ])('formats %j as %j', (value, expected) => {
    expect(formatSlugDisplayName(value)).toBe(expected);
  });
});
