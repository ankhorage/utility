/*** Check whether a Bun text lockfile references an exact package and version tuple. */
export function bunLockfileReferencesPackageVersion(
  lockfile: string,
  packageName: string,
  version: string,
): boolean {
  return lockfile.includes(
    `${JSON.stringify(packageName)}: [${JSON.stringify(`${packageName}@${version}`)}`,
  );
}
