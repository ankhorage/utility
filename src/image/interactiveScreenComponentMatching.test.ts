import type { UiComponentMeta } from '@ankhorage/contracts';
import { expect, test } from 'bun:test';

import { matchScreenComponentTreeAsync } from './matchScreenComponentTreeAsync';
import type { ScreenImageVisualNode } from './types';

const stringProp = { type: 'string', category: 'Content' } as const;

const components: readonly UiComponentMeta[] = [
  {
    name: 'Screen',
    category: 'layout',
    description: 'Screen page layout',
    directManifestNode: true,
    allowedChildren: ['ActionSurface', 'MissingElement'],
    props: {},
  },
  {
    name: 'ActionSurface',
    category: 'component',
    description: 'Runs an action when activated.',
    directManifestNode: true,
    allowedChildren: [],
    events: {
      activate: {
        label: 'Activate',
        eventType: 'actionSurface.activate',
      },
    },
    props: { label: stringProp },
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

const blankRegion: ScreenImageVisualNode = {
  id: 'region-001',
  bounds: { x: 30, y: 100, width: 240, height: 60 },
  arrangement: 'none',
  repeated: false,
  children: [],
};

const blankRoot: ScreenImageVisualNode = {
  id: 'screen',
  bounds: { x: 0, y: 0, width: 300, height: 500 },
  arrangement: 'vertical',
  repeated: false,
  children: [blankRegion],
};

test('keeps geometry-only interactive metadata below the confidence threshold', async () => {
  const result = await matchScreenComponentTreeAsync({
    image: new Uint8Array(),
    root: blankRoot,
    components,
    screenId: 'screen',
    minConfidence: 0.42,
    unresolvedComponentName: 'MissingElement',
  });

  expect(result.root.children?.[0]?.type).toBe('MissingElement');
  expect(
    result.candidates.find(
      (candidate) =>
        candidate.nodeId === 'region-001' && candidate.componentName === 'ActionSurface',
    )?.score,
  ).toBeLessThan(0.42);
});

test('allows interactive metadata when visible text can populate its owner-declared label', async () => {
  const root: ScreenImageVisualNode = {
    ...blankRoot,
    children: [{ ...blankRegion, text: 'Continue' }],
  };
  const result = await matchScreenComponentTreeAsync({
    image: new Uint8Array(),
    root,
    components,
    screenId: 'screen',
    minConfidence: 0.42,
    unresolvedComponentName: 'MissingElement',
  });

  expect(result.root.children?.[0]?.type).toBe('ActionSurface');
  expect(result.root.children?.[0]?.props).toEqual({ label: 'Continue' });
});

test('allows interactive metadata when injected visual similarity is strong enough', async () => {
  const result = await matchScreenComponentTreeAsync({
    image: new Uint8Array([1]),
    root: blankRoot,
    components,
    screenId: 'screen',
    minConfidence: 0.42,
    unresolvedComponentName: 'MissingElement',
    visualSimilarity: {
      scoreAsync: ({ component }) =>
        Promise.resolve(component.name === 'ActionSurface' ? 1 : 0),
    },
  });

  expect(result.root.children?.[0]?.type).toBe('ActionSurface');
});
