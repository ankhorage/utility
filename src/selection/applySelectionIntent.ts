import type { SelectionIntent } from './types.js';

 /*** Apply one semantic selection intent without mutating or duplicating selected values. */
export function applySelectionIntent<TValue>(
  selectedValues: readonly TValue[],
  value: TValue,
  intent: SelectionIntent,
): readonly TValue[] {
  if (intent === 'replace') {
    return selectedValues.length === 1 && Object.is(selectedValues[0], value)
      ? selectedValues
      : [value];
  }

  const selectedIndex = selectedValues.findIndex((candidate) => Object.is(candidate, value));
  if (selectedIndex < 0) return [...selectedValues, value];
  if (selectedValues.length === 1) return [];
  return [...selectedValues.slice(0, selectedIndex), ...selectedValues.slice(selectedIndex + 1)];
}
