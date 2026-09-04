import type { Rect } from './types.js';

/*** Return whether two rectangles are equal within a numeric tolerance. */
export function rectsEqual(left: Rect, right: Rect, tolerance = 0): boolean {
  return (
    Math.abs(left.x - right.x) <= tolerance &&
    Math.abs(left.y - right.y) <= tolerance &&
    Math.abs(left.width - right.width) <= tolerance &&
    Math.abs(left.height - right.height) <= tolerance
  );
}
