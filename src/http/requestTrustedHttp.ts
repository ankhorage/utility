import { parseTrustedHttpUrl } from '../url/parseTrustedHttpUrl.js';
import { readResponseTextLimited } from './readResponseTextLimited.js';
import type {
  TrustedHttpRequestInit,
  TrustedHttpRequestOptions,
  TrustedHttpResponse,
} from './types.js';

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

/*** Execute a credential-free, redirect-rejecting HTTP request with timeout, target, and response-size safeguards. */
export async function requestTrustedHttp(
  rawUrl: string,
  init: TrustedHttpRequestInit,
  options: TrustedHttpRequestOptions = {},
): Promise<TrustedHttpResponse> {
  const url = parseTrustedHttpUrl(rawUrl, options.blockedHostnames);
  const response = await (options.fetcher ?? fetch)(url, {
    method: init.method,
    headers: init.headers,
    body: init.body,
    credentials: 'omit',
    redirect: 'error',
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });
  const textPromise = readResponseTextLimited(
    response,
    options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES,
  );
  return { status: response.status, text: () => textPromise };
}
