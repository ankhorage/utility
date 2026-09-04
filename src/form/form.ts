export type FormDraftControl = 'json' | 'string-list' | 'text';

export interface FormDraftField {
  readonly key: string;
  readonly label: string;
  readonly control: FormDraftControl;
  readonly required?: boolean;
}

export type FormDraft = Readonly<Record<string, string>>;

export type ParseFormDraftResult =
  | { readonly ok: true; readonly values: Record<string, unknown> }
  | { readonly ok: false; readonly field: string; readonly message: string };

/***
 * Project typed configuration values into editable string fields according to a compact control schema.
 */
export function createFormDraft(
  fields: readonly FormDraftField[],
  values: unknown,
): FormDraft {
  const record = isRecord(values) ? values : {};
  return Object.fromEntries(
    fields.map((field) => [field.key, formatDraftValue(record[field.key], field.control)]),
  );
}

/***
 * Format one typed value for editing by a text, string-list, or JSON control.
 */
function formatDraftValue(value: unknown, control: FormDraftControl): string {
  if (control === 'string-list') {
    return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
      ? value.join(', ')
      : '';
  }
  if (control === 'json') return value === undefined ? '' : JSON.stringify(value, null, 2);
  return typeof value === 'string' ? value : '';
}

/***
 * Parse editable string fields back into typed values while preserving unrelated current values.
 */
export function parseFormDraft(args: {
  readonly fields: readonly FormDraftField[];
  readonly currentValues?: unknown;
  readonly draft: FormDraft;
}): ParseFormDraftResult {
  const values: Record<string, unknown> = isRecord(args.currentValues)
    ? { ...args.currentValues }
    : {};

  for (const field of args.fields) {
    const raw = args.draft[field.key]?.trim() ?? '';
    if (field.required && raw.length === 0) {
      return { ok: false, field: field.key, message: `${field.label} is required.` };
    }

    if (field.control === 'text') {
      values[field.key] = raw;
      continue;
    }
    if (field.control === 'string-list') {
      values[field.key] = raw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      continue;
    }

    try {
      values[field.key] = raw.length === 0 ? null : JSON.parse(raw);
    } catch {
      return { ok: false, field: field.key, message: `${field.label} must be valid JSON.` };
    }
  }

  return { ok: true, values };
}

/***
 * Narrow an unknown value to a non-array string-keyed record for draft projection.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
