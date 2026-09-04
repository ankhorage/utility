import { isRecord } from './isRecord.js';

/*** Narrow an unknown value to a record, or return undefined when it is not one. */
export function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}
