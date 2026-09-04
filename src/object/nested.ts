export interface NestedValueVisit {
  readonly path: string;
  readonly key: string | number | null;
  readonly value: unknown;
}

export interface NestedKeyMatch {
  readonly path: string;
  readonly key: string;
}

/***
 * Walk an unknown array/record graph depth-first while preventing object cycles.
 */
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

/***
 * Return the first nested record key contained in a forbidden-key set, including its traversal path.
 */
export function findNestedKey(
  value: unknown,
  forbiddenKeys: ReadonlySet<string> | readonly string[],
): NestedKeyMatch | null {
  const forbidden = forbiddenKeys instanceof Set ? forbiddenKeys : new Set(forbiddenKeys);
  let match: NestedKeyMatch | null = null;

  walkNestedValues(value, ({ key, path }) => {
    if (match !== null || typeof key !== 'string' || !forbidden.has(key)) return;
    match = { path, key };
  });

  return match;
}

/***
 * Throw when an unknown nested value contains any forbidden record key.
 */
export function assertNoNestedKeys(
  value: unknown,
  forbiddenKeys: ReadonlySet<string> | readonly string[],
  createMessage: (match: NestedKeyMatch) => string,
): void {
  const match = findNestedKey(value, forbiddenKeys);
  if (match !== null) throw new Error(createMessage(match));
}
