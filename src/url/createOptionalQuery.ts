/*** Serialize defined non-empty string values into an optional URL query string. */
export function createOptionalQuery(values: Readonly<Record<string, string | undefined>>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    const normalized = value?.trim();
    if (normalized) params.set(key, normalized);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}
