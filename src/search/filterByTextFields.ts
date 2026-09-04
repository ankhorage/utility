import { normalizeSearchText } from '../string/normalizeSearchText.js';

/*** Filter values by a normalized query matched against caller-provided text fields. */
export function filterByTextFields<TValue>(
  values: readonly TValue[],
  query: string,
  fields: (value: TValue) => readonly string[],
): readonly TValue[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length === 0) return values;
  return values.filter((value) =>
    fields(value).some((field) => normalizeSearchText(field).includes(normalizedQuery)),
  );
}
