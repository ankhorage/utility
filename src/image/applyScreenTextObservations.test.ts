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

  test('preserves bounded OCR-only copy as grouped visual evidence', () => {
    const result = applyScreenTextObservations(graph, [
      { text: 'Build a clearer', bounds: { x: 30, y: 82, width: 140, height: 14 } },
      { text: 'understanding of', bounds: { x: 38, y: 102, width: 124, height: 14 } },
      { text: 'your decisions.', bounds: { x: 45, y: 122, width: 110, height: 14 } },
      { text: 'Learn the rules', bounds: { x: 55, y: 170, width: 90, height: 14 } },
    ]);

    expect(result.root.text).toBeUndefined();
    expect(result.root.children.map((child) => child.text).filter(Boolean)).toEqual([
      'Build a clearer understanding of your decisions.',
      'Learn the rules',
    ]);
    expect(result.root.children[1]?.id).toBe('ocr-001');
    expect(result.root.children[1]?.bounds).toEqual({
      x: 30,
      y: 82,
      width: 140,
      height: 54,
    });
  });

  test('preserves existing text evidence when applying a later OCR pass', () => {
    const first = applyScreenTextObservations(graph, [
      { text: 'Existing', bounds: { x: 20, y: 20, width: 60, height: 20 } },
    ]);
    const second = applyScreenTextObservations(first, [
      { text: 'Recovered', bounds: { x: 90, y: 20, width: 70, height: 20 } },
    ]);

    expect(second.root.children[0]?.text).toBe('Existing Recovered');
  });
});
