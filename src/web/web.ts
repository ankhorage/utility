import { toRect, unionRects, type Rect } from '../geometry/index.js';

export interface WebRectLike {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface WebElementLike {
  readonly children: ArrayLike<WebElementLike>;
  readonly getBoundingClientRect: () => WebRectLike;
}

/***
 * Return whether a platform identifier represents web execution.
 */
export function isWebPlatform(platform: string): boolean {
  return platform === 'web';
}

/***
 * Detect a DOM-like value that supports child traversal and bounding-rectangle measurement.
 */
export function isWebElementLike(value: unknown): value is WebElementLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'children' in value &&
    'getBoundingClientRect' in value &&
    typeof value.getBoundingClientRect === 'function'
  );
}

/***
 * Recursively collect every descendant from a DOM-like element in depth-first order.
 */
export function collectWebDescendants(element: WebElementLike): WebElementLike[] {
  return Array.from(element.children).flatMap((child) => [child, ...collectWebDescendants(child)]);
}

/***
 * Measure an element, falling through zero-area wrappers to rendered descendant boxes.
 */
export function measureRenderedWebBoxes(element: WebElementLike): readonly Rect[] {
  const rect = toRect(element.getBoundingClientRect());
  if (rect.width > 0 && rect.height > 0) return [rect];
  return Array.from(element.children).flatMap(measureRenderedWebBoxes);
}

/***
 * Measure rendered descendant boxes and return their union rectangle.
 */
export function measureWebDescendantUnion(element: WebElementLike): Rect | null {
  return unionRects(Array.from(element.children).flatMap(measureRenderedWebBoxes));
}

/***
 * Measure an element directly and return null for zero-area geometry.
 */
export function measureNonZeroWebElement(element: WebElementLike): Rect | null {
  const rect = toRect(element.getBoundingClientRect());
  return rect.width > 0 && rect.height > 0 ? rect : null;
}
