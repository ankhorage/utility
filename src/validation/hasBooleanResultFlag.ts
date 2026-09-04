/*** Narrow an unknown value to a record containing a boolean result flag at a caller-selected key. */
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
