import { promises as fs } from 'node:fs';
import path from 'node:path';

/*** Write bytes to a destination only when the resolved file stays inside an allowed root. */
export async function writeFileWithinRoot(args: {
  readonly rootPath: string;
  readonly filePath: string;
  readonly body: Uint8Array;
  readonly exclusive?: boolean;
}): Promise<void> {
  const root = path.resolve(args.rootPath);
  const destination = path.resolve(args.filePath);
  if (destination !== root && !destination.startsWith(`${root}${path.sep}`)) {
    throw new Error('File path escaped the allowed root directory.');
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, args.body, { flag: args.exclusive === false ? 'w' : 'wx' });
}
