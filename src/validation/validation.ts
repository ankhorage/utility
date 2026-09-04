export interface CodeMessageFailure {
  readonly code: string;
  readonly message: string;
}

/***
 * Narrow an unknown value to a minimal `{ code, message }` failure shape.
 */
export function isCodeMessageFailure(value: unknown): value is CodeMessageFailure {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return typeof Reflect.get(value, 'code') === 'string' && typeof Reflect.get(value, 'message') === 'string';
}

/***
 * Narrow an unknown value to a record containing a boolean result flag at a caller-selected key.
 */
export function hasBooleanResultFlag<TKey extends string>(
  value: unknown,
  key: TKey,
): value is Record<string, unknown> & Record<TKey, boolean> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof Reflect.get(value, key) === 'boolean'
  );
}

/***
 * Return whether an object or array graph contains any forbidden own property key.
 */
export function hasForbiddenNestedKey(
  value: unknown,
  forbiddenKeys: ReadonlySet<string>,
): boolean {
  return hasForbiddenNestedKeyInternal(value, forbiddenKeys, new WeakSet<object>());
}

/***
 * Traverse an object graph cycle-safely while checking each own enumerable key against a forbidden set.
 */
function hasForbiddenNestedKeyInternal(
  value: unknown,
  forbiddenKeys: ReadonlySet<string>,
  visited: WeakSet<object>,
): boolean {
  if (typeof value !== 'object' || value === null) return false;
  if (visited.has(value)) return false;
  visited.add(value);

  if (Array.isArray(value)) {
    return value.some((entry) => hasForbiddenNestedKeyInternal(entry, forbiddenKeys, visited));
  }

  for (const [key, entry] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) return true;
    if (hasForbiddenNestedKeyInternal(entry, forbiddenKeys, visited)) return true;
  }
  return false;
}

/***
 * Throw when an object graph contains a forbidden own property key.
 */
export function assertNoForbiddenNestedKeys(
  value: unknown,
  forbiddenKeys: ReadonlySet<string>,
  message = 'Value contains a forbidden nested key.',
): void {
  if (hasForbiddenNestedKey(value, forbiddenKeys)) throw new Error(message);
}
