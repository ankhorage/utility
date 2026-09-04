export type ExclusiveKeyedAsyncFailureReason =
  | 'exclusive_busy'
  | 'keyed_busy'
  | 'primary_busy'
  | 'secondary_busy'
  | 'secondary_exclusive_busy';

export type ExclusiveKeyedAsyncResult<TValue> =
  | { readonly ok: true; readonly value: TValue }
  | { readonly ok: false; readonly reason: ExclusiveKeyedAsyncFailureReason };

export interface ExclusiveKeyedAsyncCoordinator<TPrimaryKey, TSecondaryKey> {
  readonly isExclusiveActive: () => boolean;
  readonly hasActiveKeyed: () => boolean;
  readonly isPrimaryBusy: (key: TPrimaryKey) => boolean;
  readonly isSecondaryBusy: (key: TSecondaryKey) => boolean;
  readonly getBusyPrimaryKeys: () => ReadonlySet<TPrimaryKey>;
  readonly getBusySecondaryKeys: () => ReadonlySet<TSecondaryKey>;
  readonly getBusySecondaryExclusiveKeys: () => ReadonlySet<TSecondaryKey>;
  readonly runExclusive: <TValue>(
    operation: () => Promise<TValue>,
  ) => Promise<ExclusiveKeyedAsyncResult<TValue>>;
  readonly runKeyed: <TValue>(
    primaryKey: TPrimaryKey,
    secondaryKey: TSecondaryKey,
    operation: () => Promise<TValue>,
  ) => Promise<ExclusiveKeyedAsyncResult<TValue>>;
  readonly runSecondaryExclusive: <TValue>(
    secondaryKey: TSecondaryKey,
    operation: () => Promise<TValue>,
  ) => Promise<ExclusiveKeyedAsyncResult<TValue>>;
}

/***
 * Coordinate one whole-resource async lock, independently keyed operations, and secondary-key-exclusive operations.
 */
export function createExclusiveKeyedAsyncCoordinator<
  TPrimaryKey,
  TSecondaryKey,
>(): ExclusiveKeyedAsyncCoordinator<TPrimaryKey, TSecondaryKey> {
  let exclusiveActive = false;
  const activePrimaryKeys = new Set<TPrimaryKey>();
  const activeSecondaryKeys = new Set<TSecondaryKey>();
  const activeSecondaryExclusiveKeys = new Set<TSecondaryKey>();

  /*** Return whether the whole-resource lock is active. */
  function isExclusiveActive(): boolean {
    return exclusiveActive;
  }

  /*** Return whether at least one keyed operation is active. */
  function hasActiveKeyed(): boolean {
    return activePrimaryKeys.size > 0;
  }

  /*** Return whether a primary key is reserved by a keyed operation. */
  function isPrimaryBusy(key: TPrimaryKey): boolean {
    return activePrimaryKeys.has(key);
  }

  /*** Return whether a secondary key is reserved by either keyed or secondary-exclusive work. */
  function isSecondaryBusy(key: TSecondaryKey): boolean {
    return activeSecondaryKeys.has(key) || activeSecondaryExclusiveKeys.has(key);
  }

  /*** Return an immutable snapshot of active primary keys. */
  function getBusyPrimaryKeys(): ReadonlySet<TPrimaryKey> {
    return new Set(activePrimaryKeys);
  }

  /*** Return an immutable snapshot of secondary keys reserved by keyed operations. */
  function getBusySecondaryKeys(): ReadonlySet<TSecondaryKey> {
    return new Set(activeSecondaryKeys);
  }

  /*** Return an immutable snapshot of secondary keys reserved by secondary-exclusive operations. */
  function getBusySecondaryExclusiveKeys(): ReadonlySet<TSecondaryKey> {
    return new Set(activeSecondaryExclusiveKeys);
  }

  /*** Execute a whole-resource operation unless whole-resource or keyed work is already active. */
  async function runExclusive<TValue>(
    operation: () => Promise<TValue>,
  ): Promise<ExclusiveKeyedAsyncResult<TValue>> {
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
    if (activeSecondaryExclusiveKeys.has(secondaryKey)) {
      return { ok: false, reason: 'secondary_exclusive_busy' };
    }

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
    if (activeSecondaryExclusiveKeys.has(secondaryKey)) {
      return { ok: false, reason: 'secondary_exclusive_busy' };
    }

    activeSecondaryExclusiveKeys.add(secondaryKey);
    try {
      return { ok: true, value: await operation() };
    } finally {
      activeSecondaryExclusiveKeys.delete(secondaryKey);
    }
  }

  return {
    isExclusiveActive,
    hasActiveKeyed,
    isPrimaryBusy,
    isSecondaryBusy,
    getBusyPrimaryKeys,
    getBusySecondaryKeys,
    getBusySecondaryExclusiveKeys,
    runExclusive,
    runKeyed,
    runSecondaryExclusive,
  };
}
