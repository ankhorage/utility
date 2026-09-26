/*** Compare two JSON-compatible values by their serialized representation. */
export function isJsonSerializationEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
