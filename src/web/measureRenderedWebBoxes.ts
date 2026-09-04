import { toRect } from '../geometry/toRect.js';
import type { Rect } from '../geometry/types.js';
import type { WebElementLike } from './types.js';

/*** Measure an element, falling through zero-area wrappers to rendered descendant boxes. */
export function measureRenderedWebBoxes(element: WebElementLike): readonly Rect[] {
  const rect = toRect(element.getBoundingClientRect());
  if (rect.width > 0 && rect.height > 0) return [rect];
  return Array.from(element.children).flatMap(measureRenderedWebBoxes);
}
