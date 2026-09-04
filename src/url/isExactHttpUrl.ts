/*** Return whether a string is an exact HTTP(S) URL candidate without wildcard syntax. */
export function isExactHttpUrl(value: string): boolean {
  return /^https?:\/\//u.test(value) && !value.includes('*');
}
