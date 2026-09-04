/*** Return whether a route segment is an Expo-style grouping segment. */
export function isRouteGroupSegment(segment: string): boolean {
  return segment.startsWith('(') && segment.endsWith(')');
}
