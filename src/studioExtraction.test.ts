import { expect, test } from 'bun:test';

import { arraysEqual, dedupeBy, isStringArray, uniqueSortedStrings, upsertBy } from './array/index.js';
import { formatDateTime } from './date/index.js';
import { readErrorMessage, toErrorMessage } from './error/index.js';
import { composeFirstDefined, noop } from './function/index.js';
import { parseFiniteNumber, parseNonNegativeNumber } from './number/index.js';
import {
  asRecord,
  deleteOwnProperty,
  hasOnlyKeys,
  isEmptyRecord,
  isRecord,
  isRecordOf,
  readOwnProperty,
  setOwnProperty,
} from './object/index.js';
import {
  isNonEmptyString,
  normalizeSearchText,
  parseCommaSeparatedList,
  titleCaseIdentifier,
} from './string/index.js';
import {
  appendEncodedPathSegment,
  firstStringParam,
  isPathAtOrBelow,
  normalizeCredentialFreeHttpUrl,
  normalizePathname,
  setOptionalQueryParam,
} from './url/index.js';
import { asFiniteNumber, asNonEmptyString, asString, isOneOf } from './value/index.js';

test('narrows and manipulates records without prototype traversal', () => {
  const record: Record<string, unknown> = { existing: 1 };
  const inherited = Object.create({ hidden: 2 }) as Record<string, unknown>;

  expect(isRecord(record)).toBe(true);
  expect(isRecord([])).toBe(false);
  expect(asRecord(record)).toBe(record);
  expect(readOwnProperty<number>(record, 'existing')).toBe(1);
  expect(readOwnProperty<number>(inherited, 'hidden')).toBeUndefined();
  setOwnProperty(record, 'added', 2);
  expect(record.added).toBe(2);
  expect(deleteOwnProperty(record, 'added')).toBe(true);
  expect(deleteOwnProperty(record, 'missing')).toBe(false);
  expect(hasOnlyKeys(record, ['existing'])).toBe(true);
  expect(isEmptyRecord({})).toBe(true);
  expect(isRecordOf({ one: '1', two: '2' }, (value): value is string => typeof value === 'string')).toBe(true);
});

test('narrows primitive values without implicit coercion', () => {
  expect(asString('value')).toBe('value');
  expect(asString(1)).toBeUndefined();
  expect(asNonEmptyString('  value  ')).toBe('value');
  expect(asNonEmptyString('   ')).toBeUndefined();
  expect(asFiniteNumber(4)).toBe(4);
  expect(asFiniteNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
  expect(isOneOf('b', ['a', 'b'] as const)).toBe(true);
  expect(isOneOf('c', ['a', 'b'] as const)).toBe(false);
});

test('normalizes error messages with explicit fallback semantics', () => {
  expect(toErrorMessage(new Error('boom'))).toBe('boom');
  expect(toErrorMessage('', 'fallback')).toBe('fallback');
  expect(toErrorMessage(null, 'fallback')).toBe('fallback');
  expect(readErrorMessage({ message: 'bad request' })).toBe('bad request');
  expect(readErrorMessage({ message: '' })).toBeUndefined();
});

test('composes first-defined resolvers and exposes noop', () => {
  const resolve = composeFirstDefined<number, string>([
    (value) => (value > 10 ? 'large' : undefined),
    (value) => (value > 0 ? 'positive' : undefined),
  ]);
  expect(resolve(12)).toBe('large');
  expect(resolve(2)).toBe('positive');
  expect(resolve(0)).toBeUndefined();
  expect(noop()).toBeUndefined();
});

test('parses finite and non-negative numeric strings', () => {
  expect(parseFiniteNumber(' 1.5 ')).toBe(1.5);
  expect(parseFiniteNumber('')).toBeNull();
  expect(parseFiniteNumber('nope')).toBeNull();
  expect(parseNonNegativeNumber('0')).toBe(0);
  expect(parseNonNegativeNumber('-1')).toBeNull();
});

test('provides immutable array equality, upsert, dedupe, and string-array helpers', () => {
  expect(arraysEqual([1, 2], [1, 2])).toBe(true);
  expect(arraysEqual([1, 2], [2, 1])).toBe(false);
  expect(upsertBy([{ id: 'a', value: 1 }], { id: 'a', value: 2 }, (item) => item.id)).toEqual([
    { id: 'a', value: 2 },
  ]);
  expect(dedupeBy([{ id: 'a' }, { id: 'a' }, { id: 'b' }], (item) => item.id)).toEqual([
    { id: 'a' },
    { id: 'b' },
  ]);
  expect(isStringArray(['a', 'b'])).toBe(true);
  expect(isStringArray(['a', 1])).toBe(false);
  expect(uniqueSortedStrings(['b', 'a', 'b'])).toEqual(['a', 'b']);
});

test('normalizes reusable string forms', () => {
  expect(isNonEmptyString(' value ')).toBe(true);
  expect(isNonEmptyString('   ')).toBe(false);
  expect(titleCaseIdentifier('splitComplementary')).toBe('Split Complementary');
  expect(titleCaseIdentifier('hello_world')).toBe('Hello world');
  expect(normalizeSearchText('  HeLLo  ')).toBe('hello');
  expect(parseCommaSeparatedList('email, phone, email, , username')).toEqual([
    'email',
    'phone',
    'username',
  ]);
});

test('formats dates with explicit fallback and invalid-input behavior', () => {
  expect(formatDateTime(undefined, { fallback: 'Not recorded' })).toBe('Not recorded');
  expect(formatDateTime('invalid', { fallback: 'Unknown', invalid: 'fallback' })).toBe('Unknown');
  expect(formatDateTime('invalid')).toBe('invalid');
});

test('normalizes path, query, parameter, and HTTP URL primitives', () => {
  const query = new URLSearchParams();
  setOptionalQueryParam(query, 'width', 320);
  setOptionalQueryParam(query, 'missing', undefined);
  expect(query.toString()).toBe('width=320');
  expect(normalizePathname(' /projects//one/?view=details#x ')).toBe('/projects/one');
  expect(firstStringParam(['first', 'second'])).toBe('first');
  expect(appendEncodedPathSegment('/projects', 'hello world')).toBe('/projects/hello%20world');
  expect(isPathAtOrBelow('/projects/one', '/projects')).toBe(true);
  expect(isPathAtOrBelow('/anything', '/')).toBe(true);
  expect(isPathAtOrBelow('/projects-old', '/projects')).toBe(false);
  expect(normalizeCredentialFreeHttpUrl('https://example.com/api')).toBe('https://example.com/api');
  expect(normalizeCredentialFreeHttpUrl('https://user:secret@example.com')).toBeNull();
  expect(normalizeCredentialFreeHttpUrl('ftp://example.com')).toBeNull();
});
