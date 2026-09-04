import path from 'node:path';
import { fileURLToPath } from 'node:url';

/***
 * Resolve a filesystem path relative to the directory containing a module URL.
 */
export function resolveModuleRelativePath(moduleUrl: string | URL, relativePath: string): string {
  return path.resolve(path.dirname(fileURLToPath(moduleUrl)), relativePath);
}

/***
 * Resolve a package root relative to a module URL using a configurable ascent path.
 */
export function resolvePackageRoot(moduleUrl: string | URL, relativePath = '../..'): string {
  return resolveModuleRelativePath(moduleUrl, relativePath);
}

/***
 * Walk parent directories from a start path and return the first directory accepted by a predicate.
 */
export function findAncestorDirectory(
  startPath: string,
  matches: (directory: string) => boolean,
): string | undefined {
  let current = path.resolve(startPath);
  for (;;) {
    if (matches(current)) return current;
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}
