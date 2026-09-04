import type { CoalescedTask, Scheduler } from './types.js';

/*** Coalesce repeated requests into at most one pending scheduler callback. */
export function createCoalescedTask<THandle>(
  run: () => void,
  scheduler: Scheduler<THandle>,
  delayMs = 0,
): CoalescedTask {
  let pendingHandle: THandle | null = null;

  /*** Cancel the currently pending task when one exists. */
  function cancel(): void {
    if (pendingHandle === null) return;
    scheduler.cancel(pendingHandle);
    pendingHandle = null;
  }

  /*** Schedule one task unless another callback is already pending. */
  function request(): boolean {
    if (pendingHandle !== null) return false;
    pendingHandle = scheduler.schedule(() => {
      pendingHandle = null;
      run();
    }, delayMs);
    return true;
  }

  return { cancel, hasPending: () => pendingHandle !== null, request };
}
