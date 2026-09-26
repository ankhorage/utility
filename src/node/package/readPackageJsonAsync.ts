import { readFile } from 'node:fs/promises';

import { isRecord } from '../../object/isRecord.js';

/*** Read package.json as a record without assuming a package-specific schema. */
export async function readPackageJsonAsync(filePath: string): Promise<Record<string, unknown>> {
  const value: unknown = JSON.parse(await readFile(filePath, 'utf8'));
  if (!isRecord(value)) throw new Error(`Invalid package metadata at ${filePath}.`);
  return value;
}
