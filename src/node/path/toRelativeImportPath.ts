import { toPortablePath } from './toPortablePath.js';

/*** Convert a relative filesystem path to a portable relative module import path. */
export function toRelativeImportPath(value: string): string {
  const portable = toPortablePath(value);
  return portable.startsWith('.') ? portable : `./${portable}`;
}
