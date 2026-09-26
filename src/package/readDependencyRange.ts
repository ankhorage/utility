import { isRecord } from '../object/isRecord.js';
import { readOwnProperty } from '../object/readOwnProperty.js';

/*** Read a package dependency range from one declared dependency group. */
export function readDependencyRange(
  packageJson: Readonly<Record<string, unknown>>,
  dependencyGroup: 'dependencies' | 'devDependencies',
  packageName: string,
): string | undefined {
  const dependencies = readOwnProperty(packageJson, dependencyGroup);
  if (!isRecord(dependencies)) return undefined;
  const range = readOwnProperty(dependencies, packageName);
  return typeof range === 'string' ? range : undefined;
}
