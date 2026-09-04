/*** Normalize a pathname by trimming whitespace, query/hash suffixes, duplicate slashes, and trailing slashes. */
export function normalizePathname(value: string): string {
  const [path = ''] = value.trim().split(/[?#]/u, 1);
  const normalized = `/${path.split('/').filter(Boolean).join('/')}`;
  return normalized === '/' ? '/' : normalized.replace(/\/+$/u, '');
}
