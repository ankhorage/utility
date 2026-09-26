import { readFile } from 'node:fs/promises';

import { listFilesRecursive } from './listFilesRecursive.js';

/*** Concatenate UTF-8 content of recursively discovered files matching a caller predicate. */
export async function readMatchingFilesAsync(
  rootPath: string,
  matches: (filePath: string) => boolean,
): Promise<string> {
  const files = (await listFilesRecursive(rootPath)).filter(matches);
  return (await Promise.all(files.map((filePath) => readFile(filePath, 'utf8')))).join('\n');
}
