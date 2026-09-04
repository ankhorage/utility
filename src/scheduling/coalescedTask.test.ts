import { describe, expect, it } from 'bun:test';

import { createCoalescedTask } from './scheduling.js';

function createFakeFrameScheduler() {
  let nextFrameId = 1;
  const callbacks = new Map<number, () => void>();

  return {
    callbacks,
    scheduler: {
      schedule: (callback: () => void) => {
        const frameId = nextFrameId++;
        callbacks.set(frameId, callback);
        return frameId;
      },
      cancel: (frameId: number) => {
        callbacks.delete(frameId);
      },
    },
    flush: () => {
      const pending = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pending) {
        callback();
      }
    },
  };
}

describe('coalesced task', () => {
  it('coalesces rapid refresh triggers into one animation frame', () => {
    const frames = createFakeFrameScheduler();
    let refreshCount = 0;
    const coordinator = createCoalescedTask(() => {
      refreshCount += 1;
    }, frames.scheduler);

    expect(coordinator.request()).toBe(true);
    expect(coordinator.request()).toBe(false);
    expect(coordinator.request()).toBe(false);
    expect(frames.callbacks.size).toBe(1);

    frames.flush();

    expect(refreshCount).toBe(1);
    expect(coordinator.hasPending()).toBe(false);
  });

  it('does not schedule another frame after a refresh finishes', () => {
    const frames = createFakeFrameScheduler();
    const coordinator = createCoalescedTask(() => undefined, frames.scheduler);

    coordinator.request();
    frames.flush();

    expect(frames.callbacks.size).toBe(0);
    expect(coordinator.hasPending()).toBe(false);
  });

  it('cancels a pending refresh during cleanup', () => {
    const frames = createFakeFrameScheduler();
    let refreshCount = 0;
    const coordinator = createCoalescedTask(() => {
      refreshCount += 1;
    }, frames.scheduler);

    coordinator.request();
    coordinator.cancel();
    frames.flush();

    expect(refreshCount).toBe(0);
    expect(coordinator.hasPending()).toBe(false);
  });
});
