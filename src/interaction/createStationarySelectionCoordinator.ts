import type {
  CommitSelectionResult,
  InteractionSelectionTransaction,
  StationarySelectionCoordinator,
} from './types.js';

/*** Coordinate a generation-scoped interaction transaction that records an ordered path and commits one stationary selection once. */
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

  /*** Finalize the active transaction into one selection outcome without committing invalid interaction states. */
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
