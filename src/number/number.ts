/***
 * Parse a finite number from a string, returning null for blank or invalid input.
 */
export function parseFiniteNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/***
 * Parse a finite non-negative number from a string, returning null for blank, invalid, or negative input.
 */
export function parseNonNegativeNumber(value: string): number | null {
  const parsed = parseFiniteNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}
