import { normalizePathname } from './normalizePathname.js';

/*** Return whether a pathname is equal to or nested below a path prefix. */
export function isPathAtOrBelow(pathname: string, prefix: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  const normalizedPrefix = normalizePathname(prefix);
  if (normalizedPrefix === '/') return true;
  return normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`);
}
