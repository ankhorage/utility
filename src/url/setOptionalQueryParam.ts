/*** Set a query parameter only when an optional scalar value is present. */
export function setOptionalQueryParam(
  query: URLSearchParams,
  key: string,
  value: boolean | number | string | undefined,
): void {
  if (value !== undefined) query.set(key, String(value));
}
