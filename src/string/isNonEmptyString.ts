/*** Return whether a value is a non-empty string after trimming whitespace. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
