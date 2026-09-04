/***
 * Return whether an unknown value is a non-null, non-array record.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/***
 * Narrow an unknown value to a record, or return undefined when it is not one.
 */
export function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

/***
 * Read an own property without traversing the prototype chain.
 */
export function readOwnProperty<T>(target: object, key: PropertyKey): T | undefined {
  if (!Object.hasOwn(target, key)) return undefined;
  return Reflect.get(target, key) as T | undefined;
}

/***
 * Define an enumerable, writable, configurable own data property on an object.
 */
export function setOwnProperty(target: object, key: PropertyKey, value: unknown): void {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}

/***
 * Delete an own property when present and report whether the deletion succeeded.
 */
export function deleteOwnProperty(target: object, key: PropertyKey): boolean {
  return Object.hasOwn(target, key) && Reflect.deleteProperty(target, key);
}

/***
 * Return whether every own enumerable string key belongs to the allowed key set.
 */
export function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

/***
 * Return whether a record has no own enumerable string keys.
 */
export function isEmptyRecord(value: Record<string, unknown>): boolean {
  return Object.keys(value).length === 0;
}

/***
 * Narrow an unknown value to a record whose values all satisfy the supplied predicate.
 */
export function isRecordOf<T>(
  value: unknown,
  predicate: (candidate: unknown) => candidate is T,
): value is Record<string, T> {
  return isRecord(value) && Object.values(value).every(predicate);
}
