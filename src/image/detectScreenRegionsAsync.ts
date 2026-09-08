import cvModule from '@techstark/opencv-js';

import type {
  ScreenImageArrangement,
  ScreenImagePixels,
  ScreenImageRect,
  ScreenImageVisualGraph,
  ScreenImageVisualNode,
} from './types.js';

const MIN_REGION_DIMENSION = 4;
const MIN_REGION_AREA_RATIO = 0.0005;
const MAX_REGION_AREA_RATIO = 0.96;
const RECT_EPSILON = 3;
const SIZE_SIMILARITY = 0.12;

/*** Detect screen regions and infer their containment and coarse layout relationships with OpenCV. */
export async function detectScreenRegionsAsync(
  pixels: ScreenImagePixels,
): Promise<ScreenImageVisualGraph> {
  const cv = await Promise.resolve(cvModule);
  const source = cv.matFromArray(
    pixels.height,
    pixels.width,
    cv.CV_8UC4,
    Array.from(pixels.data),
  );
  const gray = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  try {
    cv.cvtColor(source, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, edges, 40, 120);
    cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    const regions = collectRegions(cv, contours, pixels.width, pixels.height);
    return createVisualGraph(regions, pixels.width, pixels.height);
  } finally {
    hierarchy.delete();
    contours.delete();
    edges.delete();
    gray.delete();
    source.delete();
  }
}

/*** Collect stable rectangular regions from contour geometry and discard noise or duplicates. */
function collectRegions(
  cv: Awaited<typeof cvModule>,
  contours: InstanceType<Awaited<typeof cvModule>['MatVector']>,
  width: number,
  height: number,
): ScreenImageRect[] {
  const screenArea = width * height;
  const regions: ScreenImageRect[] = [];

  for (let index = 0; index < contours.size(); index += 1) {
    const contour = contours.get(index);
    try {
      const rect = cv.boundingRect(contour);
      const candidate = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      const areaRatio = (candidate.width * candidate.height) / screenArea;
      if (
        candidate.width < MIN_REGION_DIMENSION ||
        candidate.height < MIN_REGION_DIMENSION ||
        areaRatio < MIN_REGION_AREA_RATIO ||
        areaRatio > MAX_REGION_AREA_RATIO ||
        regions.some((region) => rectsNearlyEqual(region, candidate))
      ) {
        continue;
      }
      regions.push(candidate);
    } finally {
      contour.delete();
    }
  }

  return regions.sort(compareRects);
}

/*** Build a deterministic visual tree by assigning each region to its smallest containing parent. */
function createVisualGraph(
  regions: readonly ScreenImageRect[],
  width: number,
  height: number,
): ScreenImageVisualGraph {
  const parentByIndex = regions.map((region, index) => findParentIndex(regions, region, index));
  const childIndexes = regions.map((): number[] => []);
  const rootIndexes: number[] = [];

  parentByIndex.forEach((parentIndex, index) => {
    if (parentIndex === -1) {
      rootIndexes.push(index);
      return;
    }
    childIndexes[parentIndex]?.push(index);
  });

  const nodes = regions.map((region, index) => createVisualNode(region, index, childIndexes, regions));
  const rootChildren = rootIndexes.flatMap((index) => (nodes[index] ? [nodes[index]] : []));
  const rootBounds = { x: 0, y: 0, width, height };

  return {
    width,
    height,
    root: {
      id: 'screen',
      bounds: rootBounds,
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
  childIndexes: readonly (readonly number[])[],
  regions: readonly ScreenImageRect[],
): ScreenImageVisualNode {
  const children = [...(childIndexes[index] ?? [])]
    .sort((left, right) => compareRects(regions[left] ?? region, regions[right] ?? region))
    .map((childIndex) => {
      const child = regions[childIndex];
      if (!child) {
        throw new Error(`Missing visual region ${childIndex}.`);
      }
      return createVisualNode(child, childIndex, childIndexes, regions);
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
      const widthDelta = Math.abs(left.bounds.width - right.bounds.width) / Math.max(1, left.bounds.width);
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
    left.y - right.y ||
    left.x - right.x ||
    left.width * left.height - right.width * right.height
  );
}

/*** Determine whether two contour rectangles represent the same visible boundary. */
function rectsNearlyEqual(left: ScreenImageRect, right: ScreenImageRect): boolean {
  return (
    Math.abs(left.x - right.x) <= RECT_EPSILON &&
    Math.abs(left.y - right.y) <= RECT_EPSILON &&
    Math.abs(left.width - right.width) <= RECT_EPSILON &&
    Math.abs(left.height - right.height) <= RECT_EPSILON
  );
}

/*** Calculate the arithmetic mean of a non-empty numeric list. */
function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

/*** Calculate the numeric spread of a list. */
function spread(values: readonly number[]): number {
  return Math.max(...values) - Math.min(...values);
}
