import { describe, expect, test } from 'bun:test';
import sharp from 'sharp';

import { analyzeScreenImageAsync } from './analyzeScreenImageAsync';
import type { ScreenImageComponentMeta } from './types';

const components: readonly ScreenImageComponentMeta[] = [
  {
    name: 'Screen',
    category: 'layout',
    directManifestNode: true,
    description: 'Application screen layout',
  },
  {
    name: 'Box',
    category: 'foundation',
    directManifestNode: true,
    description: 'Container box',
  },
];

/*** Create a high-contrast UI-like screenshot fixture for real Sharp/OpenCV analysis. */
async function createScreenFixtureAsync(): Promise<Uint8Array> {
  const svg = `
    <svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="300" fill="white"/>
      <rect x="20" y="30" width="160" height="50" rx="8" fill="black"/>
      <rect x="20" y="100" width="160" height="50" rx="8" fill="black"/>
      <rect x="20" y="170" width="160" height="50" rx="8" fill="black"/>
    </svg>`;
  return Uint8Array.from(await sharp(Buffer.from(svg)).png().toBuffer());
}

describe('analyzeScreenImageAsync', () => {
  test('derives a canonical ScreenSpec locally without remote inference', async () => {
    const image = await createScreenFixtureAsync();
    const result = await analyzeScreenImageAsync(image, {
      screen: { id: 'home', name: 'Home' },
      components,
      minConfidence: 0.2,
    });

    expect(result.screen.id).toBe('home');
    expect(result.screen.name).toBe('Home');
    expect(result.screen.root.id).toBe('home-screen');
    expect(result.screen.root.type).toBe('Screen');
    expect(result.graph.width).toBe(200);
    expect(result.graph.height).toBe(300);
  });

  test('keeps OCR failure supplementary to geometry analysis', async () => {
    const image = await createScreenFixtureAsync();
    const result = await analyzeScreenImageAsync(image, {
      screen: { id: 'home', name: 'Home' },
      components,
      minConfidence: 0.2,
      ocr: {
        recognizeAsync: () => Promise.reject(new Error('fixture OCR failure')),
      },
    });

    expect(result.screen.root.type).toBe('Screen');
    expect(result.diagnostics.some((diagnostic) => diagnostic.kind === 'ocr')).toBe(true);
  });
});
