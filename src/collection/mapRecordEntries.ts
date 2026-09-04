/*** Project own enumerable record entries into a result array. */
export function mapRecordEntries<TValue, TResult>(
  record: Readonly<Record<string, TValue>>,
  mapper: (entry: readonly [string, TValue], index: number) => TResult,
): TResult[] {
  return Object.entries(record).map(([key, value], index) => mapper([key, value], index));
}
