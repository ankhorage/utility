import { expect, test } from 'bun:test';

import { findMinimumAcceptedNumber } from './findMinimumAcceptedNumber';

test('returns the minimum immediately when the interval starts accepted', () => {
  let calls = 0;
  const result = findMinimumAcceptedNumber({
    minimum: 2,
    maximum: 10,
    accepts: (value) => {
      calls += 1;
      return value >= 2;
    },
  });

  expect(result).toBe(2);
  expect(calls).toBe(1);
});

test('returns undefined when the maximum is not accepted', () => {
  const result = findMinimumAcceptedNumber({
    minimum: 0,
    maximum: 1,
    accepts: (value) => value > 2,
  });

  expect(result).toBeUndefined();
});

test('converges on the smallest accepted monotone boundary with bounded work', () => {
  let calls = 0;
  const result = findMinimumAcceptedNumber({
    minimum: 0,
    maximum: 10,
    iterations: 20,
    accepts: (value) => {
      calls += 1;
      return value >= 3.25;
    },
  });

  expect(result).toBeDefined();
  expect(Math.abs((result ?? 0) - 3.25)).toBeLessThan(0.00002);
  expect(calls).toBeLessThanOrEqual(22);
});

test('does not mutate its readonly input and validates bounded search arguments', () => {
  const input = Object.freeze({
    minimum: 0,
    maximum: 1,
    iterations: 8,
    accepts: (value: number) => value >= 0.5,
  });

  expect(findMinimumAcceptedNumber(input)).toBeGreaterThanOrEqual(0.5);
  expect(input.minimum).toBe(0);
  expect(() => findMinimumAcceptedNumber({ minimum: 2, maximum: 1, accepts: () => true })).toThrow(
    RangeError,
  );
  expect(() =>
    findMinimumAcceptedNumber({ minimum: 0, maximum: 1, iterations: 65, accepts: () => true }),
  ).toThrow(RangeError);
});
