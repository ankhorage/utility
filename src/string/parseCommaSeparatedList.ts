/*** Parse a comma-separated list into trimmed unique non-empty values while preserving order. */
export function parseCommaSeparatedList(value: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of value.split(',')) {
    const normalized = entry.trim();
    if (normalized.length === 0 || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}
