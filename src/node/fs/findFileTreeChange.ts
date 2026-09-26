/*** Find a file-set or byte-content difference between two relative-path snapshots. */
export function findFileTreeChange(
  expected: ReadonlyMap<string, Uint8Array>,
  actual: ReadonlyMap<string, Uint8Array>,
): { readonly kind: 'file-set' } | { readonly kind: 'content'; readonly path: string } | null {
  if (actual.size !== expected.size) return { kind: 'file-set' };
  for (const [filePath, expectedContent] of expected) {
    const actualContent = actual.get(filePath);
    if (!actualContent || !Buffer.from(actualContent).equals(expectedContent)) {
      return { kind: 'content', path: filePath };
    }
  }
  return null;
}
