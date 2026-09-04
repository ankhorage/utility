/*** Read the first path segment after a required prefix and decode it, preserving the encoded segment when decoding fails. */
export function decodeFirstPathSegmentAfterPrefix(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) return null;
  const [encodedSegment] = pathname.slice(prefix.length).split('/');
  if (!encodedSegment) return null;
  try {
    return decodeURIComponent(encodedSegment);
  } catch {
    return encodedSegment;
  }
}
