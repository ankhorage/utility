import type { Rect } from '../../geometry/index.js';
import { isWebElementLike, measureNonZeroWebElement } from '../../web/index.js';

export interface NativeMeasurableView {
  readonly measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
}

/***
 * Detect a React-Native-like view that exposes `measureInWindow`.
 */
export function isNativeMeasurableView(value: unknown): value is NativeMeasurableView {
  return (
    typeof value === 'object' &&
    value !== null &&
    'measureInWindow' in value &&
    typeof value.measureInWindow === 'function'
  );
}

/***
 * Measure a React-Native-like view in window coordinates and reject zero-area results.
 */
export function measureNativeView(view: NativeMeasurableView): Promise<Rect | null> {
  return new Promise((resolve) => {
    view.measureInWindow((x, y, width, height) => {
      resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
    });
  });
}

/***
 * Measure an unknown cross-platform view using web geometry on web and native window measurement otherwise.
 */
export function measureCrossPlatformView(
  view: unknown,
  platform: string,
): Promise<Rect | null> {
  if (view === null || view === undefined) return Promise.resolve(null);
  if (platform === 'web' && isWebElementLike(view)) {
    return Promise.resolve(measureNonZeroWebElement(view));
  }
  return isNativeMeasurableView(view) ? measureNativeView(view) : Promise.resolve(null);
}
