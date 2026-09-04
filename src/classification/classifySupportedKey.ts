import { readOwnProperty } from '../object/readOwnProperty.js';
import type { SupportClassification } from './types.js';

/*** Classify a string key against a primary predicate and an explicit supported-key record. */
export function classifySupportedKey(
  key: string,
  isPrimary: (key: string) => boolean,
  explicitSupport: Readonly<Record<string, true>> = {},
): SupportClassification {
  if (isPrimary(key)) return 'primary';
  return readOwnProperty<true>(explicitSupport, key) === true ? 'explicit' : 'unsupported';
}
