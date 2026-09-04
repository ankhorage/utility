import type { Rect } from '../../geometry/types.js';
import type { NativeMeasurableView } from './types.js';

/*** Measure a React-Native-like view in window coordinates and reject zero-area results. */
export function measureNativeView(view: NativeMeasurableView): Promise<Rect | null> {
  return new Promise((resolve) => {
    view.measureInWindow((x, y, width, height) => {
      resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
    });
  });
}
