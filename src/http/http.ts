export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface JsonHttpResponse<TValue = unknown> {
  readonly response: Response;
  readonly value: TValue;
}

export interface WaitForHttpOptions {
  readonly accept?: (response: Response) => boolean;
  readonly fetcher?: FetchLike;
  readonly intervalMs?: number;
  readonly now?: () => number;
  readonly sleep?: (delayMs: number) => Promise<void>;
  readonly timeoutMs: number;
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
  return `${baseUrl.replace(/\/+$/u, '')}/${path.replace(/^\/+/, '')}`;
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

/***
 * Resolve after a delay using the host timer implementation.
 */
function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

/***
 * Poll an HTTP resource until a response satisfies an acceptance predicate or a timeout expires.
 */
export async function waitForHttp(
  input: RequestInfo | URL,
  options: WaitForHttpOptions,
): Promise<Response> {
  const accept = options.accept ?? ((response: Response) => response.status < 500);
  const fetcher = options.fetcher ?? fetch;
  const intervalMs = options.intervalMs ?? 250;
  const now = options.now ?? Date.now;
  const sleepFor = options.sleep ?? sleep;
  const startedAt = now();

  while (now() - startedAt < options.timeoutMs) {
    try {
      const response = await fetcher(input);
      if (accept(response)) return response;
    } catch {
      // Network failures are expected while the target server is still starting.
    }
    await sleepFor(intervalMs);
  }
  throw new Error(`Timed out waiting for ${String(input)}.`);
}
