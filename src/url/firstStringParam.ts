/*** Read the first string value from a scalar-or-array route/search parameter. */
export function firstStringParam(value: string | readonly string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : value?.[0];
}
