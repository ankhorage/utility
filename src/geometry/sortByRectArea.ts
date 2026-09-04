/*** Return a new array ordered from smallest rectangle area to largest. */
export function sortByRectArea<TValue extends { readonly rect: { readonly width: number; readonly height: number } }>(
  values: readonly TValue[],
): TValue[] {
  return [...values].sort(
    (left, right) => left.rect.width * left.rect.height - right.rect.width * right.rect.height,
  );
}
