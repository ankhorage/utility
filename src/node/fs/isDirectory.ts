import { lstat } from 'node:fs/promises';

/*** Return whether a filesystem path currently resolves to a directory. */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await lstat(path)).isDirectory();
  } catch {
    return false;
  }
}
