import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*** Resolve a filesystem path relative to the directory containing a module URL. */
export function resolveModuleRelativePath(moduleUrl: string | URL, relativePath: string): string {
  return path.resolve(path.dirname(fileURLToPath(moduleUrl)), relativePath);
}
