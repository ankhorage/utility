import { rectsEqual } from '../geometry/rectsEqual.js';
import { unionRects } from '../geometry/unionRects.js';
import type { ScreenImageRect } from './types.js';

const RECT_EPSILON = 3;
const MAX_FRAGMENT_AREA_RATIO = 0.015;
const MAX_FRAGMENT_HEIGHT_RATIO = 0.08;
const MIN_ROW_MEMBERS = 2;
const MIN_ROW_VERTICAL_OVERLAP = 0.25;
const MAX_ROW_CENTER_OFFSET_FACTOR = 0.55;
const MAX_ROW_HORIZONTAL_GAP_FACTOR = 2.5;
const MIN_BLOCK_HORIZONTAL_OVERLAP = 0.35;
const MAX_BLOCK_VERTICAL_GAP_FACTOR = 0.35;

interface IndexedScreenRegion {
  readonly index: number;
  readonly region: ScreenImageRect;
}

interface ScreenRegionGroup {
  readonly members: readonly IndexedScreenRegion[];
  readonly bounds: ScreenImageRect;
}

/*** Consolidate compatible top-level contour fragments into stable visual regions. */
export function consolidateScreenRegions(
  regions: readonly ScreenImageRect[],
  width: number,
  height: number,
): ScreenImageRect[] {
  const roots = findRootRegions(regions);
  const fragments = roots.filter((entry) => isFragment(entry.region, width, height));
  const rows = clusterItems(fragments, sharesVisualRow)
    .filter((members) => members.length >= MIN_ROW_MEMBERS)
    .map(createRegionGroup);
  const blocks = mergeAdjacentRows(rows);
  if (blocks.length === 0) return [...regions];

  const dropped = findDroppedIndexes(regions, blocks);
  return [
    ...regions.filter((_region, index) => !dropped.has(index)),
    ...blocks.map((block) => block.bounds),
  ];
}

/*** Return contour regions that are not strictly contained by another detected region. */
function findRootRegions(regions: readonly ScreenImageRect[]): IndexedScreenRegion[] {
  return regions.flatMap((region, index) =>
    regions.some(
      (candidate, candidateIndex) =>
        candidateIndex !== index && strictlyContains(candidate, region),
    )
      ? []
      : [{ index, region }],
  );
}

/*** Restrict consolidation to small visual fragments rather than complete controls or panels. */
function isFragment(region: ScreenImageRect, width: number, height: number): boolean {
  const screenArea = Math.max(1, width * height);
  return (
    (region.width * region.height) / screenArea <= MAX_FRAGMENT_AREA_RATIO &&
    region.height / Math.max(1, height) <= MAX_FRAGMENT_HEIGHT_RATIO
  );
}

/*** Determine whether two fragments plausibly belong to the same visual row. */
function sharesVisualRow(left: IndexedScreenRegion, right: IndexedScreenRegion): boolean {
  const leftRegion = left.region;
  const rightRegion = right.region;
  const maxHeight = Math.max(leftRegion.height, rightRegion.height);
  const aligned =
    verticalOverlapRatio(leftRegion, rightRegion) >= MIN_ROW_VERTICAL_OVERLAP ||
    centerOffsetY(leftRegion, rightRegion) <= maxHeight * MAX_ROW_CENTER_OFFSET_FACTOR;
  return (
    aligned &&
    horizontalGap(leftRegion, rightRegion) <= maxHeight * MAX_ROW_HORIZONTAL_GAP_FACTOR
  );
}

/*** Merge adjacent fragment rows when their bounds form one tight multiline visual block. */
function mergeAdjacentRows(rows: readonly ScreenRegionGroup[]): ScreenRegionGroup[] {
  const rowClusters = clusterItems(rows, sharesVisualBlock);
  return rowClusters.map((cluster) => createRegionGroup(cluster.flatMap((row) => row.members)));
}

/*** Determine whether two consolidated rows plausibly form one multiline visual block. */
function sharesVisualBlock(left: ScreenRegionGroup, right: ScreenRegionGroup): boolean {
  const maxGap = Math.max(
    RECT_EPSILON + 1,
    Math.min(left.bounds.height, right.bounds.height) * MAX_BLOCK_VERTICAL_GAP_FACTOR,
  );
  return (
    horizontalOverlapRatio(left.bounds, right.bounds) >= MIN_BLOCK_HORIZONTAL_OVERLAP &&
    verticalGap(left.bounds, right.bounds) <= maxGap
  );
}

