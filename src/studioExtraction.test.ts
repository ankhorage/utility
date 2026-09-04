import { expect, test } from 'bun:test';

import {
  arraysEqual,
  dedupeBy,
  isStringArray,
  uniqueSortedStrings,
  upsertBy,
} from './array/index.js';
import { toStandaloneArrayBuffer } from './binary/index.js';
import { readFlag } from './cli/index.js';
import { groupBy, mapRecordEntries } from './collection/index.js';
import { formatDateTime } from './date/index.js';
import { readErrorMessage, toErrorMessage } from './error/index.js';
import { composeFirstDefined, noop } from './function/index.js';
import { rectArraysEqual, rectsEqual, toRect, unionRects } from './geometry/index.js';
import { readEnvString } from './node/env/index.js';
import {
  findAncestorDirectory,
  resolveModuleRelativePath,
  resolvePackageRoot,
} from './node/path/index.js';
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
  isRouteGroupSegment,
  normalizePathnameSegments,
  normalizeRoutePatternSegments,
  scoreRoutePatternMatch,
} from './route/index.js';
import { scoreBestTextMatch, scoreTextMatch } from './search/index.js';
import {
  isNonEmptyString,
  normalizeSearchText,
  parseCommaSeparatedList,
  titleCaseIdentifier,
} from './string/index.js';
import {
  cloneTreeWithNewIds,
  findTreeNode,
  findTreeNodeWithParent,
  insertTreeChildAtIndex,
  isTreeDescendant,
  removeTreeNodeWithValue,
  type TreeAdapter,
  treeContainsId,
  updateTreeNode,
} from './tree/index.js';
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
  expect(
    isRecordOf(
      { one: '1', two: '2' },
      (value): value is string => typeof value === 'string',
    ),
  ).toBe(true);
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

