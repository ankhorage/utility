import { describe, expect, test } from 'bun:test';

import { applyScreenTextObservations } from './applyScreenTextObservations';
import type { ScreenImageVisualGraph } from './types';

const graph: ScreenImageVisualGraph = {
  width: 200,
  height: 200,
  root: {
    id: 'screen',
    bounds: { x: 0, y: 0, width: 200, height: 200 },
    arrangement: 'vertical',
    repeated: false,
    children: [
      {
        id: 'region-001',
        bounds: { x: 10, y: 10, width: 180, height: 60 },
        arrangement: 'none',
        repeated: false,
        children: [],
      },
    ],
  },
};

describe('applyScreenTextObservations', () => {
  test('assigns bounded text to the smallest containing visual node', () => {
    const result = applyScreenTextObservations(graph, [
      { text: 'Discover', bounds: { x: 20, y: 20, width: 60, height: 20 } },
    ]);

    expect(result.root.children[0]?.text).toBe('Discover');
    expect(result.root.text).toBeUndefined();
  });

  test('assigns unbounded OCR text to the screen root', () => {
    expect(applyScreenTextObservations(graph, [{ text: 'Fallback text' }]).root.text).toBe(
      'Fallback text',
    );
  });
});
