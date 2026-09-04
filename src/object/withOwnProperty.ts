/*** Return a shallow copy with one own property set to a supplied value. */
export function withOwnProperty<TValue>(
  record: Readonly<Record<string, TValue>>,
  key: string,
  value: TValue,
): Record<string, TValue> {
  return { ...record, [key]: value };
}
