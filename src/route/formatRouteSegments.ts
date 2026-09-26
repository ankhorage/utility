/*** Format route segments as a slash-delimited label with a root fallback. */
export function formatRouteSegments(segments: readonly string[], rootLabel = 'root'): string {
  return segments.length === 0 ? rootLabel : segments.join('/');
}
