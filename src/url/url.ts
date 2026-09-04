/***
 * Set a query parameter only when an optional scalar value is present.
 */
export function setOptionalQueryParam(
  query: URLSearchParams,
  key: string,
  value: boolean | number | string | undefined,
): void {
  if (value !== undefined) query.set(key, String(value));
}

/***
 * Normalize a pathname by trimming whitespace, query/hash suffixes, duplicate slashes, and trailing slashes.
 */
export function normalizePathname(value: string): string {
  const [path = ''] = value.trim().split(/[?#]/u, 1);
  const normalized = `/${path.split('/').filter(Boolean).join('/')}`;
  return normalized === '/' ? '/' : normalized.replace(/\/+$/u, '');
}

/***
 * Read the first string value from a scalar-or-array route/search parameter.
 */
export function firstStringParam(value: string | readonly string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : value?.[0];
}

/***
 * Append one URL-encoded path segment to a path prefix.
 */
export function appendEncodedPathSegment(prefix: string, segment: string): string {
  const normalizedPrefix = normalizePathname(prefix);
  return `${normalizedPrefix === '/' ? '' : normalizedPrefix}/${encodeURIComponent(segment)}`;
}

/***
 * Return whether a pathname is equal to or nested below a path prefix.
 */
export function isPathAtOrBelow(pathname: string, prefix: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  const normalizedPrefix = normalizePathname(prefix);
  return normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`);
}

/***
 * Normalize an HTTP(S) URL and reject embedded credentials or non-HTTP protocols.
 */
export function normalizeCredentialFreeHttpUrl(value: string): string | null {
  const normalized = value.trim();
  if (normalized.length === 0) return null;

  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username.length > 0 || url.password.length > 0 || url.hostname.length === 0) return null;
    return url.toString();
  } catch {
    return null;
  }
}
