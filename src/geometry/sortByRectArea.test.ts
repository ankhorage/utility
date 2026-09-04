import { expect, test } from 'bun:test';

import { sortByRectArea } from './sortByRectArea.js';

test('orders nested measured targets before broad ancestor targets', () => {
  const root = { id: 'root', rect: { width: 400, height: 800 } };
  const child = { id: 'child', rect: { width: 200, height: 80 } };
  const edge = { id: 'child:before', rect: { width: 200, height: 24 } };

  expect(sortByRectArea([root, child, edge])).toEqual([edge, child, root]);
});
