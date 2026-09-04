import { findNestedKey, type NestedKeyMatch } from './findNestedKey.js';

/*** Throw when an unknown nested value contains any forbidden record key. */
export function assertNoNestedKeys(
  value: unknown,
  forbiddenKeys: ReadonlySet<string> | readonly string[],
  createMessage: (match: NestedKeyMatch) => string,
): void {
  const match = findNestedKey(value, forbiddenKeys);
  if (match !== null) throw new Error(createMessage(match));
}
