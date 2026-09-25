/*** Convert arbitrary text to a lowercase ASCII-alphanumeric slug separated by single hyphens. */
export function slugifyAscii(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
}
