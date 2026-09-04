export interface Scheduler<THandle> {
  readonly cancel: (handle: THandle) => void;
  readonly schedule: (callback: () => void, delayMs: number) => THandle;
}

export interface CoalescedTask {
  readonly cancel: () => void;
  readonly hasPending: () => boolean;
  readonly request: () => boolean;
}

/***
 * Coalesce repeated requests into at most one pending scheduler callback.
 */
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

export interface SettleCoordinator {
  readonly cancel: () => void;
  readonly isActive: () => boolean;
  readonly trigger: () => boolean;
}

export interface SettleCoordinatorOptions<TSnapshot, THandle> {
  readonly areEqual: (left: TSnapshot, right: TSnapshot) => boolean;
  readonly intervalMs: number;
  readonly maxSamples: number;
  readonly sample: () => Promise<TSnapshot | null>;
  readonly scheduler: Scheduler<THandle>;
  readonly stableSampleCount: number;
}

/***
 * Repeatedly sample an asynchronous value until it is stable or reaches a configured sample limit.
 */
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

export type LatestAsyncResult<TValue> =
  | { readonly applied: true; readonly value: TValue }
  | { readonly applied: false; readonly error?: unknown };

export interface LatestAsyncCoordinator {
  readonly invalidate: () => void;
  readonly run: <TValue>(args: {
    readonly load: () => Promise<TValue>;
    readonly onError?: (error: unknown) => void;
    readonly onValue?: (value: TValue) => void;
  }) => Promise<LatestAsyncResult<TValue>>;
}

/***
 * Apply only the latest asynchronous request result and ignore stale completions.
 */
export function createLatestAsyncCoordinator(): LatestAsyncCoordinator {
  let latestRequestId = 0;

  return {
    /*** Invalidate every currently in-flight request without starting another one. */
    invalidate: () => {
      latestRequestId += 1;
    },
    /*** Run an asynchronous load and apply callbacks only when it is still the latest request. */
    async run<TValue>(args: {
      readonly load: () => Promise<TValue>;
      readonly onError?: (error: unknown) => void;
      readonly onValue?: (value: TValue) => void;
    }): Promise<LatestAsyncResult<TValue>> {
      const requestId = latestRequestId + 1;
      latestRequestId = requestId;
      try {
        const value = await args.load();
        if (requestId !== latestRequestId) return { applied: false };
        args.onValue?.(value);
        return { applied: true, value };
      } catch (error) {
        if (requestId !== latestRequestId) return { applied: false, error };
        args.onError?.(error);
        return { applied: false, error };
      }
    },
  };
}
