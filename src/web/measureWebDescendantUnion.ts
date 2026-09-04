import type { Rect } from '../geometry/types.js';
import { unionRects } from '../geometry/unionRects.js';
import { measureRenderedWebBoxes } from './measureRenderedWebBoxes.js';
import type { WebElementLike } from './types.js';

/*** Measure rendered descendant boxes and return their union rectangle. */
export function measureWebDescendantUnion(element: WebElementLike): Rect | null {
  return unionRects(Array.from(element.children).flatMap(measureRenderedWebBoxes));
}
