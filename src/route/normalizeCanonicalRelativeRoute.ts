/*** Validate a non-empty relative route without query, hash, or traversal segments. */
export function normalizeCanonicalRelativeRoute(route: string, errorMessage: string): string {
  const normalized = route.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  const segments = normalized.split('/').filter(Boolean);
  if (
    normalized.length === 0 ||
    normalized.includes('?') ||
    normalized.includes('#') ||
    segments.some((segment) => segment === '.' || segment === '..')
  ) {
    throw new Error(errorMessage);
  }
  return segments.join('/');
}
