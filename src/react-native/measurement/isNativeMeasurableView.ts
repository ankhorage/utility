import type { NativeMeasurableView } from './types.js';

/*** Detect a React-Native-like view that exposes `measureInWindow`. */
export function isNativeMeasurableView(value: unknown): value is NativeMeasurableView {
  return (
    typeof value === 'object' &&
    value !== null &&
    'measureInWindow' in value &&
    typeof value.measureInWindow === 'function'
  );
}
