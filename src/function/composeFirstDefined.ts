import type { Resolver } from './types.js';

/*** Compose resolvers and return the first defined result for an input. */
export function composeFirstDefined<TInput, TOutput>(
  resolvers: readonly Resolver<TInput, TOutput>[],
): Resolver<TInput, TOutput> {
  return (input) => {
    for (const resolver of resolvers) {
      const result = resolver(input);
      if (result !== undefined) return result;
    }
    return undefined;
  };
}
