import { describe, expect, it } from 'bun:test';

import { satisfiesCaretSemverRange } from './satisfiesCaretSemverRange.js';
import { SEMVER_PATTERNS } from './semverPatterns.js';

describe('SEMVER_PATTERNS', () => {
  it.each([
    ['exact', SEMVER_PATTERNS.exact, ['0.0.0', '1.2.3'], ['1.2', '01.2.3', '1.2.3-beta']],
    [
      'exactWithPrerelease',
      SEMVER_PATTERNS.exactWithPrerelease,
      ['0.0.0', '1.2.3', '1.2.3-beta.1'],
      ['1.2', '01.2.3', '1.2.3+build'],
    ],
    ['caret', SEMVER_PATTERNS.caret, ['^0.2.3', '^1.2.3'], ['1.2.3', '^01.2.3']],
    ['tilde', SEMVER_PATTERNS.tilde, ['~0.2.3', '~1.2.3'], ['1.2.3', '~01.2.3']],
    ['majorWildcard', SEMVER_PATTERNS.majorWildcard, ['0.x', '12.x'], ['x', '01.x', '1.2.x']],
    [
      'minorWildcard',
      SEMVER_PATTERNS.minorWildcard,
      ['0.0.x', '1.2.x'],
      ['1.x', '01.2.x', '1.02.x'],
    ],
  ])('matches canonical %s syntax', (_name, pattern, matching, rejected) => {
    for (const value of matching) expect(value).toMatch(pattern);
    for (const value of rejected) expect(value).not.toMatch(pattern);
  });
});

describe('satisfiesCaretSemverRange', () => {
  it.each([
    ['2.9.0', true],
    ['2.9.1', true],
    ['2.10.0', true],
    ['2.8.9', false],
    ['3.0.0', false],
    ['1.99.0', false],
  ])('evaluates %s against ^2.9.0', (version, expected) => {
    expect(satisfiesCaretSemverRange(version, '^2.9.0')).toBe(expected);
  });
});
