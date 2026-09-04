import type { SemanticVersion } from './types.js';

/*** Compare two semantic versions by major, minor, then patch number. */
export function compareSemanticVersions(left: SemanticVersion, right: SemanticVersion): number {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}
