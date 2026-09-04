/*** Split an optional comma-separated string into trimmed non-empty values while preserving duplicates and order. */
export function splitCommaSeparated(value: string | undefined): readonly string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}
