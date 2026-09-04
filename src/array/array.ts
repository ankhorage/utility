/***
 * Return whether two arrays contain equal values in the same order according to a comparator.
 */
export function arraysEqual<T>(
  left: readonly T[],
  right: readonly T[],
  equals: (leftValue: T, rightValue: T, index: number) => boolean = Object.is,
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => equals(value, right[index] as T, index))
  );
}

/***
 * Filter values through a type-guard predicate while preserving the narrowed result type.
 */
export function filterBy<TValue, TNarrowed extends TValue>(
  values: readonly TValue[],
  predicate: (value: TValue, index: number) => value is TNarrowed,
): TNarrowed[] {
  return values.filter(predicate);
}

/***
 * Find the first item whose derived key equals a requested key.
 */
export function findByKey<TValue, TKey>(
  values: readonly TValue[],
  key: TKey,
  keyOf: (value: TValue) => TKey,
  equals: (left: TKey, right: TKey) => boolean = Object.is,
): TValue | undefined {
  return values.find((value) => equals(keyOf(value), key));
}

/***
 * Return a new array with an item replaced by matching key or appended when no match exists.
 */
export function upsertBy<T, TKey>(
  items: readonly T[],
  item: T,
  keyOf: (value: T) => TKey,
): T[] {
  const key = keyOf(item);
  const index = items.findIndex((candidate) => Object.is(keyOf(candidate), key));
  if (index < 0) return [...items, item];
  return items.map((candidate, candidateIndex) => (candidateIndex === index ? item : candidate));
}

/***
 * Return the first item for each key while preserving insertion order.
 */
export function dedupeBy<T, TKey>(items: readonly T[], keyOf: (value: T) => TKey): T[] {
  const seen = new Set<TKey>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/***
 * Filter an immutable input collection and return a sorted copy of the retained values.
 */
export function filterAndSort<TValue>(
  values: readonly TValue[],
  predicate: (value: TValue) => boolean,
  compare: (left: TValue, right: TValue) => number,
): TValue[] {
  return values.filter(predicate).sort(compare);
}

/***
 * Narrow an unknown value to an array containing only strings.
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

/***
 * Remove duplicate strings and return them sorted with locale comparison.
 */
export function uniqueSortedStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
