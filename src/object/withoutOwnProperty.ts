/*** Return a shallow copy without one own property. */
export function withoutOwnProperty<TValue>(
  record: Readonly<Record<string, TValue>>,
  key: string,
): Record<string, TValue> {
  return Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));
}
