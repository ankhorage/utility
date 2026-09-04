/*** Narrow an unknown value to a string without changing its contents. */
export function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
