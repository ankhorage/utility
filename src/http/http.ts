export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface JsonHttpResponse<TValue = unknown> {
  readonly response: Response;
  readonly value: TValue;
}

/***
 * Decode a response body as JSON and attach response context to invalid-JSON failures.
 */
export async function decodeJsonResponse(
  response: Response,
  label = 'HTTP response',
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} returned invalid JSON (HTTP ${response.status}).`);
  }
}

/***
 * Execute a fetch request and decode its body as JSON without imposing domain-specific status policy.
 */
export async function requestJson(
  input: RequestInfo | URL,
  init?: RequestInit,
  fetcher: FetchLike = fetch,
): Promise<JsonHttpResponse> {
  const response = await fetcher(input, init);
  return { response, value: await decodeJsonResponse(response) };
}

/***
 * Create JSON request options while preserving caller headers and additional request settings.
 */
export function createJsonRequestInit(
  method: string,
  body: unknown,
  init: Omit<RequestInit, 'body' | 'method'> = {},
): RequestInit {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return { ...init, method, headers, body: JSON.stringify(body) };
}

/***
 * Join a base URL and relative request path without duplicate boundary slashes.
 */
export function joinBaseUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/u, '')}/${path.replace(/^\/+ /u, '').replace(/^\/+/, '')}`;
}

/***
 * Create a fetch function that resolves relative request paths against one base URL.
 */
export function createBaseUrlFetch(
  baseUrl: string,
  fetcher: FetchLike = fetch,
): (path: string, init?: RequestInit) => Promise<Response> {
  return (path, init) => fetcher(joinBaseUrl(baseUrl, path), init);
}
