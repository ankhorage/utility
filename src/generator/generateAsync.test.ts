import { expect, test } from 'bun:test';

import { generateAsync } from './index.js';

test('infers input and output types through the public generator facade', async () => {
  const generator: AsyncGenerator<string, void, void> = generateAsync([1], (input) =>
    input.toString(),
  );

  expect(await generator.next()).toEqual({ done: false, value: '1' });
});

test('executes one input per next call and passes previous output with feedback', async () => {
  const executions: number[] = [];
  const contexts: unknown[] = [];
  const generator = generateAsync<number, string, { readonly accepted: boolean }>(
    [2, 4],
    async (input, context) => {
      executions.push(input);
      contexts.push(context);
      await Promise.resolve();
      return `result-${input}`;
    },
  );

  expect(executions).toEqual([]);
  expect(await generator.next()).toEqual({ done: false, value: 'result-2' });
  expect(executions).toEqual([2]);
  expect(contexts).toEqual([{ index: 0 }]);

  expect(await generator.next({ accepted: true })).toEqual({
    done: false,
    value: 'result-4',
  });
  expect(executions).toEqual([2, 4]);
  expect(contexts).toEqual([
    { index: 0 },
    { index: 1, previous: { output: 'result-2', feedback: { accepted: true } } },
  ]);

  expect(await generator.next({ accepted: false })).toEqual({ done: true, value: undefined });
  expect(executions).toEqual([2, 4]);
});

test('consumes asynchronous inputs lazily and closes their iterator on cancellation', async () => {
  const events: string[] = [];

  async function* createInputs() {
    try {
      await Promise.resolve();
      events.push('first-input');
      yield 1;
      await Promise.resolve();
      events.push('second-input');
      yield 2;
    } finally {
      events.push('closed');
    }
  }

  const generator = generateAsync(createInputs(), (input) => input * 10);

  expect(events).toEqual([]);
  expect(await generator.next()).toEqual({ done: false, value: 10 });
  expect(events).toEqual(['first-input']);
  expect(await generator.return()).toEqual({ done: true, value: undefined });
  expect(events).toEqual(['first-input', 'closed']);
});

test('completes empty input without invoking the executor', async () => {
  let executions = 0;
  const generator = generateAsync([], () => {
    executions += 1;
    return 'unexpected';
  });

  expect(await generator.next()).toEqual({ done: true, value: undefined });
  expect(executions).toBe(0);
});

test('closes after an executor failure without yielding a successful result', async () => {
  const generator = generateAsync([1, 2], (input) => {
    if (input === 2) throw new Error('execution failed');
    return input;
  });

  expect(await generator.next()).toEqual({ done: false, value: 1 });
  try {
    await generator.next();
    throw new Error('Expected the executor to fail.');
  } catch (error) {
    expect(error).toEqual(new Error('execution failed'));
  }
  expect(await generator.next()).toEqual({ done: true, value: undefined });
});

test('propagates an asynchronous input failure and closes the generator', async () => {
  async function* createInputs() {
    await Promise.resolve();
    yield 'ready';
    await Promise.resolve();
    throw new Error('source failed');
  }

  const generator = generateAsync(createInputs(), (input) => input.toUpperCase());

  expect(await generator.next()).toEqual({ done: false, value: 'READY' });
  try {
    await generator.next();
    throw new Error('Expected the asynchronous input source to fail.');
  } catch (error) {
    expect(error).toEqual(new Error('source failed'));
  }
  expect(await generator.next()).toEqual({ done: true, value: undefined });
});
