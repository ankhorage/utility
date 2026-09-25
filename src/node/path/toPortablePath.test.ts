import { describe, expect, test } from 'bun:test';

import { toPortablePath } from './toPortablePath.js';

describe('toPortablePath', () => {
  test.each([
    ['src/file.ts', 'src/file.ts'],
    ['src\\file.ts', 'src/file.ts'],
    ['src\\nested/file.ts', 'src/nested/file.ts'],
    ['..\\src\\..\\file.ts', '../src/../file.ts'],
  ])('converts %j to %j without normalizing segments', (value, expected) => {
    expect(toPortablePath(value)).toBe(expected);
  });
});
