export interface SetObserver<TValue> {
  readonly disconnect: () => void;
  readonly observe: (value: TValue) => void;
  readonly unobserve: (value: TValue) => void;
}

export interface ObservedSetCoordinator<TValue> {
  readonly disconnect: () => void;
  readonly getObservedValues: () => ReadonlySet<TValue>;
  readonly sync: (desiredValues: Iterable<TValue>) => void;
}

/***
 * Synchronize an observer against a desired set using only required observe and unobserve calls.
 */
export function createObservedSetCoordinator<TValue>(
  observer: SetObserver<TValue>,
): ObservedSetCoordinator<TValue> {
  let observedValues = new Set<TValue>();
  let disconnected = false;

  /*** Disconnect the underlying observer once and clear tracked values. */
  function disconnect(): void {
    if (disconnected) return;
    disconnected = true;
    observer.disconnect();
    observedValues = new Set();
  }

  /*** Diff desired values against observed values and apply only required observer changes. */
  function sync(desiredValues: Iterable<TValue>): void {
    if (disconnected) return;
    const desired = new Set(desiredValues);
    for (const value of observedValues) {
      if (!desired.has(value)) observer.unobserve(value);
    }
    for (const value of desired) {
      if (!observedValues.has(value)) observer.observe(value);
    }
    observedValues = desired;
  }

  return { disconnect, getObservedValues: () => observedValues, sync };
}
