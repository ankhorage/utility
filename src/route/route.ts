const DYNAMIC_ROUTE_SEGMENT_PATTERN = /^\[[^.[\]]+\]$|^:[^/]+$/u;
const CATCH_ALL_ROUTE_SEGMENT_PATTERN = /^\[\.\.\.[^\]]+\]$/u;
const OPTIONAL_CATCH_ALL_ROUTE_SEGMENT_PATTERN = /^\[\[\.\.\.[^\]]+\]\]$/u;

/***
 * Return whether a route segment is an Expo-style grouping segment.
 */
export function isRouteGroupSegment(segment: string): boolean {
  return segment.startsWith('(') && segment.endsWith(')');
}

/***
 * Normalize a pathname into non-empty segments while ignoring query and hash suffixes.
 */
export function normalizePathnameSegments(pathname: string): string[] {
  const [path = ''] = pathname.trim().split(/[?#]/u, 1);
  return path.split('/').filter(Boolean);
}

/***
 * Normalize route-pattern fragments by splitting nested paths, removing route groups, and trimming edge index segments.
 */
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

/***
 * Score an exact, dynamic, catch-all, or optional-catch-all route match against pathname segments.
 */
export function scoreRoutePatternMatch(
  pattern: readonly string[],
  pathname: readonly string[],
): number | null {
  let patternIndex = 0;
  let pathnameIndex = 0;
  let score = 0;
  let exactMatch = true;

  while (patternIndex < pattern.length) {
    const routeSegment = pattern[patternIndex];
    if (routeSegment === undefined) return null;

    if (OPTIONAL_CATCH_ALL_ROUTE_SEGMENT_PATTERN.test(routeSegment)) {
      exactMatch = false;
      if (pathnameIndex < pathname.length) score += 1;
      pathnameIndex = pathname.length;
      patternIndex += 1;
      continue;
    }

    if (CATCH_ALL_ROUTE_SEGMENT_PATTERN.test(routeSegment)) {
      if (pathnameIndex >= pathname.length) return null;
      exactMatch = false;
      pathnameIndex = pathname.length;
      patternIndex += 1;
      score += 1;
      continue;
    }

    const pathnameSegment = pathname[pathnameIndex];
    if (pathnameSegment === undefined) return null;

    if (DYNAMIC_ROUTE_SEGMENT_PATTERN.test(routeSegment)) score += 10;
    else if (routeSegment === pathnameSegment) score += 100;
    else return null;

    patternIndex += 1;
    pathnameIndex += 1;
  }

  if (pathnameIndex !== pathname.length) return null;
  return score + (exactMatch ? 5 : 0);
}
