export interface KeyedMultiValueRegistry<TKey, TValue> {
  readonly getValues: () => ReadonlyMap<TKey, ReadonlySet<TValue>>;
  readonly register: (key: TKey, value: TValue) => () => void;
}

/***
 * Create a keyed multi-value registry with idempotent unregister callbacks and optional change notifications.
 */
export function createKeyedMultiValueRegistry<TKey, TValue>(options?: {
  readonly onChange?: () => void;
}): KeyedMultiValueRegistry<TKey, TValue> {
  const values = new Map<TKey, Set<TValue>>();

  /*** Register one value under a key and return an idempotent unregister callback. */
  function register(key: TKey, value: TValue): () => void {
    const keyValues = values.get(key) ?? new Set<TValue>();
    keyValues.add(value);
    values.set(key, keyValues);
    options?.onChange?.();

    let registered = true;
    return () => {
      if (!registered) return;
      registered = false;
      const currentValues = values.get(key);
      if (!currentValues?.delete(value)) return;
      if (currentValues.size === 0) values.delete(key);
      options?.onChange?.();
    };
  }

  return { getValues: () => values, register };
}

export interface KeyedValueStore<TKey, TValue> {
  readonly list: () => readonly TValue[];
  readonly get: (key: TKey) => TValue | null;
  readonly set: (value: TValue) => void;
  readonly delete: (key: TKey) => void;
  readonly deleteWhere: (predicate: (value: TValue, key: TKey) => boolean) => readonly TValue[];
}

/***
 * Create an in-memory keyed value store with replacement semantics and predicate-based delete-and-return support.
 */
export function createKeyedValueStore<TKey, TValue>(
  keyOf: (value: TValue) => TKey,
): KeyedValueStore<TKey, TValue> {
  const values = new Map<TKey, TValue>();

  /*** Return all stored values in map insertion order. */
  function list(): readonly TValue[] {
    return [...values.values()];
  }

  /*** Resolve one stored value by key, normalizing a miss to null. */
  function get(key: TKey): TValue | null {
    return values.get(key) ?? null;
  }

  /*** Insert or replace a value using its derived key. */
  function set(value: TValue): void {
    values.set(keyOf(value), value);
  }

  /*** Delete one value by key. */
  function deleteValue(key: TKey): void {
    values.delete(key);
  }

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

  return { list, get, set, delete: deleteValue, deleteWhere };
}
