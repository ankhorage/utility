import { walkNestedValues } from './walkNestedValues.js';

export interface NestedKeyMatch {
  readonly path: string;
  readonly key: string;
}

/*** Return the first nested record key contained in a forbidden-key set, including its traversal path. */
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
