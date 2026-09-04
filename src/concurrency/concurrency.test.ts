import { expect, test } from 'bun:test';

import { createExclusiveKeyedAsyncCoordinator } from './createExclusiveKeyedAsyncCoordinator.js';

function createDeferred<T>(): {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
} {
  let resolvePromise: ((value: T) => void) | null = null;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve: (value) => {
      resolvePromise?.(value);
    },
  };
}

test('same primary key stays busy through a shared coordinator', async () => {
  const coordinator = createExclusiveKeyedAsyncCoordinator<string, string>();
  const flush = createDeferred<void>();

  const first = coordinator.runKeyed('google', 'auth/oauth/google', async () => {
    await flush.promise;
    return 'linked';
  });

  expect(coordinator.isPrimaryBusy('google')).toBe(true);
  expect(
    await coordinator.runKeyed('google', 'auth/oauth/google', () => Promise.resolve('overlap')),
  ).toEqual({ ok: false, reason: 'primary_busy' });

  flush.resolve();
  expect(await first).toEqual({ ok: true, value: 'linked' });
  expect(coordinator.isPrimaryBusy('google')).toBe(false);
});

test('separate coordinator instances isolate state', async () => {
  const firstCoordinator = createExclusiveKeyedAsyncCoordinator<string, string>();
  const secondCoordinator = createExclusiveKeyedAsyncCoordinator<string, string>();
  const flush = createDeferred<void>();

  const first = firstCoordinator.runKeyed('google', 'auth/oauth/google', async () => {
    await flush.promise;
    return 'first';
  });
  expect(
    await secondCoordinator.runKeyed('google', 'auth/oauth/google', () =>
      Promise.resolve('second'),
    ),
  ).toEqual({ ok: true, value: 'second' });
  expect(firstCoordinator.isPrimaryBusy('google')).toBe(true);
  expect(secondCoordinator.isPrimaryBusy('google')).toBe(false);

  flush.resolve();
  expect(await first).toEqual({ ok: true, value: 'first' });
});

test('exclusive and keyed operations mutually exclude each other', async () => {
  const coordinator = createExclusiveKeyedAsyncCoordinator<string, string>();
  const keyedFlush = createDeferred<void>();
  const exclusiveFlush = createDeferred<void>();

  const keyed = coordinator.runKeyed('google', 'auth/oauth/google', async () => {
    await keyedFlush.promise;
    return 'keyed';
  });
  expect(await coordinator.runExclusive(() => Promise.resolve('exclusive'))).toEqual({
    ok: false,
    reason: 'keyed_busy',
  });
  keyedFlush.resolve();
  expect(await keyed).toEqual({ ok: true, value: 'keyed' });

  const exclusive = coordinator.runExclusive(async () => {
    await exclusiveFlush.promise;
    return 'exclusive';
  });
  expect(
    await coordinator.runKeyed('google', 'auth/oauth/google', () => Promise.resolve('google')),
  ).toEqual({ ok: false, reason: 'exclusive_busy' });
  expect(
    await coordinator.runKeyed('github', 'auth/oauth/github', () => Promise.resolve('github')),
  ).toEqual({ ok: false, reason: 'exclusive_busy' });
  exclusiveFlush.resolve();
  expect(await exclusive).toEqual({ ok: true, value: 'exclusive' });
});

test('different primary and secondary keys remain independent', async () => {
  const coordinator = createExclusiveKeyedAsyncCoordinator<string, string>();
  const googleFlush = createDeferred<void>();

  const google = coordinator.runKeyed('google', 'auth/oauth/google', async () => {
    await googleFlush.promise;
    return 'google';
  });
  expect(
    await coordinator.runKeyed('github', 'auth/oauth/github', () => Promise.resolve('github')),
  ).toEqual({ ok: true, value: 'github' });
  expect(coordinator.isPrimaryBusy('google')).toBe(true);
  expect(coordinator.isPrimaryBusy('github')).toBe(false);

  googleFlush.resolve();
  expect(await google).toEqual({ ok: true, value: 'google' });
});

test('active keyed operation blocks secondary-exclusive work for the same key only', async () => {
  const coordinator = createExclusiveKeyedAsyncCoordinator<string, string>();
  const flush = createDeferred<void>();
  let secondaryOperations = 0;

  const keyed = coordinator.runKeyed('google', 'auth/oauth/google', async () => {
    await flush.promise;
    return 'linked';
  });

  expect(coordinator.isSecondaryBusy('auth/oauth/google')).toBe(true);
  expect(
    await coordinator.runSecondaryExclusive('auth/oauth/google', () => {
      secondaryOperations += 1;
      return Promise.resolve('google');
    }),
  ).toEqual({ ok: false, reason: 'keyed_busy' });
  expect(
    await coordinator.runSecondaryExclusive('auth/oauth/github', () => {
      secondaryOperations += 1;
      return Promise.resolve('github');
    }),
  ).toEqual({ ok: true, value: 'github' });
  expect(secondaryOperations).toBe(1);

  flush.resolve();
  expect(await keyed).toEqual({ ok: true, value: 'linked' });
});

test('secondary-exclusive work blocks keyed operations for the same key only', async () => {
  const coordinator = createExclusiveKeyedAsyncCoordinator<string, string>();
  const flush = createDeferred<void>();
  let keyedWrites = 0;

  const secondary = coordinator.runSecondaryExclusive('auth/oauth/google', async () => {
    await flush.promise;
    return 'removed';
  });

  expect(
    await coordinator.runKeyed('google', 'auth/oauth/google', () => {
      keyedWrites += 1;
      return Promise.resolve('google');
    }),
  ).toEqual({ ok: false, reason: 'secondary_exclusive_busy' });
  expect(
    await coordinator.runKeyed('github', 'auth/oauth/github', () => {
      keyedWrites += 1;
      return Promise.resolve('github');
    }),
  ).toEqual({ ok: true, value: 'github' });
  expect(keyedWrites).toBe(1);

  flush.resolve();
  expect(await secondary).toEqual({ ok: true, value: 'removed' });
});

test('primary key stays busy for the whole operation', async () => {
  const coordinator = createExclusiveKeyedAsyncCoordinator<string, string>();
  const events: string[] = [];

  const result = await coordinator.runKeyed('google', 'auth/oauth/google', async () => {
    events.push('first');
    expect(coordinator.isPrimaryBusy('google')).toBe(true);
    await Promise.resolve();
    events.push('second');
    expect(coordinator.isPrimaryBusy('google')).toBe(true);
    return 'complete';
  });

  expect(result).toEqual({ ok: true, value: 'complete' });
  expect(events).toEqual(['first', 'second']);
  expect(coordinator.isPrimaryBusy('google')).toBe(false);
});
