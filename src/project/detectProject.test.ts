import { expect, test } from 'bun:test';

import { detectProject } from './detectProject.js';
import type { ProjectDetectionInput, ProjectTrait } from './types.js';

function expectTraits(input: ProjectDetectionInput, expectedTraits: readonly ProjectTrait[]): void {
  const detectedTraits = [...detectProject(input).traits].sort();
  expect(detectedTraits).toEqual([...expectedTraits].sort());
}

test('detects a plain TypeScript package', () => {
  expectTraits({ devDependencies: { typescript: '^5.9.3' } }, ['javascript', 'typescript']);
});

test('detects React from peer dependencies', () => {
  expectTraits({ peerDependencies: { react: '^19.0.0' } }, ['javascript', 'react']);
});

test('detects Next.js with its React and Node traits', () => {
  expectTraits({ dependencies: { next: '^16.0.0' } }, ['javascript', 'next', 'node', 'react']);
});

test('detects React Native with the React trait', () => {
  expectTraits({ dependencies: { 'react-native': '^0.82.0' } }, [
    'javascript',
    'react',
    'react-native',
  ]);
});

test('detects Expo with React Native and React traits', () => {
  expectTraits({ dependencies: { expo: '^55.0.0' } }, [
    'expo',
    'javascript',
    'react',
    'react-native',
  ]);
});

test('combines overlapping React, React Native, and Expo signals', () => {
  expectTraits(
    {
      dependencies: {
        expo: '^55.0.0',
        react: '^19.0.0',
        'react-native': '^0.82.0',
      },
    },
    ['expo', 'javascript', 'react', 'react-native'],
  );
});

test('detects Bun and Node from manifest runtime signals', () => {
  expectTraits(
    {
      engines: { node: '>=22' },
      packageManager: 'bun@1.3.13',
    },
    ['bun', 'javascript', 'node'],
  );
});

test('returns no traits for an empty manifest input', () => {
  expectTraits({}, []);
});