/*** Build one consolidated region group from indexed contour members. */
function createRegionGroup(members: readonly IndexedScreenRegion[]): ScreenRegionGroup {
  const bounds = unionRects(members.map((member) => member.region));
  if (!bounds) throw new Error('Cannot consolidate an empty screen-region group.');
  return { members, bounds };
}

/*** Return original contour indexes represented by consolidated top-level fragment blocks. */
function findDroppedIndexes(
  regions: readonly ScreenImageRect[],
  blocks: readonly ScreenRegionGroup[],
): ReadonlySet<number> {
  const dropped = new Set<number>();
  regions.forEach((region, index) => {
    if (
      blocks.some((block) =>
        block.members.some(
          (member) => member.index === index || strictlyContains(member.region, region),
        ),
      )
    ) {
      dropped.add(index);
    }
  });
  return dropped;
}

/*** Cluster values by the transitive closure of one symmetric compatibility relation. */
function clusterItems<T>(items: readonly T[], related: (left: T, right: T) => boolean): T[][] {
  const remaining = new Set(items.map((_item, index) => index));
  const clusters: T[][] = [];
  while (remaining.size > 0) {
    const first = remaining.values().next().value;
    if (first === undefined) break;
    const clusterIndexes = collectConnectedIndexes(items, related, first, remaining);
    clusters.push(clusterIndexes.map((index) => items.at(index)).filter(isDefined));
  }
  return clusters;
}

/*** Collect one connected component while removing its indexes from the remaining set. */
function collectConnectedIndexes<T>(
  items: readonly T[],
  related: (left: T, right: T) => boolean,
  first: number,
  remaining: Set<number>,
): number[] {
  const pending = [first];
  const connected: number[] = [];
  remaining.delete(first);
  while (pending.length > 0) {
    const current = pending.pop();
    const currentItem = current === undefined ? undefined : items.at(current);
    if (current === undefined || currentItem === undefined) continue;
    connected.push(current);
    for (const candidate of [...remaining]) {
      const candidateItem = items.at(candidate);
      if (candidateItem === undefined || !related(currentItem, candidateItem)) continue;
      remaining.delete(candidate);
      pending.push(candidate);
    }
  }
  return connected;
}

/*** Determine whether one rectangle strictly contains another within contour tolerance. */
function strictlyContains(parent: ScreenImageRect, child: ScreenImageRect): boolean {
  const contains =
    child.x >= parent.x &&
    child.y >= parent.y &&
    child.x + child.width <= parent.x + parent.width &&
    child.y + child.height <= parent.y + parent.height;
  return contains && !rectsEqual(parent, child, RECT_EPSILON);
}

/*** Return normalized vertical overlap relative to the smaller rectangle height. */
function verticalOverlapRatio(left: ScreenImageRect, right: ScreenImageRect): number {
  const overlap = Math.max(
    0,
    Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y),
  );
  return overlap / Math.max(1, Math.min(left.height, right.height));
}

/*** Return absolute vertical center distance between two rectangles. */
function centerOffsetY(left: ScreenImageRect, right: ScreenImageRect): number {
  return Math.abs(left.y + left.height / 2 - (right.y + right.height / 2));
}

/*** Return horizontal separation between two rectangles, or zero when they overlap. */
function horizontalGap(left: ScreenImageRect, right: ScreenImageRect): number {
  if (left.x + left.width < right.x) return right.x - (left.x + left.width);
  if (right.x + right.width < left.x) return left.x - (right.x + right.width);
  return 0;
}

/*** Return vertical separation between two rectangles, or zero when they overlap. */
function verticalGap(left: ScreenImageRect, right: ScreenImageRect): number {
  if (left.y + left.height < right.y) return right.y - (left.y + left.height);
  if (right.y + right.height < left.y) return left.y - (right.y + right.height);
  return 0;
}

/*** Return normalized horizontal overlap relative to the smaller rectangle width. */
function horizontalOverlapRatio(left: ScreenImageRect, right: ScreenImageRect): number {
  const overlap = Math.max(
    0,
    Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x),
  );
  return overlap / Math.max(1, Math.min(left.width, right.width));
}

/*** Narrow an optional indexed value after array access. */
function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
