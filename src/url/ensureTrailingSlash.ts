/*** Ensure a string ends with a trailing slash without changing an existing trailing slash. */
export function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}
