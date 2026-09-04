import type {
  CommitSelectionResult,
  InteractionSelectionTransaction,
  StationarySelectionCoordinator,
} from './types.js';

interface CoordinatorState<TValue> {
  nextTransactionId: number;
  readonly trackerRef: { current: InteractionSelectionTransaction<TValue> | null };
}

/*** Start a fresh interaction transaction and return its monotonically increasing identifier. */
function beginTransaction<TValue>(state: CoordinatorState<TValue>): number {
  const transaction: InteractionSelectionTransaction<TValue> = {
    transactionId: state.nextTransactionId,
    path: [],
    moved: false,
    finalized: false,
  };
  state.nextTransactionId += 1;
  state.trackerRef.current = transaction;
  return transaction.transactionId;
}

/*** Record one unique candidate value when the supplied generation matches the active transaction. */
function recordNode<TValue>(
  state: CoordinatorState<TValue>,
  value: TValue,
  generation: number,
): void {
  const transaction = state.trackerRef.current;
  if (!transaction || transaction.finalized || transaction.transactionId !== generation) return;
  if (!transaction.path.includes(value)) transaction.path.push(value);
}

/*** Finalize the active transaction into one selection outcome without committing invalid interaction states. */
function commitSelection<TValue>(
  state: CoordinatorState<TValue>,
  isEnabled: boolean,
  selectedValue: TValue | null,
  selectValue: (value: TValue | null) => void,
  generation: number,
): CommitSelectionResult {
  if (!isEnabled) return 'preview';
  const transaction = state.trackerRef.current;
  if (!transaction) return 'empty';
  if (transaction.transactionId !== generation) return 'stale';
  if (transaction.finalized) return 'already-finalized';
  if (transaction.moved) return 'moved';
  const selected = transaction.path.at(0);
  if (selected === undefined) return 'empty';
  if (Object.is(selected, selectedValue)) return 'already-selected';
  selectValue(selected);
  transaction.finalized = true;
  return 'committed';
}

/*** Clear the active transaction unconditionally or only when a supplied generation matches it. */
function clearTransaction<TValue>(state: CoordinatorState<TValue>, generation?: number): void {
  if (generation === undefined || state.trackerRef.current?.transactionId === generation) {
    state.trackerRef.current = null;
  }
}

/*** Mark the matching active transaction as moved so it cannot commit a stationary selection. */
function markMoved<TValue>(state: CoordinatorState<TValue>, generation: number): void {
  const transaction = state.trackerRef.current;
  if (transaction?.transactionId === generation) transaction.moved = true;
}

/*** Coordinate a generation-scoped interaction transaction that records an ordered path and commits one stationary selection once. */
export function createStationarySelectionCoordinator<
  TValue = string,
>(): StationarySelectionCoordinator<TValue> {
  const state: CoordinatorState<TValue> = {
    nextTransactionId: 1,
    trackerRef: { current: null },
  };
  return {
    trackerRef: state.trackerRef,
    beginTransaction: () => beginTransaction(state),
    recordNode: (value, generation) => recordNode(state, value, generation),
    commitSelection: (isEnabled, selectedValue, selectValue, generation) =>
      commitSelection(state, isEnabled, selectedValue, selectValue, generation),
    clearTransaction: (generation) => clearTransaction(state, generation),
    markMoved: (generation) => markMoved(state, generation),
    getTransaction: () => state.trackerRef.current,
  };
}
