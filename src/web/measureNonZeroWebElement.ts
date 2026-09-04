import { toRect } from '../geometry/toRect.js';
import type { Rect } from '../geometry/types.js';
import type { WebElementLike } from './types.js';

/*** Measure an element directly and return null for zero-area geometry. */
export function measureNonZeroWebElement(element: WebElementLike): Rect | null {
  const rect = toRect(element.getBoundingClientRect());
  return rect.width > 0 && rect.height > 0 ? rect : null;
}
