import { readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

import { isDirectory } from '../fs/isDirectory.js';
import { pathExists } from '../fs/pathExists.js';

/*** Discover physical node_modules roots through nested packages and Bun's package store. */
export async function listNodeModulesRootsAsync(initialRoot: string): Promise<string[]> {
  const pending = [initialRoot];
  const roots: string[] = [];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const candidate = pending.pop();
    if (!candidate || !(await pathExists(candidate))) continue;
    const resolvedRoot = await realpath(candidate);
    if (visited.has(resolvedRoot)) continue;
    visited.add(resolvedRoot);
    roots.push(resolvedRoot);

    pending.push(...(await findNestedNodeModulesPathsAsync(resolvedRoot)));
  }

  return roots;
}

/*** Find nested node_modules paths for installed packages and Bun store entries. */
async function findNestedNodeModulesPathsAsync(root: string): Promise<string[]> {
  const paths: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.name === '.bun' && entry.isDirectory()) {
      for (const storeEntry of await readdir(path.join(root, '.bun'), { withFileTypes: true })) {
        if (storeEntry.isDirectory()) {
          paths.push(path.join(root, '.bun', storeEntry.name, 'node_modules'));
        }
      }
      continue;
    }
    if (entry.name.startsWith('.')) continue;

    const entryRoot = path.join(root, entry.name);
    if (entry.name.startsWith('@')) {
      if (!(await isDirectory(entryRoot))) continue;
      for (const packageEntry of await readdir(entryRoot, { withFileTypes: true })) {
        if (packageEntry.isDirectory() || packageEntry.isSymbolicLink()) {
          paths.push(path.join(entryRoot, packageEntry.name, 'node_modules'));
        }
      }
    } else if (entry.isDirectory() || entry.isSymbolicLink()) {
      paths.push(path.join(entryRoot, 'node_modules'));
    }
  }
  return paths;
}
