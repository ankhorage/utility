import type { SettleCoordinator, SettleCoordinatorOptions } from './types.js';

/*** Repeatedly sample an asynchronous value until it is stable or reaches a configured sample limit. */
export function createSettleCoordinator<TSnapshot, THandle>(
  options: SettleCoordinatorOptions<TSnapshot, THandle>,
): SettleCoordinator {
  let active = false;
  let pendingHandle: THandle | null = null;
  let sampling = false;
  let revision = 0;
  let sampleCount = 0;
  let stableCount = 0;
  let previous: TSnapshot | null = null;

  /*** Clear a scheduled sample without changing active state. */
  function clearPending(): void {
    if (pendingHandle === null) return;
    options.scheduler.cancel(pendingHandle);
    pendingHandle = null;
  }

  /*** Cancel sampling and invalidate any in-flight sample result. */
  function cancel(): void {
    active = false;
    revision += 1;
    sampleCount = 0;
    stableCount = 0;
    previous = null;
    clearPending();
  }

  /*** Schedule the next sample only when no sample is running or pending. */
  function scheduleNext(delayMs: number): void {
    if (!active || sampling || pendingHandle !== null) return;
    pendingHandle = options.scheduler.schedule(() => {
      pendingHandle = null;
      void sampleNext();
    }, delayMs);
  }

  /*** Take one sample and settle, cancel, or schedule the next sample from its result. */
  async function sampleNext(): Promise<void> {
    if (!active || sampling) return;
    const sampleRevision = revision;
    sampling = true;
    const snapshot = await options.sample();
    sampling = false;
    if (sampleRevision !== revision) {
      scheduleNext(0);
      return;
    }
    if (snapshot === null) {
      cancel();
      return;
    }
    sampleCount += 1;
    stableCount = previous !== null && options.areEqual(previous, snapshot) ? stableCount + 1 : 1;
    previous = snapshot;
    if (stableCount >= options.stableSampleCount || sampleCount >= options.maxSamples) {
      cancel();
      return;
    }
    scheduleNext(options.intervalMs);
  }

  /*** Start or restart settle sampling and report whether the coordinator was previously inactive. */
  function trigger(): boolean {
    const wasActive = active;
    active = true;
    revision += 1;
    sampleCount = 0;
    stableCount = 0;
    previous = null;
    scheduleNext(0);
    return !wasActive;
  }

  return { cancel, isActive: () => active, trigger };
}
