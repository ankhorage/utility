import { expect, test } from 'bun:test';

import { consolidateScreenRegions } from './consolidateScreenRegions';
import { createScreenVisualGraph } from './createScreenVisualGraph';
import type { ScreenImageRect } from './types';

const choiceCardOne = { x: 67, y: 650, width: 719, height: 185 } as const;
const choiceCardTwo = { x: 67, y: 859, width: 719, height: 188 } as const;
const choiceCardThree = { x: 67, y: 1071, width: 719, height: 185 } as const;
const primaryAction = { x: 67, y: 1608, width: 719, height: 129 } as const;

const fragmentedScreenRegions: readonly ScreenImageRect[] = [
  { x: 107, y: 112, width: 56, height: 26 },
  { x: 110, y: 124, width: 48, height: 25 },
  { x: 68, y: 141, width: 39, height: 28 },
  { x: 105, y: 140, width: 69, height: 63 },
  { x: 177, y: 166, width: 28, height: 38 },
  { x: 207, y: 166, width: 26, height: 37 },
  { x: 67, y: 279, width: 39, height: 62 },
  { x: 107, y: 279, width: 38, height: 62 },
  { x: 150, y: 278, width: 41, height: 63 },
  { x: 196, y: 295, width: 42, height: 47 },
  { x: 243, y: 295, width: 29, height: 46 },
  { x: 473, y: 296, width: 45, height: 62 },
  { x: 68, y: 377, width: 37, height: 47 },
  { x: 106, y: 365, width: 30, height: 59 },
  { x: 139, y: 377, width: 39, height: 47 },
  { x: 217, y: 365, width: 29, height: 59 },
  { x: 271, y: 377, width: 40, height: 46 },
  { x: 316, y: 377, width: 43, height: 64 },
  choiceCardOne,
  choiceCardTwo,
  choiceCardThree,
  { x: 69, y: 1316, width: 38, height: 32 },
  primaryAction,
];

test('consolidates glyph-like root fragments without merging complete controls', () => {
  const consolidated = consolidateScreenRegions(fragmentedScreenRegions, 853, 1844);
  const graph = createScreenVisualGraph(consolidated, 853, 1844);

  expect(graph.root.children).toHaveLength(7);
  expect(consolidated).toContainEqual(choiceCardOne);
  expect(consolidated).toContainEqual(choiceCardTwo);
  expect(consolidated).toContainEqual(choiceCardThree);
  expect(consolidated).toContainEqual(primaryAction);
  expect(consolidated).toContainEqual({ x: 68, y: 112, width: 165, height: 92 });
  expect(consolidated).toContainEqual({ x: 67, y: 278, width: 451, height: 163 });
});

test('leaves isolated small regions untouched instead of inventing a group', () => {
  const isolated: readonly ScreenImageRect[] = [
    { x: 20, y: 20, width: 20, height: 20 },
    { x: 260, y: 400, width: 20, height: 20 },
  ];

  expect(consolidateScreenRegions(isolated, 300, 500)).toEqual([...isolated]);
});
