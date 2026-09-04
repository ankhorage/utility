import { expect, test } from 'bun:test';

import { resolveDropZoneRect } from './resolveDropZoneRect.js';

test('derives before, inside, and after geometry from measured Runtime bounds', () => {
  const targetRect = { x: 20, y: 40, width: 200, height: 120 };
  const draggedRect = { x: 0, y: 0, width: 100, height: 48 };

  expect(resolveDropZoneRect({ kind: 'before', targetRect, draggedRect })).toEqual({
    x: 20,
    y: 16,
    width: 200,
    height: 48,
  });
  expect(resolveDropZoneRect({ kind: 'inside', targetRect, draggedRect })).toEqual({
    x: 44,
    y: 64,
    width: 152,
    height: 72,
  });
  expect(resolveDropZoneRect({ kind: 'after', targetRect, draggedRect })).toEqual({
    x: 20,
    y: 136,
    width: 200,
    height: 48,
  });
});
