import { truncateText } from './truncateText.js';

/*** Serialize a value as formatted JSON and optionally truncate the resulting text. */
export function stringifyJson(
  value: unknown,
  options: { readonly space?: number; readonly maxLength?: number; readonly suffix?: string } = {},
): string {
  const serialized = JSON.stringify(value, null, options.space ?? 2);
  if (options.maxLength === undefined) return serialized;
  return truncateText(serialized, options.maxLength, options.suffix ?? '…');
}
