import type { Rect } from './types.js';

/*** Convert a left/top rectangle shape into the canonical x/y rectangle shape. */
export function toRect(value: {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}): Rect {
  return { x: value.left, y: value.top, width: value.width, height: value.height };
}
