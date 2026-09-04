/*** Convert an unknown thrown value into a stable human-readable message. */
export function toErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error.length > 0 ? error : fallback;
  if (error === null || error === undefined) return fallback;
  const message = String(error);
  return message.length > 0 ? message : fallback;
}
