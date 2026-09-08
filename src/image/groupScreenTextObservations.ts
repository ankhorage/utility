import { unionRects } from '../geometry/unionRects.js';
import type { ScreenImageRect, ScreenImageTextObservation } from './types.js';

const MIN_LINE_HEIGHT_RATIO = 0.55;
const MAX_VERTICAL_GAP_FACTOR = 1.1;
const MIN_HORIZONTAL_OVERLAP = 0.2;
const MAX_CENTER_OFFSET_FACTOR = 0.2;

/*** Group geometrically adjacent OCR lines into stable text-block observations. */
export function groupScreenTextObservations(
  observations: readonly ScreenImageTextObservation[],
): readonly ScreenImageTextObservation[] {
  const bounded = observations.filter(hasBounds).sort(compareObservations);
  const remaining = new Set(bounded.map((_observation, index) => index));
  const groups: ScreenImageTextObservation[][] = [];

  while (remaining.size > 0) {
    const first = remaining.values().next().value;
    if (first === undefined) break;
    groups.push(collectConnectedObservations(bounded, first, remaining));
  }

  return groups.map(createGroupedObservation).sort(compareObservations);
}

/*** Collect one connected multiline block and remove it from the pending indexes. */
function collectConnectedObservations(
  observations: readonly ScreenImageTextObservation[],
  first: number,
  remaining: Set<number>,
): ScreenImageTextObservation[] {
  const pending = [first];
  const connected: ScreenImageTextObservation[] = [];
  remaining.delete(first);

  while (pending.length > 0) {
    const currentIndex = pending.pop();
    const current = currentIndex === undefined ? undefined : observations.at(currentIndex);
    if (!current) continue;
    connected.push(current);

    for (const candidateIndex of [...remaining]) {
      const candidate = observations.at(candidateIndex);
      if (!candidate || !sharesTextBlock(current, candidate)) continue;
      remaining.delete(candidateIndex);
      pending.push(candidateIndex);
    }
  }

  return connected.sort(compareObservations);
}

/*** Determine whether two OCR lines have geometry consistent with one text block. */
function sharesTextBlock(
  left: ScreenImageTextObservation,
  right: ScreenImageTextObservation,
): boolean {
  if (!left.bounds || !right.bounds) return false;
  const minHeight = Math.max(1, Math.min(left.bounds.height, right.bounds.height));
  const maxHeight = Math.max(left.bounds.height, right.bounds.height);
  const similarHeight = minHeight / Math.max(1, maxHeight) >= MIN_LINE_HEIGHT_RATIO;
  const closeVertically =
    verticalGap(left.bounds, right.bounds) <= minHeight * MAX_VERTICAL_GAP_FACTOR;
  const aligned =
    horizontalOverlapRatio(left.bounds, right.bounds) >= MIN_HORIZONTAL_OVERLAP ||
    horizontalCenterOffset(left.bounds, right.bounds) <=
      Math.max(left.bounds.width, right.bounds.width) * MAX_CENTER_OFFSET_FACTOR;
  return similarHeight && closeVertically && aligned;
}

/*** Merge one ordered observation group while preserving its weakest known confidence. */
function createGroupedObservation(
  observations: readonly ScreenImageTextObservation[],
): ScreenImageTextObservation {
  const bounds = unionRects(observations.flatMap((observation) => observation.bounds ?? []));
  if (!bounds) throw new Error('Cannot group screen text observations without bounds.');
  const confidences = observations.flatMap((observation) =>
    observation.confidence === undefined ? [] : [observation.confidence],
  );
  return {
    text: observations
      .map((observation) => observation.text.trim())
      .filter(Boolean)
      .join(' '),
    bounds,
    ...(confidences.length > 0 ? { confidence: Math.min(...confidences) } : {}),
  };
}

/*** Narrow one OCR observation to the bounded form required for visual evidence. */
function hasBounds(
  observation: ScreenImageTextObservation,
): observation is ScreenImageTextObservation & { readonly bounds: ScreenImageRect } {
  return Boolean(observation.bounds) && Boolean(observation.text.trim());
}

/*** Compare OCR observations by screen position for deterministic grouping and text order. */
function compareObservations(
  left: ScreenImageTextObservation,
  right: ScreenImageTextObservation,
): number {
  if (!left.bounds || !right.bounds) return 0;
  return left.bounds.y - right.bounds.y || left.bounds.x - right.bounds.x;
}

/*** Return vertical separation between two rectangles, or zero when they overlap. */
function verticalGap(left: ScreenImageRect, right: ScreenImageRect): number {
  if (left.y + left.height < right.y) return right.y - (left.y + left.height);
  if (right.y + right.height < left.y) return left.y - (right.y + right.height);
  return 0;
}

/*** Return normalized horizontal overlap relative to the narrower rectangle. */
function horizontalOverlapRatio(left: ScreenImageRect, right: ScreenImageRect): number {
  const overlap = Math.max(
    0,
    Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x),
  );
  return overlap / Math.max(1, Math.min(left.width, right.width));
}

/*** Return the horizontal center distance between two rectangles. */
function horizontalCenterOffset(left: ScreenImageRect, right: ScreenImageRect): number {
  return Math.abs(left.x + left.width / 2 - (right.x + right.width / 2));
}
