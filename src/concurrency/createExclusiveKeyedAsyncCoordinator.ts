import type { ExclusiveKeyedAsyncCoordinator, ExclusiveKeyedAsyncResult } from './types.js';

/*** Coordinate one whole-resource async lock, independently keyed operations, and secondary-key-exclusive operations. */
export function createExclusiveKeyedAsyncCoordinator<
  TPrimaryKey,
  TSecondaryKey,
>(): ExclusiveKeyedAsyncCoordinator<TPrimaryKey, TSecondaryKey> {
  let exclusiveActive = false;
  const activePrimaryKeys = new Set<TPrimaryKey>();
  const activeSecondaryKeys = new Set<TSecondaryKey>();
  const activeSecondaryExclusiveKeys = new Set<TSecondaryKey>();

  /*** Execute a whole-resource operation unless whole-resource or keyed work is already active. */
  async function runExclusive<TValue>(operation: () => Promise<TValue>): Promise<ExclusiveKeyedAsyncResult<TValue>> {
    if (exclusiveActive) return { ok: false, reason: 'exclusive_busy' };
    if (activePrimaryKeys.size > 0) return { ok: false, reason: 'keyed_busy' };
    exclusiveActive = true;
    try {
      return { ok: true, value: await operation() };
    } finally {
      exclusiveActive = false;
    }
  }

  /*** Execute an operation while atomically reserving one primary and one secondary key. */
  async function runKeyed<TValue>(
    primaryKey: TPrimaryKey,
    secondaryKey: TSecondaryKey,
    operation: () => Promise<TValue>,
  ): Promise<ExclusiveKeyedAsyncResult<TValue>> {
    if (exclusiveActive) return { ok: false, reason: 'exclusive_busy' };
    if (activePrimaryKeys.has(primaryKey)) return { ok: false, reason: 'primary_busy' };
    if (activeSecondaryKeys.has(secondaryKey)) return { ok: false, reason: 'secondary_busy' };
    if (activeSecondaryExclusiveKeys.has(secondaryKey)) return { ok: false, reason: 'secondary_exclusive_busy' };
    activePrimaryKeys.add(primaryKey);
    activeSecondaryKeys.add(secondaryKey);
    try {
      return { ok: true, value: await operation() };
    } finally {
      activeSecondaryKeys.delete(secondaryKey);
      activePrimaryKeys.delete(primaryKey);
    }
  }

  /*** Execute an operation while reserving one secondary key against keyed and peer exclusive use. */
  async function runSecondaryExclusive<TValue>(
    secondaryKey: TSecondaryKey,
    operation: () => Promise<TValue>,
  ): Promise<ExclusiveKeyedAsyncResult<TValue>> {
    if (activeSecondaryKeys.has(secondaryKey)) return { ok: false, reason: 'keyed_busy' };
    if (activeSecondaryExclusiveKeys.has(secondaryKey)) return { ok: false, reason: 'secondary_exclusive_busy' };
    activeSecondaryExclusiveKeys.add(secondaryKey);
    try {
      return { ok: true, value: await operation() };
    } finally {
      activeSecondaryExclusiveKeys.delete(secondaryKey);
    }
  }

  return {
    isExclusiveActive: () => exclusiveActive,
    hasActiveKeyed: () => activePrimaryKeys.size > 0,
    isPrimaryBusy: (key) => activePrimaryKeys.has(key),
    isSecondaryBusy: (key) => activeSecondaryKeys.has(key) || activeSecondaryExclusiveKeys.has(key),
    getBusyPrimaryKeys: () => new Set(activePrimaryKeys),
    getBusySecondaryKeys: () => new Set(activeSecondaryKeys),
    getBusySecondaryExclusiveKeys: () => new Set(activeSecondaryExclusiveKeys),
    runExclusive,
    runKeyed,
    runSecondaryExclusive,
  };
}
