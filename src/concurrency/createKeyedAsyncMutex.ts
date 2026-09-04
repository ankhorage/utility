import type { KeyedAsyncMutex, KeyedAsyncMutexOptions } from './types.js';

/*** Coordinate async operations so only one operation per key can run at a time. */
export function createKeyedAsyncMutex<TKey>(
  options: KeyedAsyncMutexOptions<TKey> = {},
): KeyedAsyncMutex<TKey> {
  const activeKeys = new Set<TKey>();
  const createBusyError = options.createBusyError ?? (() => new Error('KEYED_ASYNC_MUTEX_BUSY'));

  /*** Run one keyed async operation while rejecting overlapping work for the same key. */
  async function run<TValue>(key: TKey, operation: () => Promise<TValue>): Promise<TValue> {
    if (activeKeys.has(key)) throw createBusyError(key);
    activeKeys.add(key);
    try {
      return await operation();
    } finally {
      activeKeys.delete(key);
    }
  }

  return {
    isBusy: (key) => activeKeys.has(key),
    run,
  };
}
