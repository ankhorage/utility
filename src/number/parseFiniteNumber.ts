/*** Parse a finite number from a string, returning null for blank or invalid input. */
export function parseFiniteNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
