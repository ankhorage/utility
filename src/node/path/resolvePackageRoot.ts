import { resolveModuleRelativePath } from './resolveModuleRelativePath.js';

/*** Resolve a package root relative to a module URL using a configurable ascent path. */
export function resolvePackageRoot(moduleUrl: string | URL, relativePath = '../..'): string {
  return resolveModuleRelativePath(moduleUrl, relativePath);
}
