/*** Filter an immutable input collection and return a sorted copy of the retained values. */
export function filterAndSort<TValue>(
  values: readonly TValue[],
  predicate: (value: TValue) => boolean,
  compare: (left: TValue, right: TValue) => number,
): TValue[] {
  return values.filter(predicate).sort(compare);
}
