import type { GenerateAsyncExecutor, GenerateAsyncPrevious } from './types.js';

/***
 * Execute synchronous or asynchronous inputs lazily and yield each completed result before continuing.
 */
export async function* generateAsync<TInput, TOutput, TFeedback = void>(
  inputs: AsyncIterable<TInput> | Iterable<TInput>,
  execute: GenerateAsyncExecutor<TInput, TOutput, TFeedback>,
): AsyncGenerator<TOutput, void, TFeedback> {
  let index = 0;
  let previous: GenerateAsyncPrevious<TOutput, TFeedback> | undefined;

  for await (const input of inputs) {
    const output = await execute(input, previous ? { index, previous } : { index });
    const feedback = yield output;
    previous = { output, feedback };
    index += 1;
  }
}
