import { classifySupportedKey } from './classifySupportedKey.js';

/*** Return whether a string key is accepted by either a primary predicate or explicit support record. */
export function isSupportedKey(
  key: string,
  isPrimary: (key: string) => boolean,
  explicitSupport: Readonly<Record<string, true>> = {},
): boolean {
  return classifySupportedKey(key, isPrimary, explicitSupport) !== 'unsupported';
}
