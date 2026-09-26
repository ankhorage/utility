import { realpath } from 'node:fs/promises';

/*** Resolve both sides of a package provenance check through the filesystem. */
export async function resolveInstalledPackageProvenanceAsync(
  workspacePath: string,
  candidatePath: string,
): Promise<InstalledPackageProvenance> {
  const [resolvedWorkspacePath, resolvedCandidatePath] = await Promise.all([
    realpath(workspacePath),
    realpath(candidatePath),
  ]);

  return { resolvedWorkspacePath, resolvedCandidatePath };
}

interface InstalledPackageProvenance {
  readonly resolvedCandidatePath: string;
  readonly resolvedWorkspacePath: string;
}
