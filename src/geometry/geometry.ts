export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/***
 * Return the smallest rectangle containing every supplied rectangle.
 */
export function unionRects(rects: readonly Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const [first, ...rest] = rects;
  if (!first) return null;

  const bounds = rest.reduce(
    (current, rect) => ({
      left: Math.min(current.left, rect.x),
      top: Math.min(current.top, rect.y),
      right: Math.max(current.right, rect.x + rect.width),
      bottom: Math.max(current.bottom, rect.y + rect.height),
    }),
    {
      left: first.x,
      top: first.y,
      right: first.x + first.width,
      bottom: first.y + first.height,
    },
  );

  return {
    x: bounds.left,
    y: bounds.top,
    width: bounds.right - bounds.left,
    height: bounds.bottom - bounds.top,
  };
}

/***
 * Convert a left/top rectangle shape into the canonical x/y rectangle shape.
 */
export function toRect(value: {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}): Rect {
  return { x: value.left, y: value.top, width: value.width, height: value.height };
}

/***
 * Return whether two rectangles are equal within a numeric tolerance.
 */
export function rectsEqual(left: Rect, right: Rect, tolerance = 0): boolean {
  return (
    Math.abs(left.x - right.x) <= tolerance &&
    Math.abs(left.y - right.y) <= tolerance &&
    Math.abs(left.width - right.width) <= tolerance &&
    Math.abs(left.height - right.height) <= tolerance
  );
}

/***
 * Return whether two ordered rectangle arrays are equal within a numeric tolerance.
 */
export function rectArraysEqual(
  left: readonly Rect[],
  right: readonly Rect[],
  tolerance = 0,
): boolean {
  return (
    left.length === right.length &&
    left.every((rect, index) => {
      const other = right[index];
      return other !== undefined && rectsEqual(rect, other, tolerance);
    })
  );
}
