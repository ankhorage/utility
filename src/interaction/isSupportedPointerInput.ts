import type { StationaryPointerInput } from './types.js';

/*** Return whether a pointer interaction is primary and, for mouse input, uses the primary button. */
export function isSupportedPointerInput(input: StationaryPointerInput): boolean {
  if (!input.isPrimary) return false;
  return input.pointerType !== 'mouse' || input.button === 0;
}
