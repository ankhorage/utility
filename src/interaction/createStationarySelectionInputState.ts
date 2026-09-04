import { getInteractionKey } from './getInteractionKey.js';
import { isSupportedPointerInput } from './isSupportedPointerInput.js';
import type { StationarySelectionInput, StationarySelectionInputState } from './types.js';

/*** Buffer unique values per pointer or touch interaction until an active transaction can consume them. */
export function createStationarySelectionInputState<TValue = string>(args: {
  readonly hasActiveTransaction: () => boolean;
  readonly recordActiveNode: (value: TValue) => void;
}): StationarySelectionInputState<TValue> {
  let pendingInteractionKey: string | null = null;
  let pendingPath: TValue[] = [];

  /*** Reset the pending interaction identity and buffered path. */
  function clear(): void {
    pendingInteractionKey = null;
    pendingPath = [];
  }

  /*** Record one value into the active transaction or current pending interaction path. */
  function recordNode(value: TValue, input: StationarySelectionInput): boolean {
    if (input.kind === 'pointer' && !isSupportedPointerInput(input)) return false;
    if (args.hasActiveTransaction()) {
      args.recordActiveNode(value);
      return true;
    }
    const interactionKey = getInteractionKey(input);
    if (pendingInteractionKey !== interactionKey) {
      pendingInteractionKey = interactionKey;
      pendingPath = [];
    }
    if (!pendingPath.includes(value)) pendingPath.push(value);
    return true;
  }

  /*** Replay the pending path into a newly begun transaction and clear the buffer. */
  function beginTransaction(recordNodeValue: (value: TValue) => void): void {
    for (const value of pendingPath) recordNodeValue(value);
    clear();
  }

  /*** Clear a pending interaction after completion when no active transaction owns it. */
  function completePendingInteraction(): void {
    if (!args.hasActiveTransaction()) clear();
  }

  return {
    recordNode,
    beginTransaction,
    completePendingInteraction,
    clear,
    getPendingPath: () => pendingPath,
  };
}
