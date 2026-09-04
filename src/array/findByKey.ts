/*** Find the first item whose derived key equals a requested key. */
export function findByKey<TValue, TKey>(
  values: readonly TValue[],
  key: TKey,
  keyOf: (value: TValue) => TKey,
  equals: (left: TKey, right: TKey) => boolean = Object.is,
): TValue | undefined {
  return values.find((value) => equals(keyOf(value), key));
}
