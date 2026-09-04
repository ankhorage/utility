/*** Sanitize an arbitrary path segment to letters, digits, underscores, and hyphens with a fallback. */
export function sanitizePathSegment(value: string, fallback = 'media'): string {
  const normalized = value
    .trim()
    .replace(/[^A-Za-z0-9_-]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  return normalized || fallback;
}
