import { createWorker, OEM } from 'tesseract.js';

import type { ScreenImageOcr, ScreenImageRect, ScreenImageTextObservation } from './types.js';

/*** Create a local Tesseract OCR adapter using an explicit trained-data path. */
export async function createTesseractScreenOcrAsync(options: {
  readonly langPath: string;
  readonly language?: string;
}): Promise<ScreenImageOcr> {
  if (!options.langPath.trim()) {
    throw new Error('Tesseract OCR requires a non-empty local langPath.');
  }

  const worker = await createWorker(options.language ?? 'eng', OEM.LSTM_ONLY, {
    langPath: options.langPath,
  });

  return {
    recognizeAsync: async (image) => {
      const result = await worker.recognize(Buffer.from(image), {}, { blocks: true });
      const blocks = result.data.blocks ?? [];
      if (blocks.length === 0) {
        const text = result.data.text.trim();
        return text ? [{ text }] : [];
      }
      return blocks.flatMap((block) => {
        const text = block.text.trim();
        if (!text) {
          return [];
        }
        return [{ text, bounds: toRect(block.bbox) }];
      });
    },
    terminateAsync: async () => {
      await worker.terminate();
    },
  };
}

/*** Convert a Tesseract bounding box into the screen-analysis rectangle contract. */
function toRect(bbox: {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}): ScreenImageRect {
  return {
    x: bbox.x0,
    y: bbox.y0,
    width: Math.max(0, bbox.x1 - bbox.x0),
    height: Math.max(0, bbox.y1 - bbox.y0),
  };
}
