/*** Return whether two arrays contain equal values in the same order according to a comparator. */
export function arraysEqual<T>(
  left: readonly T[],
  right: readonly T[],
  equals: (leftValue: T, rightValue: T, index: number) => boolean = Object.is,
): boolean {
  return left.length === right.length && left.every((value, index) => equals(value, right[index] as T, index));
}
