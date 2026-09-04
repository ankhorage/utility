import type { KeyedMultiValueRegistry } from './types.js';

/*** Create a keyed multi-value registry with idempotent unregister callbacks and optional change notifications. */
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
