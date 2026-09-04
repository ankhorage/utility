/*** Normalize text for case-insensitive searching and comparison. */
export function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}
