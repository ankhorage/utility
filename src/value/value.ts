/***
 * Narrow an unknown value to a string without changing its contents.
 */
export function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/***
 * Narrow an unknown value to a trimmed non-empty string.
 */
export function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

/***
 * Narrow an unknown value to a finite number.
 */
export function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/***
 * Narrow an unknown value to one of the supplied literal values.
 */
export function isOneOf<const TValue extends PropertyKey>(
  value: unknown,
  values: readonly TValue[],
): value is TValue {
  return values.some((candidate) => candidate === value);
}
