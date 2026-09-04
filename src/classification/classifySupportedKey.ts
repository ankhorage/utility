import type { SupportClassification } from './types.js';

/*** Classify a string key against a primary predicate and an explicit supported-key record. */
export function classifySupportedKey(
  key: string,
  isPrimary: (key: string) => boolean,
  explicitSupport: Readonly<Record<string, true>> = {},
): SupportClassification {
  if (isPrimary(key)) return 'primary';
  if (Object.hasOwn(explicitSupport, key) && explicitSupport[key] === true) return 'explicit';
  return 'unsupported';
}
