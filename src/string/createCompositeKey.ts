/*** Join scalar key parts into one stable composite key using a configurable delimiter. */
export function createCompositeKey(
  parts: readonly (boolean | number | string | null | undefined)[],
  delimiter = ':',
): string {
  return parts
    .map((part) => (part === null || part === undefined ? '' : String(part)))
    .join(delimiter);
}
