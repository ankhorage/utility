/***
 * Return whether a value is a non-empty string after trimming whitespace.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/***
 * Convert a camelCase or PascalCase identifier into a space-separated title label.
 */
export function titleCaseIdentifier(value: string): string {
  const spaced = value.replace(/([a-z0-9])([A-Z])/gu, '$1 $2').replace(/[_-]+/gu, ' ').trim();
  return spaced.length === 0 ? '' : `${spaced.charAt(0).toUpperCase()}${spaced.slice(1)}`;
}

/***
 * Normalize text for case-insensitive searching and comparison.
 */
export function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/***
 * Parse a comma-separated list into trimmed unique non-empty values while preserving order.
 */
export function parseCommaSeparatedList(value: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of value.split(',')) {
    const normalized = entry.trim();
    if (normalized.length === 0 || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}
