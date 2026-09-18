import { type Dirent, readdirSync } from 'node:fs';

import { resolveFileSystemPathWithinRoot } from './resolveFileSystemPathWithinRoot.js';

/*** Reads directory entries only when the directory stays inside the allowed filesystem root. */
export function readDirectoryWithinRoot(args: {
  readonly rootPath: string;
  readonly directoryPath: string;
}): { readonly entries: Dirent[]; readonly path: string } {
  const path = resolveFileSystemPathWithinRoot(args.rootPath, args.directoryPath, {
    allowRoot: true,
  });
  return {
    entries: readdirSync(path, { withFileTypes: true }),
    path,
  };
}
