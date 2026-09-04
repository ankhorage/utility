export type CommitSelectionResult =
  | 'committed'
  | 'already-selected'
  | 'preview'
  | 'moved'
  | 'empty'
  | 'stale'
  | 'already-finalized';

export interface InteractionSelectionTransaction<TValue> {
  readonly transactionId: number;
  readonly path: TValue[];
  moved: boolean;
  finalized: boolean;
}

export interface StationarySelectionCoordinator<TValue> {
  readonly trackerRef: { current: InteractionSelectionTransaction<TValue> | null };
  readonly beginTransaction: () => number;
  readonly recordNode: (value: TValue, generation: number) => void;
  readonly commitSelection: (
    isEnabled: boolean,
    selectedValue: TValue | null,
    selectValue: (value: TValue | null) => void,
    generation: number,
  ) => CommitSelectionResult;
  clearTransaction(): void;
  clearTransaction(generation: number): void;
  readonly markMoved: (generation: number) => void;
  readonly getTransaction: () => InteractionSelectionTransaction<TValue> | null;
}

/***
 * Coordinate a generation-scoped interaction transaction that records an ordered path and commits one stationary selection once.
 */
export function createStationarySelectionCoordinator<TValue = string>(): StationarySelectionCoordinator<TValue> {
  let nextTransactionId = 1;
  const trackerRef = { current: null as InteractionSelectionTransaction<TValue> | null };

  /*** Start a fresh interaction transaction and return its monotonically increasing identifier. */
  function beginTransaction(): number {
    const transaction: InteractionSelectionTransaction<TValue> = {
      transactionId: nextTransactionId,
      path: [],
      moved: false,
      finalized: false,
    };
    nextTransactionId += 1;
    trackerRef.current = transaction;
    return transaction.transactionId;
  }

  /*** Record one unique candidate value when the supplied generation matches the active transaction. */
  function recordNode(value: TValue, generation: number): void {
    const transaction = trackerRef.current;
    if (!transaction || transaction.finalized || transaction.transactionId !== generation) return;
    if (!transaction.path.includes(value)) transaction.path.push(value);
  }

  /*** Finalize the active transaction into one selection outcome without committing stale, moved, disabled, empty, or duplicate selections. */
  function commitSelection(
    isEnabled: boolean,
    selectedValue: TValue | null,
    selectValue: (value: TValue | null) => void,
    generation: number,
  ): CommitSelectionResult {
    if (!isEnabled) return 'preview';
    const transaction = trackerRef.current;
    if (!transaction) return 'empty';
    if (transaction.transactionId !== generation) return 'stale';
    if (transaction.finalized) return 'already-finalized';
    if (transaction.moved) return 'moved';
    if (transaction.path.length === 0) return 'empty';

    const [selected] = transaction.path;
    if (selected !== undefined && selected === selectedValue) return 'already-selected';
    if (selected !== undefined && selected !== selectedValue) selectValue(selected);
    transaction.finalized = true;
    return 'committed';
  }

  function clearTransaction(): void;
  function clearTransaction(generation: number): void;
  /*** Clear the active transaction unconditionally or only when a supplied generation matches it. */
  function clearTransaction(generation?: number): void {
    if (generation === undefined) {
      trackerRef.current = null;
      return;
    }
    const transaction = trackerRef.current;
    if (transaction?.transactionId === generation) trackerRef.current = null;
  }

  /*** Mark the matching active transaction as moved so it cannot commit a stationary selection. */
  function markMoved(generation: number): void {
    const transaction = trackerRef.current;
    if (transaction?.transactionId === generation) transaction.moved = true;
  }

  /*** Return the active transaction without mutating it. */
  function getTransaction(): InteractionSelectionTransaction<TValue> | null {
    return trackerRef.current;
  }

  return {
    trackerRef,
    beginTransaction,
    recordNode,
    commitSelection,
    clearTransaction,
    markMoved,
    getTransaction,
  };
}

export interface StationaryPointerInput {
  readonly kind: 'pointer';
  readonly button: number;
  readonly interactionId: number;
  readonly isPrimary: boolean;
  readonly pointerId: number;
  readonly pointerType: string;
}

export interface StationaryTouchInput {
  readonly kind: 'touch';
  readonly interactionId: number;
  readonly touchId: string;
}

export type StationarySelectionInput = StationaryPointerInput | StationaryTouchInput;

export interface StationarySelectionInputState<TValue> {
  readonly recordNode: (value: TValue, input: StationarySelectionInput) => boolean;
  readonly beginTransaction: (recordNode: (value: TValue) => void) => void;
  readonly completePendingInteraction: () => void;
  readonly clear: () => void;
  readonly getPendingPath: () => readonly TValue[];
}

/***
 * Return whether a pointer interaction is primary and, for mouse input, uses the primary button.
 */
export function isSupportedPointerInput(input: StationaryPointerInput): boolean {
  if (!input.isPrimary) return false;
  return input.pointerType !== 'mouse' || input.button === 0;
}

/***
 * Build a stable interaction key from pointer or touch identity plus its interaction identifier.
 */
export function getInteractionKey(input: StationarySelectionInput): string {
  return input.kind === 'pointer'
    ? `pointer:${input.pointerId}:${input.interactionId}`
    : `touch:${input.touchId}:${input.interactionId}`;
}

/***
 * Buffer unique values per pointer or touch interaction until an active transaction can consume them.
 */
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
