import { isRecord } from './isRecord.js';

/*** Narrow an unknown value to a record whose values all satisfy the supplied predicate. */
export function isRecordOf<T>(
  value: unknown,
  predicate: (candidate: unknown) => candidate is T,
): value is Record<string, T> {
  return isRecord(value) && Object.values(value).every(predicate);
}
