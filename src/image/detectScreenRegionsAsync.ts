import cvModule from '@techstark/opencv-js';

import { createScreenVisualGraph } from './createScreenVisualGraph.js';
import type { ScreenImagePixels, ScreenImageRect, ScreenImageVisualGraph } from './types.js';

const MIN_REGION_DIMENSION = 4;
const MIN_REGION_AREA_RATIO = 0.0005;
const MAX_REGION_AREA_RATIO = 0.96;
const RECT_EPSILON = 3;

/*** Detect screen regions and infer their containment and coarse layout relationships with OpenCV. */
export async function detectScreenRegionsAsync(
  pixels: ScreenImagePixels,
): Promise<ScreenImageVisualGraph> {
  const cv = await Promise.resolve(cvModule);
  const pixelType = readCvConstant(cv.CV_8UC4, 'CV_8UC4');
  const rgbaToGray = readCvConstant(cv.COLOR_RGBA2GRAY, 'COLOR_RGBA2GRAY');
  const retrievalMode = readCvConstant(cv.RETR_LIST, 'RETR_LIST');
  const contourApproximation = readCvConstant(cv.CHAIN_APPROX_SIMPLE, 'CHAIN_APPROX_SIMPLE');
  const source = cv.matFromArray(
    pixels.height,
    pixels.width,
    pixelType,
    Array.from(pixels.data),
  );
  const gray = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  try {
    cv.cvtColor(source, gray, rgbaToGray);
    cv.Canny(gray, edges, 40, 120);
    cv.findContours(edges, contours, hierarchy, retrievalMode, contourApproximation);

    const regions = collectRegions(cv, contours, pixels.width, pixels.height);
    return createScreenVisualGraph(regions, pixels.width, pixels.height);
  } finally {
    hierarchy.delete();
    contours.delete();
    edges.delete();
    gray.delete();
    source.delete();
  }
}

/*** Validate an OpenCV numeric constant at the untyped library boundary. */
function readCvConstant(value: unknown, name: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`OpenCV constant ${name} is unavailable.`);
  }
  return value;
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

  return regions;
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
