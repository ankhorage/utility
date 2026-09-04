export interface NestedValueVisit {
  readonly path: string;
  readonly key: string | number | null;
  readonly value: unknown;
}

/*** Walk an unknown array/record graph depth-first while preventing object cycles. */
export function walkNestedValues(
  value: unknown,
  visit: (entry: NestedValueVisit) => void,
  rootPath = '$',
): void {
  const seen = new Set<object>();

  /*** Visit one nested value and recursively traverse its children when it is an unseen object. */
  function walk(current: unknown, path: string, key: string | number | null): void {
    visit({ path, key, value: current });
    if (typeof current !== 'object' || current === null || seen.has(current)) return;
    seen.add(current);

    if (Array.isArray(current)) {
      current.forEach((entry, index) => walk(entry, `${path}[${index}]`, index));
      return;
    }

    for (const [entryKey, entryValue] of Object.entries(current as Record<string, unknown>)) {
      walk(entryValue, `${path}.${entryKey}`, entryKey);
    }
  }

  walk(value, rootPath, null);
}
