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
    allowedChildren: ['ActionSurface', 'OptionGroup', 'MissingElement'],
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
    name: 'OptionGroup',
    category: 'component',
    description: 'Single selection group with repeated options.',
    directManifestNode: true,
    allowedChildren: [],
    events: {
      valueChange: {
        label: 'Value change',
        eventType: 'optionGroup.valueChange',
      },
    },
    blueprint: {
      label: 'Option group',
      defaultProps: {
        value: 'second',
        options: [
          { value: 'first', label: 'First' },
          { value: 'second', label: 'Second' },
          { value: 'third', label: 'Third' },
        ],
      },
    },
    props: {
      value: stringProp,
      options: {
        type: 'array',
        category: 'Content',
        itemSchema: [
          { key: 'value', schema: stringProp },
          { key: 'label', schema: stringProp },
        ],
      },
    },
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
  expect(findCandidateScore(result, 'region-001', 'ActionSurface')).toBeLessThan(0.42);
});

test('does not treat visible label text as sufficient proof of an interactive control', async () => {
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

  expect(result.root.children?.[0]?.type).toBe('MissingElement');
  expect(findCandidateScore(result, 'region-001', 'ActionSurface')).toBeLessThan(0.42);
});

test('matches repeated siblings against owner-declared structured group metadata', async () => {
  const root: ScreenImageVisualNode = {
    ...blankRoot,
    children: ['Always', 'Reflect', 'Mixed'].map((text, index) => ({
      ...blankRegion,
      id: `region-00${index + 1}`,
      bounds: { ...blankRegion.bounds, y: 100 + index * 80 },
      text,
    })),
  };
  const result = await matchScreenComponentTreeAsync({
    image: new Uint8Array(),
    root,
    components,
    screenId: 'screen',
    minConfidence: 0.42,
    unresolvedComponentName: 'MissingElement',
  });

  expect(result.root.children).toHaveLength(1);
  expect(result.root.children?.[0]?.type).toBe('OptionGroup');
  expect(result.root.children?.[0]?.props).toEqual({
    value: 'second',
    options: [
      { value: 'first', label: 'Always' },
      { value: 'second', label: 'Reflect' },
      { value: 'third', label: 'Mixed' },
    ],
  });
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
      scoreAsync: ({ component }) => Promise.resolve(component.name === 'ActionSurface' ? 1 : 0),
    },
  });

  expect(result.root.children?.[0]?.type).toBe('ActionSurface');
});

test('keeps owner component names out of matcher policy', async () => {
  const source = [
    await Bun.file('src/image/scoreScreenComponentCandidatesAsync.ts').text(),
    await Bun.file('src/image/matchScreenComponentTreeAsync.ts').text(),
  ].join('\n');

  for (const ownerName of ['Button', 'RadioGroup', 'ChoiceCard', 'SelectableCard']) {
    expect(source).not.toContain(`'${ownerName}'`);
    expect(source).not.toContain(`"${ownerName}"`);
  }
});

function findCandidateScore(
  result: Awaited<ReturnType<typeof matchScreenComponentTreeAsync>>,
  nodeId: string,
  componentName: string,
): number {
  return (
    result.candidates.find(
      (candidate) => candidate.nodeId === nodeId && candidate.componentName === componentName,
    )?.score ?? 0
  );
}
