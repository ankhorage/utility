import type {
  ScreenImageArrangement,
  ScreenImageRect,
  ScreenImageVisualGraph,
  ScreenImageVisualNode,
} from './types.js';

const RECT_EPSILON = 3;
const SIZE_SIMILARITY = 0.12;

/*** Build a deterministic visual tree from detected screen regions. */
export function createScreenVisualGraph(
  regions: readonly ScreenImageRect[],
  width: number,
  height: number,
): ScreenImageVisualGraph {
  const orderedRegions = [...regions].sort(compareRects);
  const parentByIndex = orderedRegions.map((region, index) =>
    findParentIndex(orderedRegions, region, index),
  );
  const childrenByParent = new Map<number, number[]>();
  const rootIndexes: number[] = [];

  parentByIndex.forEach((parentIndex, index) => {
    if (parentIndex === -1) {
      rootIndexes.push(index);
      return;
    }
    const children = childrenByParent.get(parentIndex) ?? [];
    children.push(index);
    childrenByParent.set(parentIndex, children);
  });

  const regionsByIndex = new Map(
    orderedRegions.map((region, index) => [index, region] as const),
  );
  const rootChildren = rootIndexes.map((index) => {
    const region = regionsByIndex.get(index);
    if (!region) {
      throw new Error(`Missing root visual region ${index}.`);
    }
    return createVisualNode(region, index, childrenByParent, regionsByIndex);
  });

  return {
    width,
    height,
    root: {
      id: 'screen',
      bounds: { x: 0, y: 0, width, height },
      arrangement: inferArrangement(rootChildren),
      repeated: hasRepeatedGeometry(rootChildren),
      children: rootChildren,
    },
  };
}

/*** Create one visual node and all of its direct descendants in deterministic screen order. */
function createVisualNode(
  region: ScreenImageRect,
  index: number,
  childrenByParent: ReadonlyMap<number, readonly number[]>,
  regionsByIndex: ReadonlyMap<number, ScreenImageRect>,
): ScreenImageVisualNode {
  const childIndexes = [...(childrenByParent.get(index) ?? [])];
  childIndexes.sort((left, right) =>
    compareRects(regionsByIndex.get(left) ?? region, regionsByIndex.get(right) ?? region),
  );
  const children = childIndexes.map((childIndex) => {
    const child = regionsByIndex.get(childIndex);
    if (!child) {
      throw new Error(`Missing visual region ${childIndex}.`);
    }
    return createVisualNode(child, childIndex, childrenByParent, regionsByIndex);
  });

  return {
    id: `region-${String(index + 1).padStart(3, '0')}`,
    bounds: region,
    arrangement: inferArrangement(children),
    repeated: hasRepeatedGeometry(children),
    children,
  };
}

/*** Find the smallest region that strictly contains the given child region. */
function findParentIndex(
  regions: readonly ScreenImageRect[],
  child: ScreenImageRect,
  childIndex: number,
): number {
  let parentIndex = -1;
  let parentArea = Number.POSITIVE_INFINITY;

  regions.forEach((candidate, index) => {
    if (index === childIndex || !strictlyContains(candidate, child)) {
      return;
    }
    const area = candidate.width * candidate.height;
    if (area < parentArea) {
      parentArea = area;
      parentIndex = index;
    }
  });

  return parentIndex;
}

/*** Infer a coarse vertical, horizontal, or grid arrangement from direct child geometry. */
function inferArrangement(children: readonly ScreenImageVisualNode[]): ScreenImageArrangement {
  if (children.length < 2) {
    return 'none';
  }

  const centersX = children.map((child) => child.bounds.x + child.bounds.width / 2);
  const centersY = children.map((child) => child.bounds.y + child.bounds.height / 2);
  const averageWidth = average(children.map((child) => child.bounds.width));
  const averageHeight = average(children.map((child) => child.bounds.height));
  const horizontal = spread(centersY) <= Math.max(RECT_EPSILON, averageHeight * 0.35);
  const vertical = spread(centersX) <= Math.max(RECT_EPSILON, averageWidth * 0.35);

  if (children.length >= 4 && hasRepeatedGeometry(children) && !horizontal && !vertical) {
    return 'grid';
  }
  if (horizontal) {
    return 'horizontal';
  }
  if (vertical) {
    return 'vertical';
  }
  return 'none';
}

/*** Detect whether at least two child regions share approximately the same dimensions. */
function hasRepeatedGeometry(children: readonly ScreenImageVisualNode[]): boolean {
  return children.some((left, index) =>
    children.slice(index + 1).some((right) => {
      const widthDelta =
        Math.abs(left.bounds.width - right.bounds.width) / Math.max(1, left.bounds.width);
      const heightDelta =
        Math.abs(left.bounds.height - right.bounds.height) / Math.max(1, left.bounds.height);
      return widthDelta <= SIZE_SIMILARITY && heightDelta <= SIZE_SIMILARITY;
    }),
  );
}

/*** Determine whether one rectangle strictly contains another rectangle. */
function strictlyContains(parent: ScreenImageRect, child: ScreenImageRect): boolean {
  const contains =
    child.x >= parent.x &&
    child.y >= parent.y &&
    child.x + child.width <= parent.x + parent.width &&
    child.y + child.height <= parent.y + parent.height;
  return contains && !rectsNearlyEqual(parent, child);
}

/*** Compare rectangles by screen position and then by area for stable region IDs. */
function compareRects(left: ScreenImageRect, right: ScreenImageRect): number {
  return (
    left.y - right.y || left.x - right.x || left.width * left.height - right.width * right.height
  );
}

/*** Determine whether two rectangles represent the same visible boundary. */
function rectsNearlyEqual(left: ScreenImageRect, right: ScreenImageRect): boolean {
  return (
    Math.abs(left.x - right.x) <= RECT_EPSILON &&
    Math.abs(left.y - right.y) <= RECT_EPSILON &&
    Math.abs(left.width - right.width) <= RECT_EPSILON &&
    Math.abs(left.height - right.height) <= RECT_EPSILON
  );
}

/*** Calculate the arithmetic mean of a numeric list. */
function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

/*** Calculate the numeric spread of a list. */
function spread(values: readonly number[]): number {
  return Math.max(...values) - Math.min(...values);
}
