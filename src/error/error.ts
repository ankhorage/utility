/***
 * Convert an unknown thrown value into a stable human-readable message.
 */
export function toErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error.length > 0 ? error : fallback;
  if (error === null || error === undefined) return fallback;

  const message = String(error);
  return message.length > 0 ? message : fallback;
}

/***
 * Read a non-empty `message` field from an unknown structured error value.
 */
export function readErrorMessage(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const message = Reflect.get(value, 'message');
  return typeof message === 'string' && message.length > 0 ? message : undefined;
}
