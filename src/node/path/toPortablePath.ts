import path from 'node:path';

/*** Convert platform-specific path separators to portable forward slashes. */
export function toPortablePath(value: string): string {
  return value.split(path.sep).join('/');
}
