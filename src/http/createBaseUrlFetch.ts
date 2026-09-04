import { joinBaseUrl } from './joinBaseUrl.js';
import type { FetchLike } from './types.js';

/*** Create a fetch function that resolves relative request paths against one base URL. */
export function createBaseUrlFetch(
  baseUrl: string,
  fetcher: FetchLike = fetch,
): (path: string, init?: RequestInit) => Promise<Response> {
  return (path, init) => fetcher(joinBaseUrl(baseUrl, path), init);
}
