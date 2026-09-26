import { stat } from 'node:fs/promises';

/*** Report whether stat finds a path while propagating failures other than ENOENT. */
export async function statPathExistsAsync(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return false;
    throw error;
  }
}
