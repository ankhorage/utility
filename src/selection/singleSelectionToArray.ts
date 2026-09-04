/*** Adapt a nullable single selection into a zero-or-one selected-values array. */
export function singleSelectionToArray<TValue>(value: TValue | null): readonly TValue[] {
  return value === null ? [] : [value];
}
