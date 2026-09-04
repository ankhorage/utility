/*** Return the first item for each key while preserving insertion order. */
export function dedupeBy<T, TKey>(items: readonly T[], keyOf: (value: T) => TKey): T[] {
  const seen = new Set<TKey>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