test('normalizes reusable string and search forms', () => {
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
  expect(scoreTextMatch('hello world', 'hello')).toBe(50);
  expect(scoreTextMatch('hello', 'hello')).toBe(100);
  expect(scoreBestTextMatch(['alpha', 'hello world'], 'hello')).toBe(50);
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

test('normalizes and scores route-pattern segments', () => {
  expect(isRouteGroupSegment('(tabs)')).toBe(true);
  expect(normalizePathnameSegments('/users/42?view=full')).toEqual(['users', '42']);
  expect(normalizeRoutePatternSegments(['index', '(tabs)', 'users/[id]', 'index'])).toEqual([
    'users',
    '[id]',
  ]);
  expect(scoreRoutePatternMatch(['users', '[id]'], ['users', '42'])).toBe(115);
  expect(scoreRoutePatternMatch(['users', '[...rest]'], ['users', '42', 'details'])).toBe(101);
  expect(scoreRoutePatternMatch(['users'], ['users', '42'])).toBeNull();
});

test('groups and projects collection entries', () => {
  const groups = groupBy(
    [
      { kind: 'a', value: 1 },
      { kind: 'b', value: 2 },
      { kind: 'a', value: 3 },
    ],
    (item) => item.kind,
  );
  expect(groups.get('a')?.map((item) => item.value)).toEqual([1, 3]);
  expect(mapRecordEntries({ a: 1, b: 2 }, ([key, value]) => `${key}:${value}`)).toEqual([
    'a:1',
    'b:2',
  ]);
});

test('provides reusable rectangle operations', () => {
  expect(
    unionRects([
      { x: 10, y: 10, width: 20, height: 20 },
      { x: 0, y: 5, width: 15, height: 10 },
    ]),
  ).toEqual({ x: 0, y: 5, width: 30, height: 25 });
  expect(toRect({ left: 2, top: 3, width: 4, height: 5 })).toEqual({
    x: 2,
    y: 3,
    width: 4,
    height: 5,
  });
  expect(
    rectsEqual(
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 0.1, y: 0, width: 10, height: 10 },
      0.2,
    ),
  ).toBe(true);
  expect(
    rectArraysEqual(
      [{ x: 0, y: 0, width: 1, height: 1 }],
      [{ x: 0, y: 0, width: 1, height: 1 }],
    ),
  ).toBe(true);
});

test('copies typed-array views into exact standalone buffers', () => {
  const source = new Uint8Array([1, 2, 3, 4]);
  const view = source.subarray(1, 3);
  const buffer = toStandaloneArrayBuffer(view);
  expect([...new Uint8Array(buffer)]).toEqual([2, 3]);
});

test('reads CLI flags and environment variables without inherited values', () => {
  expect(readFlag(['--name', 'Studio'], '--name')).toBe('Studio');
  expect(readFlag(['--name', '  '], '--name')).toBeNull();
  expect(readFlag([], '--name')).toBeNull();

  const environment = Object.create({ INHERITED: 'no' }) as Record<string, string | undefined>;
  environment.EXPLICIT = 'yes';
  expect(readEnvString('EXPLICIT', environment)).toBe('yes');
  expect(readEnvString('INHERITED', environment)).toBeUndefined();
});

test('resolves module-relative paths and walks ancestor directories', () => {
  expect(resolveModuleRelativePath('file:///tmp/example/dist/index.js', '..')).toBe('/tmp/example');
  expect(resolvePackageRoot('file:///tmp/example/dist/cli/index.js')).toBe('/tmp/example');
  expect(findAncestorDirectory('/a/b/c', (directory) => directory === '/a')).toBe('/a');
  expect(findAncestorDirectory('/a/b', () => false)).toBeUndefined();
});

interface TestTreeNode {
  readonly id: string;
  readonly value: number;
  readonly children?: readonly TestTreeNode[];
}

const treeAdapter: TreeAdapter<TestTreeNode> = {
  getId: (node) => node.id,
  getChildren: (node) => node.children,
  withChildren: (node, children) => ({ ...node, children }),
};

const testTree: TestTreeNode = {
  id: 'root',
  value: 0,
  children: [
    { id: 'a', value: 1 },
    { id: 'b', value: 2, children: [{ id: 'c', value: 3 }] },
  ],
};

test('finds, updates, moves through, and clones generic trees immutably', () => {
  expect(findTreeNode(testTree, 'c', treeAdapter)?.value).toBe(3);
  expect(treeContainsId(testTree, 'missing', treeAdapter)).toBe(false);
  expect(findTreeNodeWithParent(testTree, 'c', treeAdapter)?.parent?.id).toBe('b');
  expect(isTreeDescendant(testTree, 'b', 'c', treeAdapter)).toBe(true);
  expect(isTreeDescendant(testTree, 'b', 'b', treeAdapter)).toBe(false);

  const updated = updateTreeNode(
    testTree,
    'c',
    (node) => ({ ...node, value: 4 }),
    treeAdapter,
  );
  expect(findTreeNode(updated, 'c', treeAdapter)?.value).toBe(4);
  expect(testTree.children?.[0]).toBe(updated.children?.[0]);

  const removed = removeTreeNodeWithValue(testTree, 'c', treeAdapter);
  expect(removed.removed?.id).toBe('c');
  expect(treeContainsId(removed.root ?? testTree, 'c', treeAdapter)).toBe(false);

  const inserted = insertTreeChildAtIndex(
    testTree,
    'a',
    { id: 'x', value: 9 },
    0,
    treeAdapter,
  );
  expect(inserted.inserted).toBe(true);
  expect(findTreeNode(inserted.root, 'x', treeAdapter)?.value).toBe(9);

  let nextId = 0;
  const cloned = cloneTreeWithNewIds(
    testTree,
    () => `copy-${nextId++}`,
    {
      ...treeAdapter,
      withId: (node, id) => ({ ...node, id }),
    },
  );
  expect(cloned.id).toBe('copy-0');
  expect(cloned.children?.[0]?.id).toBe('copy-1');
});
