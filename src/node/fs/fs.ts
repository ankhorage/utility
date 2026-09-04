import { access, lstat } from 'node:fs/promises';

/***
 * Return whether a filesystem path currently exists.
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/***
 * Return whether a filesystem path currently resolves to a directory.
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await lstat(path)).isDirectory();
  } catch {
    return false;
  }
}

/***
 * Return whether an unknown Node-style error reports a missing filesystem path.
 */
export function isMissingPathError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    Reflect.get(error, 'code') === 'ENOENT'
  );
}
