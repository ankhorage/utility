export interface TrimmedText {
  readonly text: string;
  readonly truncated: boolean;
  readonly originalLength: number;
}

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

/***
 * Join scalar key parts into one stable composite key using a configurable delimiter.
 */
export function createCompositeKey(
  parts: readonly (boolean | number | string | null | undefined)[],
  delimiter = ':',
): string {
  return parts.map((part) => (part === null || part === undefined ? '' : String(part))).join(delimiter);
}

/***
 * Trim whitespace and limit a string to a maximum length with an optional suffix.
 */
export function truncateText(value: string, maxLength: number, suffix = '…'): string {
  const normalized = value.trim();
  if (maxLength <= 0) return '';
  if (normalized.length <= maxLength) return normalized;
  if (suffix.length >= maxLength) return suffix.slice(0, maxLength);
  return `${normalized.slice(0, maxLength - suffix.length)}${suffix}`;
}

/***
 * Limit text to a maximum character count while preserving original length and reporting truncation.
 */
export function trimOutput(
  text: string,
  maxChars: number,
  createMarker: (omittedCharacters: number) => string = (omitted) =>
    `\n...[truncated ${omitted} chars]`,
): TrimmedText {
  if (maxChars <= 0) {
    return { text: '', truncated: text.length > 0, originalLength: text.length };
  }
  if (text.length <= maxChars) {
    return { text, truncated: false, originalLength: text.length };
  }

  const marker = createMarker(text.length - maxChars);
  const nextText =
    marker.length >= maxChars
      ? marker.slice(0, maxChars)
      : `${text.slice(0, maxChars - marker.length)}${marker}`;
  return { text: nextText, truncated: true, originalLength: text.length };
}

/***
 * Serialize a value as formatted JSON and optionally truncate the resulting text.
 */
export function stringifyJson(
  value: unknown,
  options: { readonly space?: number; readonly maxLength?: number; readonly suffix?: string } = {},
): string {
  const serialized = JSON.stringify(value, null, options.space ?? 2);
  if (options.maxLength === undefined) return serialized;
  return truncateText(serialized, options.maxLength, options.suffix ?? '…');
}
