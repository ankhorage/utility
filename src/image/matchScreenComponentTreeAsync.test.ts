import { describe, expect, test } from 'bun:test';

import { matchScreenComponentTreeAsync } from './matchScreenComponentTreeAsync';
import type { ScreenImageComponentMeta, ScreenImageVisualNode } from './types';

const components: readonly ScreenImageComponentMeta[] = [
  {
    name: 'Screen',
    category: 'layout',
    directManifestNode: true,
    allowedChildren: ['Hero', 'Stack', 'Text'],
  },
  {
    name: 'Hero',
    category: 'pattern',
    directManifestNode: true,
    allowedChildren: ['Text'],
    description: 'Hero section with heading and supporting text',
  },
  {
    name: 'Stack',
    category: 'foundation',
    directManifestNode: true,
    allowedChildren: ['Text'],
    description: 'Vertical stack layout',
  },
  {
    name: 'Text',
    category: 'component',
    directManifestNode: true,
    allowedChildren: [],
    props: { text: {} },
  },
];

const root: ScreenImageVisualNode = {
  id: 'screen',
  bounds: { x: 0, y: 0, width: 200, height: 300 },
  arrangement: 'vertical',
  repeated: false,
  children: [
    {
      id: 'region-001',
      bounds: { x: 20, y: 20, width: 160, height: 120 },
      arrangement: 'vertical',
      repeated: true,
      children: [
        {
          id: 'region-002',
          bounds: { x: 30, y: 30, width: 140, height: 30 },
          arrangement: 'none',
          repeated: false,
          text: 'Welcome',
          children: [],
        },
        {
          id: 'region-003',
          bounds: { x: 30, y: 70, width: 140, height: 30 },
          arrangement: 'none',
          repeated: false,
          text: 'Start here',
          children: [],
        },
      ],
    },
  ],
};

describe('matchScreenComponentTreeAsync', () => {
  test('prefers a valid semantic pattern over primitive decomposition', async () => {
    const result = await matchScreenComponentTreeAsync({
      image: new Uint8Array(),
      root,
      components,
      screenId: 'home',
      minConfidence: 0.4,
    });

    expect(result.root.type).toBe('Screen');
    expect(result.root.children?.[0]?.type).toBe('Hero');
    expect(result.root.children?.[0]?.children?.[0]?.props).toEqual({ text: 'Welcome' });
  });

  test('rejects a high-scoring parent when its allowed children cannot represent the subtree', async () => {
    const invalidHero = components.map((component) =>
      component.name === 'Hero' ? { ...component, allowedChildren: [] } : component,
    );
    const result = await matchScreenComponentTreeAsync({
      image: new Uint8Array(),
      root,
      components: invalidHero,
      screenId: 'home',
      minConfidence: 0.4,
    });

    expect(result.root.children?.[0]?.type).toBe('Stack');
  });

  test('uses optional visual similarity as additional evidence', async () => {
    const result = await matchScreenComponentTreeAsync({
      image: new Uint8Array([1]),
      root,
      components,
      screenId: 'home',
      minConfidence: 0.4,
      visualSimilarity: {
        scoreAsync: async ({ component }) => (component.name === 'Stack' ? 1 : 0),
      },
    });

    expect(result.candidates.some((candidate) => candidate.componentName === 'Stack')).toBe(true);
  });
});
