import { lstatSync, realpathSync } from 'node:fs';
import path from 'node:path';

/*** Resolves a filesystem path beneath a root while rejecting lexical and symlink escapes. */
export function resolveFileSystemPathWithinRoot(
  rootPath: string,
  filePath: string,
  options: { readonly allowRoot?: boolean } = {},
): string {
  const lexicalRoot = path.resolve(rootPath);
  const lexicalTarget = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(lexicalRoot, filePath);

  assertContainedPath(lexicalRoot, lexicalTarget, filePath, options.allowRoot === true);

  const realRoot = realpathSync(lexicalRoot);
  const existingAncestor = findExistingAncestor(lexicalTarget);
  const realAncestor = realpathSync(existingAncestor);
  assertContainedPath(realRoot, realAncestor, filePath, options.allowRoot === true);

  const resolvedTarget = path.resolve(realAncestor, path.relative(existingAncestor, lexicalTarget));
  assertContainedPath(realRoot, resolvedTarget, filePath, options.allowRoot === true);

  return resolvedTarget;
}

/*** Rejects paths outside the root and optionally rejects the root path itself. */
function assertContainedPath(
  rootPath: string,
  targetPath: string,
  inputPath: string,
  allowRoot: boolean,
): void {
  const relativePath = path.relative(rootPath, targetPath);
  const isRoot = relativePath.length === 0;
  const escapesRoot =
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath);

  if (escapesRoot || (isRoot && !allowRoot)) {
    throw new Error(`Path escaped the allowed root: ${inputPath}`);
  }
}

/*** Finds the nearest existing path so symlink ancestry can be resolved safely. */
function findExistingAncestor(targetPath: string): string {
  if (lstatSync(targetPath, { throwIfNoEntry: false })) return targetPath;

  const parentPath = path.dirname(targetPath);
  if (parentPath === targetPath) {
    throw new Error(`Unable to resolve an existing ancestor for path: ${targetPath}`);
  }

  return findExistingAncestor(parentPath);
}
