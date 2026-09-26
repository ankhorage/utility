/*** Trim strings, discard empty values, and preserve first-occurrence order. */
export function uniqueNonEmptyStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
