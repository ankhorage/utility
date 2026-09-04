import type { KeyedValueStore } from './types.js';

/*** Create an in-memory keyed value store with replacement semantics and predicate-based delete-and-return support. */
export function createKeyedValueStore<TKey, TValue>(
  keyOf: (value: TValue) => TKey,
): KeyedValueStore<TKey, TValue> {
  const values = new Map<TKey, TValue>();

  /*** Delete and return every stored value accepted by a predicate. */
  function deleteWhere(predicate: (value: TValue, key: TKey) => boolean): readonly TValue[] {
    const deleted: TValue[] = [];
    for (const [key, value] of values) {
      if (!predicate(value, key)) continue;
      values.delete(key);
      deleted.push(value);
    }
    return deleted;
  }

  return {
    list: () => [...values.values()],
    get: (key) => values.get(key) ?? null,
    set: (value) => values.set(keyOf(value), value),
    delete: (key) => {
      values.delete(key);
    },
    deleteWhere,
  };
}
