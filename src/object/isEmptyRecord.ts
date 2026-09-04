/*** Return whether a record has no own enumerable string keys. */
export function isEmptyRecord(value: Record<string, unknown>): boolean {
  return Object.keys(value).length === 0;
}
