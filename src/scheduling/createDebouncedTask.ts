import type { DebouncedTask, Scheduler } from './types.js';

/*** Restart the delay on every request and run once after the final request. */
export function createDebouncedTask<THandle>(
  run: () => void,
  scheduler: Scheduler<THandle>,
  delayMs: number,
): DebouncedTask {
  let pendingHandle: THandle | null = null;

  /*** Cancel the pending callback without executing it. */
  function cancel(): void {
    if (pendingHandle === null) return;
    scheduler.cancel(pendingHandle);
    pendingHandle = null;
  }

  /*** Execute a pending callback immediately and clear its scheduled execution. */
  function flush(): boolean {
    if (pendingHandle === null) return false;
    cancel();
    run();
    return true;
  }

  /*** Restart the trailing-edge delay. */
  function request(): void {
    cancel();
    pendingHandle = scheduler.schedule(() => {
      pendingHandle = null;
      run();
    }, delayMs);
  }

  return { cancel, flush, hasPending: () => pendingHandle !== null, request };
}
