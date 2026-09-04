/*** Remove duplicate strings and return them sorted with locale comparison. */
export function uniqueSortedStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
