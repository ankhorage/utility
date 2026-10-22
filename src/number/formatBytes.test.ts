import { describe, expect, test } from 'bun:test';

import { formatBytes } from './formatBytes.js';

describe('formatBytes', () => {
  test('formats bytes and binary units with concise precision', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1_023)).toBe('1023 B');
    expect(formatBytes(1_024)).toBe('1 KB');
    expect(formatBytes(1_536)).toBe('1.5 KB');
    expect(formatBytes(1_048_576)).toBe('1 MB');
    expect(formatBytes(1_073_741_824)).toBe('1 GB');
  });

  test('normalizes invalid and non-positive values', () => {
    expect(formatBytes(-1)).toBe('0 B');
    expect(formatBytes(Number.NaN)).toBe('0 B');
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe('0 B');
  });
});
