/*** Return a new array with an item replaced by matching key or appended when no match exists. */
export function upsertBy<T, TKey>(items: readonly T[], item: T, keyOf: (value: T) => TKey): T[] {
  const key = keyOf(item);
  const index = items.findIndex((candidate) => Object.is(keyOf(candidate), key));
  if (index < 0) return [...items, item];
  return items.map((candidate, candidateIndex) => (candidateIndex === index ? item : candidate));
}
