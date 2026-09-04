export interface FormatDateTimeOptions {
  readonly fallback?: string;
  readonly invalid?: 'input' | 'fallback';
  readonly locale?: Intl.LocalesArgument;
  readonly options?: Intl.DateTimeFormatOptions;
}

/***
 * Format an optional date input for human display with configurable missing and invalid-value behavior.
 */
export function formatDateTime(
  value: Date | number | string | null | undefined,
  options: FormatDateTimeOptions = {},
): string {
  const fallback = options.fallback ?? '';
  if (value === null || value === undefined || value === '') return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return options.invalid === 'fallback' ? fallback : String(value);
  }
  return date.toLocaleString(options.locale, options.options);
}
