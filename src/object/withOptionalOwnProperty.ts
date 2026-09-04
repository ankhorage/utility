import { withOwnProperty } from './withOwnProperty.js';
import { withoutOwnProperty } from './withoutOwnProperty.js';

/*** Return a shallow copy that removes a property for undefined or sets it for a defined value. */
export function withOptionalOwnProperty<TValue>(
  record: Readonly<Record<string, TValue>>,
  key: string,
  value: TValue | undefined,
): Record<string, TValue> {
  return value === undefined ? withoutOwnProperty(record, key) : withOwnProperty(record, key, value);
}
