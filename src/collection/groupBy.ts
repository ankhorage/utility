/*** Group items by key while preserving first-seen key order and item order within each group. */
export function groupBy<T, TKey>(items: readonly T[], keyOf: (item: T) => TKey): Map<TKey, T[]> {
  const groups = new Map<TKey, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const existing = groups.get(key);
    if (existing) existing.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}
