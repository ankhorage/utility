import type { WebElementLike } from './types.js';

/*** Recursively collect every descendant from a DOM-like element in depth-first order. */
export function collectWebDescendants(element: WebElementLike): WebElementLike[] {
  return Array.from(element.children).flatMap((child) => [child, ...collectWebDescendants(child)]);
}
