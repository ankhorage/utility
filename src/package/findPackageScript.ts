/*** Find a named script in a partial package scripts record. */
export function findPackageScript(
  scripts: Readonly<Record<string, string | undefined>>,
  scriptName: string,
): string | undefined {
  return Object.entries(scripts).find(([candidate]) => candidate === scriptName)?.[1];
}
