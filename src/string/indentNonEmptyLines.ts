/*** Indent non-empty lines in a multiline string while preserving blank lines. */
export function indentNonEmptyLines(content: string, indent = '  '): string {
  return content
    .split('\n')
    .map((line) => (line.length > 0 ? `${indent}${line}` : line))
    .join('\n');
}
