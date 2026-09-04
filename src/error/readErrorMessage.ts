/*** Read a non-empty `message` field from an unknown structured error value. */
export function readErrorMessage(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const message: unknown = Reflect.get(value, 'message');
  return typeof message === 'string' && message.length > 0 ? message : undefined;
}
