import { lookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';

import type {
  PublicHttpsAddress,
  PublicHttpsLookup,
  PublicHttpsRequest,
  PublicHttpsResolvedTarget,
  PublicHttpsResponseMetadata,
  PublicHttpsValidationOptions,
  PublicHttpsValidationResult,
} from '../../types/publicHttps.js';
import { isPublicIpAddress } from '../net/isPublicIpAddress.js';

const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_MAX_REDIRECTS = 5;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const GET_FALLBACK_STATUSES = new Set([405, 501]);
const BLOCKED_HOST_SUFFIXES = [
  '.internal',
  '.invalid',
  '.local',
  '.localhost',
  '.test',
  '.example',
  '.home.arpa',
] as const;

/***
 * Validates that a URL is reachable through public HTTPS without allowing requests to private
 * network targets or unsafe redirect destinations.
 */
export async function validatePublicHttpsUrlAsync(
  rawUrl: string,
  options: PublicHttpsValidationOptions = {},
): Promise<PublicHttpsValidationResult> {
  const lookupAsync = options.lookup ?? lookupPublicAddressesAsync;
  const requestAsync = options.request ?? requestPinnedHttpsAsync;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  return validateHopAsync(rawUrl, 0, {
    lookupAsync,
    requestAsync,
    timeoutMs,
    maxRedirects,
  });
}

interface ValidationContext {
  readonly lookupAsync: PublicHttpsLookup;
  readonly requestAsync: PublicHttpsRequest;
  readonly timeoutMs: number;
  readonly maxRedirects: number;
}

/***
 * Validates one URL hop and recursively validates each redirect before requesting it.
 */
async function validateHopAsync(
  rawUrl: string,
  redirectCount: number,
  context: ValidationContext,
): Promise<PublicHttpsValidationResult> {
  const target = await resolvePublicTargetAsync(rawUrl, context.lookupAsync);
  const head = await context.requestAsync(target, 'HEAD', context.timeoutMs);
  const response = GET_FALLBACK_STATUSES.has(head.status)
    ? await context.requestAsync(target, 'GET', context.timeoutMs)
    : head;

  if (REDIRECT_STATUSES.has(response.status)) {
    if (response.location === null) {
      throw new Error('Public HTTPS target redirected without a Location header.');
    }
    if (redirectCount >= context.maxRedirects) {
      throw new Error('Public HTTPS target exceeded the redirect limit.');
    }

    const nextUrl = new URL(response.location, target.url).toString();
    return validateHopAsync(nextUrl, redirectCount + 1, context);
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Public HTTPS target returned status ${response.status}.`);
  }

  return { url: target.url.toString(), status: response.status };
}

/***
 * Parses and resolves one HTTPS target while rejecting credentials, local names, and non-public IPs.
 */
async function resolvePublicTargetAsync(
  rawUrl: string,
  lookupAsync: PublicHttpsLookup,
): Promise<PublicHttpsResolvedTarget> {
  const url = parsePublicHttpsUrl(rawUrl);
  const hostname = normalizeHostname(url.hostname);
  const literalFamily = isIP(hostname);

  if (literalFamily === 4 || literalFamily === 6) {
    if (!isPublicIpAddress(hostname)) {
      throw new Error('HTTPS target resolves to a non-public IP address.');
    }

    return {
      url,
      address: { address: hostname, family: literalFamily },
    };
  }

  if (isBlockedHostname(hostname)) {
    throw new Error('HTTPS target hostname is not public.');
  }

  const addresses = await lookupAsync(hostname);
  if (addresses.length === 0) {
    throw new Error('HTTPS target did not resolve to an IP address.');
  }
  if (addresses.some((entry) => !isPublicIpAddress(entry.address))) {
    throw new Error('HTTPS target resolves to a non-public IP address.');
  }

  const [address] = addresses;
  if (address === undefined) {
    throw new Error('HTTPS target did not resolve to an IP address.');
  }

  return { url, address };
}

/***
 * Parses the public HTTPS URL syntax accepted by the hardened validator.
 */
function parsePublicHttpsUrl(rawUrl: string): URL {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:') {
    throw new Error('Public URL validation requires HTTPS.');
  }
  if (url.username || url.password) {
    throw new Error('Public HTTPS URLs must not contain credentials.');
  }
  return url;
}

/***
 * Normalizes bracketed IPv6 URL hostnames for IP classification and DNS policy.
 */
function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, '').toLowerCase();
}

/***
 * Rejects names reserved for local, example, testing, or internal resolution.
 */
function isBlockedHostname(hostname: string): boolean {
  if (hostname === 'localhost') return true;
  if (!hostname.includes('.')) return true;
  return BLOCKED_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix),
  );
}

/***
 * Resolves all addresses for a hostname without applying a local search-domain policy.
 */
async function lookupPublicAddressesAsync(
  hostname: string,
): Promise<readonly PublicHttpsAddress[]> {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  return addresses.flatMap((entry): PublicHttpsAddress[] =>
    entry.family === 4 || entry.family === 6
      ? [{ address: entry.address, family: entry.family }]
      : [],
  );
}

/***
 * Performs an HTTPS request pinned to the previously validated address so DNS cannot change
 * between validation and connection establishment.
 */
async function requestPinnedHttpsAsync(
  target: PublicHttpsResolvedTarget,
  method: 'HEAD' | 'GET',
  timeoutMs: number,
): Promise<PublicHttpsResponseMetadata> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      target.url,
      {
        method,
        headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
        lookup: (_hostname, _options, callback) => {
          callback(null, target.address.address, target.address.family);
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const location =
          typeof response.headers.location === 'string' ? response.headers.location : null;
        response.destroy();
        resolve({ status, location });
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error('Public HTTPS request timed out.'));
    });
    request.on('error', reject);
    request.end();
  });
}
