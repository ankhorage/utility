import { hasForbiddenNestedKey } from './hasForbiddenNestedKey.js';

/*** Throw when an object graph contains a forbidden own property key. */
export function assertNoForbiddenNestedKeys(
  value: unknown,
  forbiddenKeys: ReadonlySet<string>,
  message = 'Value contains a forbidden nested key.',
): void {
  if (hasForbiddenNestedKey(value, forbiddenKeys)) throw new Error(message);
}
