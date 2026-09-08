import sharp from 'sharp';

import type { ScreenImageInput, ScreenImagePixels } from './types.js';

/*** Decode and normalize a screen image into deterministic RGBA pixels and PNG bytes. */
export async function loadScreenImageAsync(input: ScreenImageInput): Promise<ScreenImagePixels> {
  const source = sharp(typeof input === 'string' ? input : Buffer.from(input)).rotate().ensureAlpha();
  const { data, info } = await source.clone().raw().toBuffer({ resolveWithObject: true });
  const png = await source.clone().png().toBuffer();

  return {
    data: Uint8Array.from(data),
    png: Uint8Array.from(png),
    width: info.width,
    height: info.height,
  };
}
