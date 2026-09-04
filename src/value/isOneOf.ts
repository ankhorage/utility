/*** Narrow an unknown value to one of the supplied literal values. */
export function isOneOf<const TValue extends PropertyKey>(value: unknown, values: readonly TValue[]): value is TValue {
  return values.some((candidate) => candidate === value);
}
