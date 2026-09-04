import { isRecord } from '../object/isRecord.js';
import type { FormDraft, FormDraftControl, FormDraftField } from './types.js';

/*** Project typed configuration values into editable string fields according to a compact control schema. */
export function createFormDraft(
  fields: readonly FormDraftField[],
  values: unknown,
): FormDraft {
  const record = isRecord(values) ? values : {};
  return Object.fromEntries(
    fields.map((field) => [field.key, formatDraftValue(record[field.key], field.control)]),
  );
}

/*** Format one typed value for editing by a text, string-list, or JSON control. */
function formatDraftValue(value: unknown, control: FormDraftControl): string {
  if (control === 'string-list') {
    return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
      ? value.join(', ')
      : '';
  }
  if (control === 'json') return value === undefined ? '' : JSON.stringify(value, null, 2);
  return typeof value === 'string' ? value : '';
}
