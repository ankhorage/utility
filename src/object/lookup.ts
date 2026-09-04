/***
 * Return the first own property value accepted by a predicate from an ordered key list.
 */
export function findOwnPropertyValue<TValue>(
  target: object,
  keys: readonly PropertyKey[],
  predicate: (value: unknown, key: PropertyKey) => value is TValue,
): TValue | undefined {
  for (const key of keys) {
    if (!Object.hasOwn(target, key)) continue;
    const value = Reflect.get(target, key) as unknown;
    if (predicate(value, key)) return value;
  }
  return undefined;
}
