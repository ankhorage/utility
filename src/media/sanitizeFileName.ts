/*** Sanitize a possibly path-qualified filename while preserving safe dots, underscores, and hyphens. */
export function sanitizeFileName(value: string, fallback = 'asset'): string {
  const baseName = value.trim().split(/[\\/]/u).at(-1) ?? '';
  const normalized = baseName.replace(/[^A-Za-z0-9._-]+/gu, '-').replace(/^\.+/u, '');
  return normalized || fallback;
}
