import { describe, expect, test } from 'bun:test';
import sharp from 'sharp';

import { compareScreenImagesAsync } from './compareScreenImagesAsync';

/*** Create a deterministic PNG fixture without storing binary test artifacts. */
async function createPngAsync(value: number): Promise<Uint8Array> {
  const data = Buffer.alloc(4 * 4 * 4, value);
  for (let index = 3; index < data.length; index += 4) {
    data[index] = 255;
  }
  return Uint8Array.from(await sharp(data, { raw: { width: 4, height: 4, channels: 4 } }).png().toBuffer());
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
    const actual = Uint8Array.from(
      await sharp(Buffer.alloc(2 * 2 * 4, 255), { raw: { width: 2, height: 2, channels: 4 } })
        .png()
        .toBuffer(),
    );
    const result = await compareScreenImagesAsync({ expected, actual });

    expect(result.dimensionsMatch).toBe(false);
    expect(result.mismatchRatio).toBe(1);
  });
});
