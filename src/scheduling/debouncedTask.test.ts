import { describe, expect, it } from 'bun:test';

import { createDebouncedTask } from './index.js';

function createFakeScheduler() {
  let now = 0;
  let nextHandle = 1;
  const callbacks = new Map<number, { callback: () => void; deadline: number }>();

  return {
    scheduler: {
      schedule: (callback: () => void, delayMs: number) => {
        const handle = nextHandle++;
        callbacks.set(handle, { callback, deadline: now + delayMs });
        return handle;
      },
      cancel: (handle: number) => {
        callbacks.delete(handle);
      },
    },
    advance: (elapsedMs: number) => {
      now += elapsedMs;
      for (const [handle, task] of [...callbacks]) {
        if (task.deadline > now) continue;
        callbacks.delete(handle);
        task.callback();
      }
    },
  };
}

describe('debounced task', () => {
  it('restarts the delay and executes only after the final request', () => {
    const clock = createFakeScheduler();
    let value = 'H';
    const calls: string[] = [];
    const task = createDebouncedTask(() => calls.push(value), clock.scheduler, 600);

    task.request();
    clock.advance(500);
    value = 'Hallo';
    task.request();
    clock.advance(599);

    expect(calls).toEqual([]);
    expect(task.hasPending()).toBe(true);
    clock.advance(1);
    expect(calls).toEqual(['Hallo']);
    expect(task.hasPending()).toBe(false);
    clock.advance(600);
    expect(calls).toEqual(['Hallo']);
  });

  it('flushes a pending callback once and can be reused', () => {
    const clock = createFakeScheduler();
    let calls = 0;
    const task = createDebouncedTask(() => {
      calls += 1;
    }, clock.scheduler, 600);

    expect(task.flush()).toBe(false);
    task.request();
    expect(task.flush()).toBe(true);
    expect(task.hasPending()).toBe(false);
    expect(task.flush()).toBe(false);
    clock.advance(600);
    expect(calls).toBe(1);

    task.request();
    clock.advance(600);
    expect(calls).toBe(2);
  });

  it('cancels pending work without running it', () => {
    const clock = createFakeScheduler();
    let calls = 0;
    const task = createDebouncedTask(() => {
      calls += 1;
    }, clock.scheduler, 600);

    task.request();
    task.cancel();
    expect(task.hasPending()).toBe(false);
    expect(task.flush()).toBe(false);
    clock.advance(600);
    expect(calls).toBe(0);
  });
});
