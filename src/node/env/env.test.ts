import { expect, test } from 'bun:test';

import { readEnvBoolean, readEnvNumber, readEnvString } from './index.js';

const environment = (value: string | undefined) => ({ TEST_VALUE: value });

test('reads non-empty environment strings through the public facade', () => {
  expect(readEnvString('TEST_VALUE', environment('value'))).toBe('value');
  expect(readEnvString('TEST_VALUE', environment(''))).toBeUndefined();
  expect(readEnvString('TEST_VALUE', {})).toBeUndefined();
});

test('reads only explicit boolean environment values', () => {
  expect(readEnvBoolean('TEST_VALUE', environment('true'))).toBe(true);
  expect(readEnvBoolean('TEST_VALUE', environment('false'))).toBe(false);
  expect(readEnvBoolean('TEST_VALUE', environment('TRUE'))).toBeUndefined();
  expect(readEnvBoolean('TEST_VALUE', environment('1'))).toBeUndefined();
  expect(readEnvBoolean('TEST_VALUE', environment(undefined))).toBeUndefined();
});

test('reads finite numeric environment values', () => {
  expect(readEnvNumber('TEST_VALUE', environment('123'))).toBe(123);
  expect(readEnvNumber('TEST_VALUE', environment('0.5'))).toBe(0.5);
  expect(readEnvNumber('TEST_VALUE', environment('-2'))).toBe(-2);
  expect(readEnvNumber('TEST_VALUE', environment('Infinity'))).toBeUndefined();
  expect(readEnvNumber('TEST_VALUE', environment('not-a-number'))).toBeUndefined();
  expect(readEnvNumber('TEST_VALUE', environment(undefined))).toBeUndefined();
});
