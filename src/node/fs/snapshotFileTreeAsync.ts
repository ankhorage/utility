import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { listFilesRecursive } from './listFilesRecursive.js';

/*** Capture recursively discovered files as relative paths mapped to byte content. */
export async function snapshotFileTreeAsync(rootPath: string): Promise<Map<string, Uint8Array>> {
  const files = new Map<string, Uint8Array>();
  for (const absolutePath of await listFilesRecursive(rootPath)) {
    files.set(path.relative(rootPath, absolutePath), await readFile(absolutePath));
  }
  return files;
}
