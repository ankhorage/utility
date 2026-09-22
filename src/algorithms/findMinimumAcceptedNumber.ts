const DEFAULT_ITERATIONS = 16;
const MAX_ITERATIONS = 64;

/***
 * Find the smallest accepted approximation inside one monotone numeric interval.
 * The acceptance predicate is expected to be pure and monotone from false to true.
 * Runtime is bounded by at most 64 predicate evaluations after the endpoint checks.
 */
export function findMinimumAcceptedNumber(
  input: FindMinimumAcceptedNumberInput,
): number | undefined {
  validateInput(input);
  const { accepts, maximum, minimum } = input;
  const iterations = input.iterations ?? DEFAULT_ITERATIONS;

  if (accepts(minimum)) return minimum;
  if (!accepts(maximum)) return undefined;

  return searchAcceptedBoundary(minimum, maximum, iterations, accepts);
}

/*** Narrow one known false/true bracket without allocating intermediate collections. */
function searchAcceptedBoundary(
  minimum: number,
  maximum: number,
  iterations: number,
  accepts: (value: number) => boolean,
): number {
  let lower = minimum;
  let upper = maximum;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const midpoint = lower + (upper - lower) / 2;
    if (midpoint === lower || midpoint === upper) break;
    if (accepts(midpoint)) upper = midpoint;
    else lower = midpoint;
  }

  return upper;
}

/*** Reject invalid numeric bounds before evaluating the caller-owned predicate. */
function validateInput(input: FindMinimumAcceptedNumberInput): void {
  const iterations = input.iterations ?? DEFAULT_ITERATIONS;
  if (!Number.isFinite(input.minimum) || !Number.isFinite(input.maximum)) {
    throw new RangeError('Search bounds must be finite numbers.');
  }
  if (input.minimum > input.maximum) {
    throw new RangeError('Search minimum must not exceed maximum.');
  }
  if (!Number.isInteger(iterations) || iterations < 0 || iterations > MAX_ITERATIONS) {
    throw new RangeError(`Search iterations must be an integer from 0 to ${MAX_ITERATIONS}.`);
  }
}

interface FindMinimumAcceptedNumberInput {
  readonly minimum: number;
  readonly maximum: number;
  readonly iterations?: number;
  readonly accepts: (value: number) => boolean;
}
