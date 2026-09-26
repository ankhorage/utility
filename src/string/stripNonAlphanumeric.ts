/*** Remove non-ASCII-alphanumeric characters from an identifier fragment. */
export function stripNonAlphanumeric(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '');
}
