/***
 * Adapt a nullable single selection into a zero-or-one selected-values array.
 */
export function singleSelectionToArray<TValue>(value: TValue | null): readonly TValue[] {
  return value === null ? [] : [value];
}

/***
 * Adapt a selected-values array into one nullable single selection using its first value.
 */
export function arrayToSingleSelection<TValue>(values: readonly TValue[]): TValue | null {
  return values[0] ?? null;
}
