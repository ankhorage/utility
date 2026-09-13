// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import type { ScreenImageTextObservation } from './types.js';
//
// interface TesseractBboxLike {
//   readonly x0: number;
//   readonly y0: number;
//   readonly x1: number;
//   readonly y1: number;
// }
//
// interface TesseractLineLike {
//   readonly bbox: TesseractBboxLike;
//   readonly confidence?: number;
//   readonly text: string;
//   readonly words?: readonly TesseractWordLike[];
// }
//
// interface TesseractWordLike {
//   readonly bbox: TesseractBboxLike;
//   readonly confidence?: number;
//   readonly text: string;
// }
//
// interface TesseractParagraphLike {
//   readonly lines: readonly TesseractLineLike[];
// }
//
// interface TesseractBlockLike {
//   readonly bbox: TesseractBboxLike;
//   readonly confidence?: number;
//   readonly paragraphs: readonly TesseractParagraphLike[];
//   readonly text: string;
// }
//
// /*** Convert Tesseract layout data to line-level screen OCR observations. */
// export function extractTesseractScreenTextObservations(
//   blocks: readonly TesseractBlockLike[],
// ): readonly ScreenImageTextObservation[] {
//   return blocks.flatMap((block) => {
//     const lines = block.paragraphs.flatMap((paragraph) =>
//       paragraph.lines.flatMap(toLineObservation),
//     );
//     return lines.length > 0 ? lines : toObservation(block.text, block.bbox, block.confidence);
//   });
// }
//
// const RELIABLE_WORD_CONFIDENCE = 80;
// const MAX_DECORATIVE_GLYPH_LENGTH = 3;
// const DECORATIVE_GLYPH_HEIGHT_RATIO = 1.4;
//
// /*** Convert a Tesseract line to an observation after excluding evidenced decorative glyphs. */
// function toLineObservation(line: TesseractLineLike): readonly ScreenImageTextObservation[] {
//   const words = line.words ?? [];
//   const reliableWordHeights = words.filter(isReliableWord).map(getBboxHeight);
//   if (reliableWordHeights.length === 0) {
//     return toObservation(line.text, line.bbox, line.confidence);
//   }
//
//   const referenceHeight = getMedian(reliableWordHeights);
//   const retainedWords = words.filter((word) => !isDecorativeGlyphWord(word, referenceHeight));
//   if (retainedWords.length === words.length) {
//     return toObservation(line.text, line.bbox, line.confidence);
//   }
//
//   return toObservation(
//     retainedWords
//       .map((word) => word.text.trim())
//       .filter(Boolean)
//       .join(' '),
//     mergeBboxes(retainedWords),
//     getMeanConfidence(retainedWords),
//   );
// }
//
// /*** Identify a reliable OCR word that can establish the line's normal text height. */
// function isReliableWord(word: TesseractWordLike): boolean {
//   return (
//     word.text.trim().length > 0 &&
//     word.confidence !== undefined &&
//     word.confidence >= RELIABLE_WORD_CONFIDENCE &&
//     getBboxHeight(word) > 0
//   );
// }
//
// /*** Identify a short, uncertain, oversized token that is evidenced as decorative UI glyphs. */
// function isDecorativeGlyphWord(word: TesseractWordLike, referenceHeight: number): boolean {
//   const text = word.text.trim();
//   return (
//     text.length > 0 &&
//     Array.from(text).length <= MAX_DECORATIVE_GLYPH_LENGTH &&
//     word.confidence !== undefined &&
//     word.confidence < RELIABLE_WORD_CONFIDENCE &&
//     getBboxHeight(word) >= referenceHeight * DECORATIVE_GLYPH_HEIGHT_RATIO
//   );
// }
//
// /*** Measure the non-negative height of a Tesseract bounding box. */
// function getBboxHeight(value: { readonly bbox: TesseractBboxLike }): number {
//   return Math.max(0, value.bbox.y1 - value.bbox.y0);
// }
//
// /*** Find the median of a non-empty numeric collection. */
// function getMedian(values: readonly number[]): number {
//   const sorted = [...values].sort((left, right) => left - right);
//   const middle = Math.floor(sorted.length / 2);
//   const upper = sorted.at(middle) ?? 0;
//   const lower = sorted.at(middle - 1) ?? upper;
//   return sorted.length % 2 === 0 ? (lower + upper) / 2 : upper;
// }
//
// /*** Merge Tesseract word bounds into the smallest enclosing box. */
// function mergeBboxes(words: readonly TesseractWordLike[]): TesseractBboxLike {
//   return words.reduce(
//     (bounds, word) => ({
//       x0: Math.min(bounds.x0, word.bbox.x0),
//       y0: Math.min(bounds.y0, word.bbox.y0),
//       x1: Math.max(bounds.x1, word.bbox.x1),
//       y1: Math.max(bounds.y1, word.bbox.y1),
//     }),
//     words.at(0)?.bbox ?? { x0: 0, y0: 0, x1: 0, y1: 0 },
//   );
// }
//
// /*** Average available finite Tesseract word confidence values. */
// function getMeanConfidence(words: readonly TesseractWordLike[]): number | undefined {
//   const values = words
//     .map((word) => word.confidence)
//     .filter((value): value is number => value !== undefined && Number.isFinite(value));
//   if (values.length === 0) return undefined;
//   return values.reduce((total, value) => total + value, 0) / values.length;
// }
//
// /*** Convert one non-empty Tesseract text node to the screen observation contract. */
// function toObservation(
//   text: string,
//   bbox: TesseractBboxLike,
//   confidence?: number,
// ): readonly ScreenImageTextObservation[] {
//   const normalized = text.trim();
//   if (!normalized) return [];
//   return [
//     {
//       text: normalized,
//       bounds: {
//         x: bbox.x0,
//         y: bbox.y0,
//         width: Math.max(0, bbox.x1 - bbox.x0),
//         height: Math.max(0, bbox.y1 - bbox.y0),
//       },
//       ...(confidence === undefined ? {} : { confidence: normalizeTesseractConfidence(confidence) }),
//     },
//   ];
// }
//
// /*** Normalize Tesseract's percentage confidence to the public zero-to-one evidence scale. */
// function normalizeTesseractConfidence(confidence: number): number {
//   return Math.max(0, Math.min(1, Number.isFinite(confidence) ? confidence / 100 : 0));
// }
