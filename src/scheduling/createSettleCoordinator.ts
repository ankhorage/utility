import type { SettleCoordinator, SettleCoordinatorOptions } from './types.js';

interface SettleState<TSnapshot, THandle> {
  active: boolean;
  pendingHandle: THandle | null;
  sampling: boolean;
  revision: number;
  sampleCount: number;
  stableCount: number;
  previous: TSnapshot | null;
}

/*** Clear a scheduled sample without changing active state. */
function clearPending<TSnapshot, THandle>(
  state: SettleState<TSnapshot, THandle>,
  options: SettleCoordinatorOptions<TSnapshot, THandle>,
): void {
  if (state.pendingHandle === null) return;
  options.scheduler.cancel(state.pendingHandle);
  state.pendingHandle = null;
}

/*** Cancel sampling and invalidate any in-flight sample result. */
function cancel<TSnapshot, THandle>(
  state: SettleState<TSnapshot, THandle>,
  options: SettleCoordinatorOptions<TSnapshot, THandle>,
): void {
  state.active = false;
  state.revision += 1;
  state.sampleCount = 0;
  state.stableCount = 0;
  state.previous = null;
  clearPending(state, options);
}

/*** Schedule the next sample only when no sample is running or pending. */
function scheduleNext<TSnapshot, THandle>(
  state: SettleState<TSnapshot, THandle>,
  options: SettleCoordinatorOptions<TSnapshot, THandle>,
  delayMs: number,
): void {
  if (!state.active || state.sampling || state.pendingHandle !== null) return;
  state.pendingHandle = options.scheduler.schedule(() => {
    state.pendingHandle = null;
    void sampleNext(state, options);
  }, delayMs);
}

/*** Take one sample and settle, cancel, or schedule the next sample from its result. */
async function sampleNext<TSnapshot, THandle>(
  state: SettleState<TSnapshot, THandle>,
  options: SettleCoordinatorOptions<TSnapshot, THandle>,
): Promise<void> {
  if (!state.active || state.sampling) return;
  const sampleRevision = state.revision;
  state.sampling = true;
  const snapshot = await options.sample();
  state.sampling = false;
  if (sampleRevision !== state.revision) {
    scheduleNext(state, options, 0);
    return;
  }
  if (snapshot === null) {
    cancel(state, options);
    return;
  }
  state.sampleCount += 1;
  state.stableCount =
    state.previous !== null && options.areEqual(state.previous, snapshot)
      ? state.stableCount + 1
      : 1;
  state.previous = snapshot;
  if (state.stableCount >= options.stableSampleCount || state.sampleCount >= options.maxSamples) {
    cancel(state, options);
    return;
  }
  scheduleNext(state, options, options.intervalMs);
}

/*** Start or restart settle sampling and report whether the coordinator was previously inactive. */
function trigger<TSnapshot, THandle>(
  state: SettleState<TSnapshot, THandle>,
  options: SettleCoordinatorOptions<TSnapshot, THandle>,
): boolean {
  const wasActive = state.active;
  state.active = true;
  state.revision += 1;
  state.sampleCount = 0;
  state.stableCount = 0;
  state.previous = null;
  scheduleNext(state, options, 0);
  return !wasActive;
}

/*** Repeatedly sample an asynchronous value until it is stable or reaches a configured sample limit. */
export function createSettleCoordinator<TSnapshot, THandle>(
  options: SettleCoordinatorOptions<TSnapshot, THandle>,
): SettleCoordinator {
  const state: SettleState<TSnapshot, THandle> = {
    active: false,
    pendingHandle: null,
    sampling: false,
    revision: 0,
    sampleCount: 0,
    stableCount: 0,
    previous: null,
  };
  return {
    cancel: () => cancel(state, options),
    isActive: () => state.active,
    trigger: () => trigger(state, options),
  };
}
