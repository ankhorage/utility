import { promises as fs } from 'node:fs';

/*** Remove a filesystem path recursively while tolerating an already-absent path. */
export async function removePath(pathToRemove: string): Promise<void> {
  await fs.rm(pathToRemove, { recursive: true, force: true });
}
