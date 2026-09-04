/*** Return a declared schema type only when the declaration contains exactly one primitive type. */
export function resolveSingleSchemaType<TType extends string>(
  type: TType | readonly TType[] | undefined,
): TType | undefined {
  if (typeof type === 'string') return type;
  return type?.length === 1 ? type[0] : undefined;
}
