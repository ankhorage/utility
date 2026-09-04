import { parseFiniteNumber } from './parseFiniteNumber.js';

/*** Parse a finite non-negative number from a string, returning null for blank, invalid, or negative input. */
export function parseNonNegativeNumber(value: string): number | null {
  const parsed = parseFiniteNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}
