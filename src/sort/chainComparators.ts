import type { Comparator } from './types.js';

/*** Compose comparators in priority order and return the first non-zero comparison result. */
export function chainComparators<TValue>(
  comparators: readonly Comparator<TValue>[],
): Comparator<TValue> {
  return (left, right) => {
    for (const compare of comparators) {
      const result = compare(left, right);
      if (result !== 0) return result;
    }
    return 0;
  };
}
