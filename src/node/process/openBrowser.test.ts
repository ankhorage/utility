import { describe, expect, test } from 'bun:test';

import { openBrowser } from './openBrowser.js';

describe('openBrowser', () => {
  test('rejects non-http browser URLs before launching a process', () => {
    expect(() => openBrowser('file:///tmp/utility')).toThrow(
      'Unsupported browser URL protocol: file:',
    );
    expect(() => openBrowser('javascript:alert(1)')).toThrow(
      'Unsupported browser URL protocol: javascript:',
    );
  });
});
