import { rectsEqual } from './rectsEqual.js';
import type { Rect } from './types.js';

/*** Return whether two ordered rectangle arrays are equal within a numeric tolerance. */
export function rectArraysEqual(
  left: readonly Rect[],
  right: readonly Rect[],
  tolerance = 0,
): boolean {
  return (
    left.length === right.length &&
    left.every((rect, index) => {
      const other = right.at(index);
      return other !== undefined && rectsEqual(rect, other, tolerance);
    })
  );
}
