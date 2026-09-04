import { isRouteGroupSegment } from './isRouteGroupSegment.js';

/*** Normalize route-pattern fragments by splitting nested paths, removing route groups, and trimming edge index segments. */
export function normalizeRoutePatternSegments(routePath: readonly string[]): string[] {
  const segments = routePath
    .flatMap((segment) => segment.split('/'))
    .filter(Boolean)
    .filter((segment) => !isRouteGroupSegment(segment));
  let start = 0;
  let end = segments.length;
  while (segments[start] === 'index') start += 1;
  while (end > start && segments[end - 1] === 'index') end -= 1;
  return segments.slice(start, end);
}
