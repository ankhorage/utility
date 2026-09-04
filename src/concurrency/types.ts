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
  readonly runExclusive: <TValue>(operation: () => Promise<TValue>) => Promise<ExclusiveKeyedAsyncResult<TValue>>;
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
