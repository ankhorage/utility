import { describe, expect, test } from 'bun:test';

import { normalizeGitHubRepositoryUrl } from './normalizeGitHubRepositoryUrl';

describe('normalizeGitHubRepositoryUrl', () => {
  test('expands owner/repository shorthand', () => {
    expect(normalizeGitHubRepositoryUrl('ankhorage/zora')).toBe(
      'https://github.com/ankhorage/zora',
    );
  });

  test('expands github.com links without an explicit scheme', () => {
    expect(normalizeGitHubRepositoryUrl('github.com/ankhorage/zora')).toBe(
      'https://github.com/ankhorage/zora',
    );
  });

  test('preserves normal GitHub tree URLs', () => {
    expect(normalizeGitHubRepositoryUrl('https://github.com/ankhorage/zora/tree/main')).toBe(
      'https://github.com/ankhorage/zora/tree/main',
    );
  });

  test('trims surrounding whitespace', () => {
    expect(normalizeGitHubRepositoryUrl('  ankhorage/zora  ')).toBe(
      'https://github.com/ankhorage/zora',
    );
  });

  test('rejects non-GitHub and insecure URLs', () => {
    expect(() => normalizeGitHubRepositoryUrl('https://example.com/ankhorage/zora')).toThrow();
    expect(() => normalizeGitHubRepositoryUrl('http://github.com/ankhorage/zora')).toThrow();
  });
});
