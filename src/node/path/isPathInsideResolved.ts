import path from 'node:path';

/*** Check strict containment between two already-resolved filesystem paths. */
export function isPathInsideResolved(
  resolvedParentPath: string,
  resolvedCandidatePath: string,
): boolean {
  const relativePath = path.relative(resolvedParentPath, resolvedCandidatePath);
  return (
    relativePath !== '' &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}
