/***
 * Group items by key while preserving first-seen key order and item order within each group.
 */
export function groupBy<T, TKey>(
  items: readonly T[],
  keyOf: (item: T) => TKey,
): Map<TKey, T[]> {
  const groups = new Map<TKey, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const existing = groups.get(key);
    if (existing) existing.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/***
 * Project own enumerable record entries into a result array.
 */
export function mapRecordEntries<TValue, TResult>(
  record: Readonly<Record<string, TValue>>,
  mapper: (entry: readonly [string, TValue], index: number) => TResult,
): TResult[] {
  return Object.entries(record).map(([key, value], index) => mapper([key, value], index));
}
