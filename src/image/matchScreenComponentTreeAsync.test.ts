import { describe, expect, test } from 'bun:test';
import type { UiComponentMeta } from '@ankhorage/contracts';

import { matchScreenComponentTreeAsync } from './matchScreenComponentTreeAsync';
import type { ScreenImageVisualNode } from './types';

const stringProp = { type: 'string', category: 'Content' } as const;

const components: readonly UiComponentMeta[] = [
  {
    name: 'Screen',
    category: 'layout',
    directManifestNode: true,
    allowedChildren: ['Hero', 'Stack', 'Text', 'MissingElement'],
    props: {},
  },
  {
    name: 'Hero',
    category: 'pattern',
    directManifestNode: true,
    allowedChildren: [],
    description: 'Hero section with heading and supporting text',
    i18n: {
      fields: [
        { keyProp: 'titleI18nKey', defaultTextProp: 'title' },
        { keyProp: 'descriptionI18nKey', defaultTextProp: 'description' },
      ],
    },
    props: { title: stringProp, description: stringProp },
  },
  {
    name: 'Stack',
    category: 'foundation',
    directManifestNode: true,
    allowedChildren: ['Text'],
    description: 'Vertical stack layout',
    props: {},
  },
  {
    name: 'Text',
    category: 'component',
    directManifestNode: true,
    allowedChildren: [],
    props: { text: stringProp },
  },
  {
    name: 'MissingElement',
    category: 'pattern',
    directManifestNode: true,
    allowedChildren: [],
    blueprint: {
      label: 'Missing element',
      defaultProps: { reason: 'No matching component.' },
    },
    props: { reason: stringProp },
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
  test('lets a semantic pattern consume a visual text subtree into declared props', async () => {
    const result = await matchScreenComponentTreeAsync({
      image: new Uint8Array(),
      root,
      components,
      screenId: 'home',
      minConfidence: 0.4,
    });

    expect(result.root.type).toBe('Screen');
    expect(result.root.children?.[0]?.type).toBe('Hero');
    expect(result.root.children?.[0]?.children).toBeUndefined();
    expect(result.root.children?.[0]?.props).toEqual({
      title: 'Welcome',
      description: 'Start here',
    });
  });

  test('rejects a pattern that cannot represent its visual subtree', async () => {
    const invalidHero: readonly UiComponentMeta[] = components.map((component) =>
      component.name === 'Hero'
        ? {
            name: 'Hero',
            category: 'pattern',
            directManifestNode: true,
            allowedChildren: [],
            description: 'Hero section with heading and supporting text',
            props: {},
          }
        : component,
    );
    const result = await matchScreenComponentTreeAsync({
      image: new Uint8Array(),
      root,
      components: invalidHero,
      screenId: 'home',
      minConfidence: 0.4,
    });

    expect(result.root.children?.[0]?.type).toBe('Stack');
    expect(result.root.children?.[0]?.children?.[0]?.type).toBe('Text');
  });

  test('uses optional visual similarity as additional evidence', async () => {
    const result = await matchScreenComponentTreeAsync({
      image: new Uint8Array([1]),
      root,
      components,
      screenId: 'home',
      minConfidence: 0.4,
      visualSimilarity: {
        scoreAsync: ({ component }) => Promise.resolve(component.name === 'Stack' ? 1 : 0),
      },
    });

    expect(result.candidates.some((candidate) => candidate.componentName === 'Stack')).toBe(true);
  });

  test('reports multiple ranked alternatives as ambiguity evidence', async () => {
    const result = await matchScreenComponentTreeAsync({
      image: new Uint8Array(),
      root,
      components,
      screenId: 'home',
      minConfidence: 0.4,
    });
    const alternatives = result.candidates.filter((candidate) => candidate.nodeId === 'region-001');

    expect(alternatives.length).toBeGreaterThan(1);
    expect(alternatives[0]?.score).toBeGreaterThanOrEqual(alternatives[1]?.score ?? 0);
  });

  test('uses an explicit unresolved marker instead of a low-confidence invented component', async () => {
    const blankRoot: ScreenImageVisualNode = {
      ...root,
      children: [
        {
          id: 'region-blank',
          bounds: { x: 20, y: 20, width: 160, height: 100 },
          arrangement: 'none',
          repeated: false,
          children: [],
        },
      ],
    };
    const result = await matchScreenComponentTreeAsync({
      image: new Uint8Array(),
      root: blankRoot,
      components,
      screenId: 'home',
      minConfidence: 0.9,
      unresolvedComponentName: 'MissingElement',
      visualSimilarity: {
        scoreAsync: ({ component }) => Promise.resolve(component.name === 'Screen' ? 1 : 0),
      },
    });

    expect(result.root.type).toBe('Screen');
    expect(result.root.children?.[0]?.type).toBe('MissingElement');
    expect(result.root.children?.[0]?.props).toEqual({ reason: 'No matching component.' });
    expect(result.diagnostics.some((diagnostic) => diagnostic.kind === 'unresolved')).toBe(true);
  });
});
