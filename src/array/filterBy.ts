/*** Filter values through a type-guard predicate while preserving the narrowed result type. */
export function filterBy<TValue, TNarrowed extends TValue>(
  values: readonly TValue[],
  predicate: (value: TValue, index: number) => value is TNarrowed,
): TNarrowed[] {
  return values.filter(predicate);
}
