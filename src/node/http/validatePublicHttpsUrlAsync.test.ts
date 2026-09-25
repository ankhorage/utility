import { describe, expect, test } from 'bun:test';

import type {
  PublicHttpsLookup,
  PublicHttpsRequest,
  PublicHttpsResolvedTarget,
} from '../../types/publicHttps.js';
import { validatePublicHttpsUrlAsync } from './validatePublicHttpsUrlAsync.js';

const publicLookup: PublicHttpsLookup = (hostname) =>
  Promise.resolve([
    {
      address: hostname === 'docs.example.org' ? '1.1.1.1' : '8.8.8.8',
      family: 4,
    },
  ]);

describe('public HTTPS target policy', () => {
  test('rejects non-HTTPS URLs before network access', async () => {
    const message = await readRejectionMessageAsync(
      validatePublicHttpsUrlAsync('http://docs.example.org', {
        lookup: publicLookup,
        request: unexpectedRequest,
      }),
    );
    expect(message).toContain('requires HTTPS');
  });

  test('rejects inline URL credentials before network access', async () => {
    const message = await readRejectionMessageAsync(
      validatePublicHttpsUrlAsync('https://user:secret@docs.example.org', {
        lookup: publicLookup,
        request: unexpectedRequest,
      }),
    );
    expect(message).toContain('must not contain credentials');
  });

  test('rejects local and single-label hostnames before network access', async () => {
    for (const url of ['https://localhost/docs', 'https://service/docs']) {
      const message = await readRejectionMessageAsync(
        validatePublicHttpsUrlAsync(url, {
          lookup: publicLookup,
          request: unexpectedRequest,
        }),
      );
      expect(message).toContain('hostname is not public');
    }
  });

  test('rejects hostnames resolving to any private address', async () => {
    const lookup: PublicHttpsLookup = () =>
      Promise.resolve([
        { address: '1.1.1.1', family: 4 },
        { address: '127.0.0.1', family: 4 },
      ]);
    const message = await readRejectionMessageAsync(
      validatePublicHttpsUrlAsync('https://docs.example.org', {
        lookup,
        request: unexpectedRequest,
      }),
    );
    expect(message).toContain('non-public IP');
  });
});

describe('public HTTPS redirect validation', () => {
  test('validates every redirect target before requesting it', async () => {
    const requested: string[] = [];
    const request: PublicHttpsRequest = (target) => {
      requested.push(target.url.hostname);
      return Promise.resolve(
        target.url.hostname === 'docs.example.org'
          ? { status: 302, location: 'https://guide.example.org/start' }
          : { status: 200, location: null },
      );
    };

    const result = await validatePublicHttpsUrlAsync('https://docs.example.org', {
      lookup: publicLookup,
      request,
    });

    expect(requested).toEqual(['docs.example.org', 'guide.example.org']);
    expect(result).toEqual({ url: 'https://guide.example.org/start', status: 200 });
  });

  test('does not request a redirect target that resolves privately', async () => {
    const requested: string[] = [];
    const lookup: PublicHttpsLookup = (hostname) =>
      Promise.resolve(
        hostname === 'private.example.org'
          ? [{ address: '10.0.0.1', family: 4 }]
          : [{ address: '1.1.1.1', family: 4 }],
      );
    const request: PublicHttpsRequest = (target) => {
      requested.push(target.url.hostname);
      return Promise.resolve({ status: 302, location: 'https://private.example.org/admin' });
    };

    const message = await readRejectionMessageAsync(
      validatePublicHttpsUrlAsync('https://docs.example.org', { lookup, request }),
    );
    expect(message).toContain('non-public IP');
    expect(requested).toEqual(['docs.example.org']);
  });
});

describe('public HTTPS response validation', () => {
  test('falls back to a bounded GET when HEAD is unsupported', async () => {
    const methods: string[] = [];
    const request: PublicHttpsRequest = (_target, method) => {
      methods.push(method);
      return Promise.resolve(
        method === 'HEAD' ? { status: 405, location: null } : { status: 200, location: null },
      );
    };

    const result = await validatePublicHttpsUrlAsync('https://docs.example.org', {
      lookup: publicLookup,
      request,
    });

    expect(result).toEqual({ url: 'https://docs.example.org/', status: 200 });
    expect(methods).toEqual(['HEAD', 'GET']);
  });

  test('rejects unreachable final statuses', async () => {
    const request: PublicHttpsRequest = () => Promise.resolve({ status: 404, location: null });
    const message = await readRejectionMessageAsync(
      validatePublicHttpsUrlAsync('https://docs.example.org', {
        lookup: publicLookup,
        request,
      }),
    );
    expect(message).toContain('status 404');
  });
});

/***
 * Returns the error message produced by a rejected validation promise.
 */
async function readRejectionMessageAsync(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return '';
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/***
 * Fails a test when validation reaches the request boundary unexpectedly.
 */
function unexpectedRequest(_target: PublicHttpsResolvedTarget): Promise<never> {
  return Promise.reject(new Error('Unexpected network request.'));
}
