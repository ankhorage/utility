import { promises as fs } from 'node:fs';
import path from 'node:path';

import { resolveFileSystemPathWithinRoot } from './resolveFileSystemPathWithinRoot.js';

/*** Write bytes to a destination only when the resolved file stays inside an allowed root. */
export async function writeFileWithinRoot(args: {
  readonly rootPath: string;
  readonly filePath: string;
  readonly body: Uint8Array;
  readonly exclusive?: boolean;
}): Promise<void> {
  const destination = resolveFileSystemPathWithinRoot(args.rootPath, args.filePath);

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, args.body, { flag: args.exclusive === false ? 'w' : 'wx' });
}
