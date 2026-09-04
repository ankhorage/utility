/*** Project a structured error-like value to its public code/message pair. */
export function pickCodeMessage(error: {
  readonly code: string;
  readonly message: string;
}): { readonly code: string; readonly message: string } {
  return { code: error.code, message: error.message };
}
