/***
 * Return a shallow copy with one own property set to a supplied value.
 */
export function withOwnProperty<TValue>(
  record: Readonly<Record<string, TValue>>,
  key: string,
  value: TValue,
): Record<string, TValue> {
  return { ...record, [key]: value };
}

/***
 * Return a shallow copy without one own property.
 */
export function withoutOwnProperty<TValue>(
  record: Readonly<Record<string, TValue>>,
  key: string,
): Record<string, TValue> {
  return Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));
}

/***
 * Return a shallow copy that removes a property for undefined or sets it for a defined value.
 */
export function withOptionalOwnProperty<TValue>(
  record: Readonly<Record<string, TValue>>,
  key: string,
  value: TValue | undefined,
): Record<string, TValue> {
  return value === undefined ? withoutOwnProperty(record, key) : withOwnProperty(record, key, value);
}
