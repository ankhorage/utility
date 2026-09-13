// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import { extractTesseractScreenTextObservations } from './extractTesseractScreenTextObservations.js';
// import type { ScreenImageOcr } from './types.js';
//
// /*** Create a local Tesseract OCR adapter using an explicit trained-data path. */
// export async function createTesseractScreenOcrAsync(options: {
//   readonly langPath: string;
//   readonly language?: string;
// }): Promise<ScreenImageOcr> {
//   if (!options.langPath.trim()) {
//     throw new Error('Tesseract OCR requires a non-empty local langPath.');
//   }
//
//   const { createWorker, OEM, PSM } = await import('tesseract.js');
//   const worker = await createWorker(options.language ?? 'eng', OEM.LSTM_ONLY, {
//     langPath: options.langPath,
//   });
//
//   return {
//     recognizeAsync: async (image, request) => {
//       await worker.setParameters({
//         tessedit_pageseg_mode: request?.scope === 'region' ? PSM.SINGLE_LINE : PSM.AUTO,
//       });
//       const result = await worker.recognize(Buffer.from(image), {}, { blocks: true });
//       const blocks = result.data.blocks ?? [];
//       const observations = extractTesseractScreenTextObservations(blocks);
//       if (observations.length > 0) return observations;
//
//       const text = result.data.text.trim();
//       return text
//         ? [{ text, confidence: normalizeTesseractConfidence(result.data.confidence) }]
//         : [];
//     },
//     terminateAsync: async () => {
//       await worker.terminate();
//     },
//   };
// }
//
// /*** Normalize Tesseract's percentage confidence to the public zero-to-one evidence scale. */
// function normalizeTesseractConfidence(confidence: number): number {
//   return Math.max(0, Math.min(1, confidence / 100));
// }
