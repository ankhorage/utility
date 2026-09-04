import type { StationarySelectionInput } from './types.js';

/*** Build a stable interaction key from pointer or touch identity plus its interaction identifier. */
export function getInteractionKey(input: StationarySelectionInput): string {
  return input.kind === 'pointer'
    ? `pointer:${input.pointerId}:${input.interactionId}`
    : `touch:${input.touchId}:${input.interactionId}`;
}
