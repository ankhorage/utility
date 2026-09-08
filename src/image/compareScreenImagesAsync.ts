import { loadScreenImageAsync } from './loadScreenImageAsync.js';
import type { ScreenImageComparisonResult, ScreenImageInput } from './types.js';

/*** Compare an expected screen image with a rendered candidate using normalized RGBA pixels. */
export async function compareScreenImagesAsync(input: {
  readonly expected: ScreenImageInput;
  readonly actual: ScreenImageInput;
  readonly threshold?: number;
}): Promise<ScreenImageComparisonResult> {
  const [{ default: pixelmatch }, expected, actual] = await Promise.all([
    import('pixelmatch'),
    loadScreenImageAsync(input.expected),
    loadScreenImageAsync(input.actual),
  ]);
  const dimensionsMatch = expected.width === actual.width && expected.height === actual.height;
  if (!dimensionsMatch) {
    return {
      mismatchedPixels: expected.width * expected.height,
      mismatchRatio: 1,
      dimensionsMatch,
    };
  }

  const mismatchedPixels = pixelmatch(
    expected.data,
    actual.data,
    undefined,
    expected.width,
    expected.height,
    { threshold: input.threshold ?? 0.1 },
  );
  return {
    mismatchedPixels,
    mismatchRatio: mismatchedPixels / Math.max(1, expected.width * expected.height),
    dimensionsMatch,
  };
}
