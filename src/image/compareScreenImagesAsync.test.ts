import { describe, expect, test } from 'bun:test';
import sharp from 'sharp';

import { compareScreenImagesAsync } from './compareScreenImagesAsync';

/*** Create a deterministic PNG fixture without storing binary test artifacts. */
async function createPngAsync(value: number, width = 4, height = 4): Promise<Uint8Array> {
  return Uint8Array.from(
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: value, g: value, b: value, alpha: 1 },
      },
    })
      .png()
      .toBuffer(),
  );
}

describe('compareScreenImagesAsync', () => {
  test('reports zero difference for identical normalized images', async () => {
    const image = await createPngAsync(32);
    const result = await compareScreenImagesAsync({ expected: image, actual: image });

    expect(result.dimensionsMatch).toBe(true);
    expect(result.mismatchedPixels).toBe(0);
    expect(result.mismatchRatio).toBe(0);
  });

  test('reports a complete mismatch for different dimensions', async () => {
    const expected = await createPngAsync(32);
    const actual = await createPngAsync(255, 2, 2);
    const result = await compareScreenImagesAsync({ expected, actual });

    expect(result.dimensionsMatch).toBe(false);
    expect(result.mismatchRatio).toBe(1);
  });
});
