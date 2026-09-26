/*** Narrow a value to a string containing at least one character. */
export function asPresentString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
