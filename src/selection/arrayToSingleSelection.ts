/*** Adapt a selected-values array into one nullable single selection using its first value. */
export function arrayToSingleSelection<TValue>(values: readonly TValue[]): TValue | null {
  return values[0] ?? null;
}
