import type { UiComponentMeta } from '@ankhorage/contracts';
import { expect, test } from 'bun:test';

import { consumeScreenVisualRepeatedProps } from './consumeScreenVisualRepeatedProps';
import type { ScreenImageVisualNode } from './types';

const stringContent = { type: 'string', category: 'Content' } as const;
const component: UiComponentMeta = {
  name: 'RepeatedSelector',
  category: 'component',
  directManifestNode: true,
  allowedChildren: [],
  props: {
    value: { type: 'string', category: 'State' },
    label: { ...stringContent, default: 'Seed label' },
    options: {
      type: 'array',
      category: 'Content',
      itemSchema: [
        { key: 'value', schema: stringContent },
        { key: 'label', schema: stringContent },
        { key: 'description', schema: stringContent },
        { key: 'disabled', schema: { type: 'boolean', category: 'State', default: false } },
      ],
    },
    orientation: {
      type: 'enum',
      category: 'Layout',
      enum: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
    presentation: {
      type: 'enum',
      category: 'Style',
      enum: ['inline', 'card'],
      default: 'inline',
    },
    disabled: { type: 'boolean', category: 'State', default: false },
    tone: { type: 'enum', category: 'Style', enum: ['neutral', 'accent'] },
  },
  blueprint: {
    label: 'Repeated selector',
    defaultProps: {
      value: 'second',
      label: 'Seed label',
      options: [
        {
          value: 'first',
          label: 'First seed',
          description: 'Supporting detail',
          disabled: true,
        },
        {
          value: 'second',
          label: 'Second seed',
          description: 'Supporting detail',
          disabled: true,
        },
        {
          value: 'third',
          label: 'Third seed',
          description: 'Supporting detail',
          disabled: true,
        },
      ],
      orientation: 'horizontal',
      presentation: 'inline',
      disabled: true,
      tone: 'accent',
    },
  },
};

const repeatedVisual: ScreenImageVisualNode = {
  id: 'group-region-001-region-003',
  bounds: { x: 20, y: 40, width: 260, height: 220 },
  arrangement: 'vertical',
  repeated: true,
  children: ['Observed first', 'Observed second', 'Observed third'].map((text, index) => ({
    id: `region-00${index + 1}`,
    bounds: { x: 20, y: 40 + index * 80, width: 260, height: 60 },
    arrangement: 'none',
    repeated: false,
    text,
    children: [],
  })),
};

test('emits observed copy, identity scaffolding, and canonical state defaults only', () => {
  expect(consumeScreenVisualRepeatedProps(repeatedVisual, component)).toEqual({
    disabled: false,
    orientation: 'vertical',
    options: [
      { value: 'first', disabled: false, label: 'Observed first' },
      { value: 'second', disabled: false, label: 'Observed second' },
      { value: 'third', disabled: false, label: 'Observed third' },
    ],
  });
});

test('selects an owner-declared card enum only for repeated container geometry', () => {
  const cardVisual: ScreenImageVisualNode = {
    ...repeatedVisual,
    children: repeatedVisual.children.map((child, index) => {
      const { text } = child;
      if (!text) throw new Error('Expected repeated text fixture content.');
      return {
        id: child.id,
        bounds: child.bounds,
        arrangement: child.arrangement,
        repeated: child.repeated,
        children: [
          {
            id: `text-${index + 1}`,
            bounds: { x: 40, y: child.bounds.y + 18, width: 180, height: 24 },
            arrangement: 'none',
            repeated: false,
            text,
            children: [],
          },
        ],
      };
    }),
  };

  expect(consumeScreenVisualRepeatedProps(cardVisual, component)?.presentation).toBe('card');
});
