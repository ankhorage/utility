import { expect, test } from 'bun:test';

import { createKeyedAsyncMutex } from './createKeyedAsyncMutex.js';

test('keyed async mutex rejects concurrent work for one key and always releases', async () => {
  const mutex = createKeyedAsyncMutex<string>({
    createBusyError: () => new Error('DEPLOY_RELEASE_MUTATION_IN_PROGRESS'),
  });
  let releaseFirst = (): void => {
    throw new Error('First guarded operation resolver was not initialized.');
  };
  const first = mutex.run(
    'demo',
    () =>
      new Promise<void>((resolve) => {
        releaseFirst = resolve;
      }),
  );

  const error = await captureError(() => mutex.run('demo', () => Promise.resolve()));
  expect(error.message).toBe('DEPLOY_RELEASE_MUTATION_IN_PROGRESS');
  await mutex.run('other-project', () => Promise.resolve());

  releaseFirst();
  await first;
  await mutex.run('demo', () => Promise.resolve());
});

async function captureError(action: () => Promise<unknown>): Promise<Error> {
  try {
    await action();
  } catch (error) {
    if (error instanceof Error) return error;
    return new Error(String(error), { cause: error });
  }
  throw new Error('Expected operation to fail.');
}
