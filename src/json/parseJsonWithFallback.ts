/*** Parse JSON and return a fallback when parsing or a caller-provided value guard fails. */
export function parseJsonWithFallback<TValue>(
  input: string,
  fallback: TValue,
  isValue: (value: unknown) => value is TValue,
): TValue {
  try {
    const value: unknown = JSON.parse(input);
    return isValue(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
