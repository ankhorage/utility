/*** Return whether an unknown Node-style error reports a non-empty directory. */
export function isDirectoryNotEmptyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    Reflect.get(error, 'code') === 'ENOTEMPTY'
  );
}
