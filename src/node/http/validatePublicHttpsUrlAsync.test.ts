import { describe, expect, test } from 'bun:test';

import type {
  PublicHttpsLookup,
  PublicHttpsRequest,
  PublicHttpsResolvedTarget,
} from '../../types/publicHttps.js';
import { validatePublicHttpsUrlAsync } from './validatePublicHttpsUrlAsync.js';

const publicLookup: PublicHttpsLookup = async (hostname) => [
  {
    address: hostname === 'docs.example.org' ? '1.1.1.1' : '8.8.8.8',
    family: 4,
  },
];

describe('public HTTPS validation', () => {
  test('rejects non-HTTPS URLs before network access', async () => {
    await expect(
      validatePublicHttpsUrlAsync('http://docs.example.org', {
        lookup: publicLookup,
        request: unexpectedRequest,
      }),
    ).rejects.toThrow('requires HTTPS');
  });

  test('rejects inline URL credentials before network access', async () => {
    await expect(
      validatePublicHttpsUrlAsync('https://user:secret@docs.example.org', {
        lookup: publicLookup,
        request: unexpectedRequest,
      }),
    ).rejects.toThrow('must not contain credentials');
  });

  test('rejects local and single-label hostnames before network access', async () => {
    for (const url of ['https://localhost/docs', 'https://service/docs']) {
      await expect(
        validatePublicHttpsUrlAsync(url, {
          lookup: publicLookup,
          request: unexpectedRequest,
        }),
      ).rejects.toThrow('hostname is not public');
    }
  });

  test('rejects hostnames resolving to any private address', async () => {
    const lookup: PublicHttpsLookup = async () => [
      { address: '1.1.1.1', family: 4 },
      { address: '127.0.0.1', family: 4 },
    ];

    await expect(
      validatePublicHttpsUrlAsync('https://docs.example.org', {
        lookup,
        request: unexpectedRequest,
      }),
    ).rejects.toThrow('non-public IP');
  });

  test('validates every redirect target before requesting it', async () => {
    const requested: string[] = [];
    const request: PublicHttpsRequest = async (target) => {
      requested.push(target.url.hostname);
      if (target.url.hostname === 'docs.example.org') {
        return { status: 302, location: 'https://guide.example.org/start' };
      }
      return { status: 200, location: null };
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
    const lookup: PublicHttpsLookup = async (hostname) =>
      hostname === 'private.example.org'
        ? [{ address: '10.0.0.1', family: 4 }]
        : [{ address: '1.1.1.1', family: 4 }];
    const request: PublicHttpsRequest = async (target) => {
      requested.push(target.url.hostname);
      return { status: 302, location: 'https://private.example.org/admin' };
    };

    await expect(
      validatePublicHttpsUrlAsync('https://docs.example.org', { lookup, request }),
    ).rejects.toThrow('non-public IP');
    expect(requested).toEqual(['docs.example.org']);
  });

  test('falls back to a bounded GET when HEAD is unsupported', async () => {
    const methods: string[] = [];
    const request: PublicHttpsRequest = async (_target, method) => {
      methods.push(method);
      return method === 'HEAD'
        ? { status: 405, location: null }
        : { status: 200, location: null };
    };

    await expect(
      validatePublicHttpsUrlAsync('https://docs.example.org', {
        lookup: publicLookup,
        request,
      }),
    ).resolves.toEqual({ url: 'https://docs.example.org/', status: 200 });
    expect(methods).toEqual(['HEAD', 'GET']);
  });

  test('rejects unreachable final statuses', async () => {
    const request: PublicHttpsRequest = async () => ({ status: 404, location: null });

    await expect(
      validatePublicHttpsUrlAsync('https://docs.example.org', {
        lookup: publicLookup,
        request,
      }),
    ).rejects.toThrow('status 404');
  });
});

/***
 * Fails a test when validation reaches the request boundary unexpectedly.
 */
async function unexpectedRequest(
  _target: PublicHttpsResolvedTarget,
): Promise<never> {
  throw new Error('Unexpected network request.');
}
