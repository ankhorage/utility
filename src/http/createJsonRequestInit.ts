/*** Create JSON request options while preserving caller headers and additional request settings. */
export function createJsonRequestInit(
  method: string,
  body: unknown,
  init: Omit<RequestInit, 'body' | 'method'> = {},
): RequestInit {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return { ...init, method, headers, body: JSON.stringify(body) };
}
