import { decodeJsonResponse } from './decodeJsonResponse.js';
import type { FetchLike, JsonHttpResponse } from './types.js';

/*** Execute a fetch request and decode its body as JSON without imposing domain-specific status policy. */
export async function requestJson(
  input: string | URL,
  init?: RequestInit,
  fetcher: FetchLike = fetch,
): Promise<JsonHttpResponse> {
  const response = await fetcher(input, init);
  return { response, value: await decodeJsonResponse(response) };
}
