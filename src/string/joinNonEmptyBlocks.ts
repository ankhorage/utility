/*** Trim text blocks and join non-empty content with a blank line. */
export function joinNonEmptyBlocks(...blocks: readonly string[]): string {
  return blocks
    .map((block) => block.trim())
    .filter(Boolean)
    .join('\n\n');
}
