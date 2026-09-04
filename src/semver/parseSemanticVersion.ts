import type { SemanticVersion } from './types.js';

/*** Parse an exact three-part semantic version without prerelease or build metadata. */
export function parseSemanticVersion(value: string): SemanticVersion | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/u.exec(value);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}
