import { decodeJsonResponse } from './decodeJsonResponse.js';
import type { ParsedJsonRequestOptions } from './types.js';

/*** Execute an injected HTTP request, decode JSON, run an optional safety assertion, map non-success status, and parse the payload. */
export async function requestParsedJson<TValue>(
  options: ParsedJsonRequestOptions<TValue>,
): Promise<TValue> {
  const response = await options.request(options.input, options.init);
  const value = await decodeJsonResponse(response, options.label);
  options.assertSafe?.(value);
  if (!response.ok) {
    throw (
      options.createHttpError?.(value, response) ??
      new Error(`${options.label ?? 'HTTP request'} failed (HTTP ${response.status}).`)
    );
  }
  return options.parse(value);
}
