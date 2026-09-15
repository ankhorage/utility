import { isRecord } from './isRecord.js';
import { readOwnProperty } from './readOwnProperty.js';

/*** Deeply merge defined source values into a target record without mutating either input. */
export function deepMerge<T extends object>(target: T, source: DeepMergeSource<NoInfer<T>>): T {
  return mergeValue(target, source) as T;
}

/*** Merge two unknown values, recursively combining records and replacing all other values. */
function mergeValue(target: unknown, source: unknown): unknown {
  if (source === undefined) return target;
  if (!isRecord(target) || !isRecord(source)) return source;

  return Object.fromEntries([
    ...Object.entries(target),
    ...Object.entries(source)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, mergeValue(readOwnProperty(target, key), value)]),
  ]);
}

type DeepMergeSource<T> = T extends readonly unknown[]
  ? T | undefined
  : T extends object
    ? { [K in keyof T]?: DeepMergeSource<T[K]> | undefined }
    : T | undefined;
