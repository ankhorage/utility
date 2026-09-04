/*** Read exactly one URL-encoded segment after a required prefix and reject empty, nested, or undecodable values. */
export function decodeSinglePathSegmentAfterPrefix(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) return null;
  const remainder = pathname.slice(prefix.length);
  if (!remainder || remainder.includes('/')) return null;
  try {
    return decodeURIComponent(remainder) || null;
  } catch {
    return null;
  }
}
