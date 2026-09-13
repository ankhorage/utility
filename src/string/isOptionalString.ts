/*** Accept undefined or any primitive string, including empty and whitespace-only strings. */
export function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}
