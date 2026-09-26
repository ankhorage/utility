import { access } from 'node:fs/promises';
import path from 'node:path';

/*** Resolve an executable installed inside a project's own node_modules binary directory. */
export async function resolveProjectOwnedExecutableAsync(
  projectRoot: string,
  executableName: string,
): Promise<string> {
  if (
    executableName.length === 0 ||
    path.basename(executableName) !== executableName ||
    executableName === '.' ||
    executableName === '..'
  ) {
    throw new Error(`Invalid project-owned executable name: ${executableName}`);
  }
  const executablePath = path.join(projectRoot, 'node_modules', '.bin', executableName);
  await access(executablePath);
  return executablePath;
}
