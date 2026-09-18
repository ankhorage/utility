/*** Escapes a literal string so it can be safely embedded in a regular-expression source. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
}
