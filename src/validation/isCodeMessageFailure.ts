import type { CodeMessageFailure } from './types.js';

/*** Narrow an unknown value to a minimal `{ code, message }` failure shape. */
export function isCodeMessageFailure(value: unknown): value is CodeMessageFailure {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return (
    typeof Reflect.get(value, 'code') === 'string' &&
    typeof Reflect.get(value, 'message') === 'string'
  );
}
