import { extractTesseractScreenTextObservations } from './extractTesseractScreenTextObservations.js';
import type { ScreenImageOcr } from './types.js';

/*** Create a local Tesseract OCR adapter using an explicit trained-data path. */
export async function createTesseractScreenOcrAsync(options: {
  readonly langPath: string;
  readonly language?: string;
}): Promise<ScreenImageOcr> {
  if (!options.langPath.trim()) {
    throw new Error('Tesseract OCR requires a non-empty local langPath.');
  }

  const { createWorker, OEM } = await import('tesseract.js');
  const worker = await createWorker(options.language ?? 'eng', OEM.LSTM_ONLY, {
    langPath: options.langPath,
  });

  return {
    recognizeAsync: async (image) => {
      const result = await worker.recognize(Buffer.from(image), {}, { blocks: true });
      const blocks = result.data.blocks ?? [];
      const observations = extractTesseractScreenTextObservations(blocks);
      if (observations.length > 0) return observations;

      const text = result.data.text.trim();
      return text ? [{ text }] : [];
    },
    terminateAsync: async () => {
      await worker.terminate();
    },
  };
}
