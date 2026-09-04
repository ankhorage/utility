import { expect, test } from 'bun:test';

import { createCompositeKey } from './createCompositeKey.js';

test('uses selected node identity as part of the adapter session key', () => {
  expect(createCompositeKey(['node-a', 3])).not.toBe(createCompositeKey(['node-b', 3]));
});
