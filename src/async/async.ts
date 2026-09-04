export type AsyncLoadable<TValue> =
  | { readonly status: 'ready'; readonly data: TValue }
  | { readonly status: 'error'; readonly message: string };

/***
 * Convert a promise into a ready/error loadable result while normalizing unknown failures to text.
 */
export async function captureAsync<TValue>(
  operation: Promise<TValue>,
  toMessage: (error: unknown) => string = String,
): Promise<AsyncLoadable<TValue>> {
  try {
    return { status: 'ready', data: await operation };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : toMessage(error),
    };
  }
}
