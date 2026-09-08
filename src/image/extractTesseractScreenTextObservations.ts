import type { ScreenImageTextObservation } from './types.js';

interface TesseractBboxLike {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

interface TesseractLineLike {
  readonly bbox: TesseractBboxLike;
  readonly text: string;
}

interface TesseractParagraphLike {
  readonly lines: readonly TesseractLineLike[];
}

interface TesseractBlockLike {
  readonly bbox: TesseractBboxLike;
  readonly paragraphs: readonly TesseractParagraphLike[];
  readonly text: string;
}

/*** Convert Tesseract layout data to line-level screen OCR observations. */
export function extractTesseractScreenTextObservations(
  blocks: readonly TesseractBlockLike[],
): readonly ScreenImageTextObservation[] {
  return blocks.flatMap((block) => {
    const lines = block.paragraphs.flatMap((paragraph) =>
      paragraph.lines.flatMap((line) => toObservation(line.text, line.bbox)),
    );
    return lines.length > 0 ? lines : toObservation(block.text, block.bbox);
  });
}

/*** Convert one non-empty Tesseract text node to the screen observation contract. */
function toObservation(
  text: string,
  bbox: TesseractBboxLike,
): readonly ScreenImageTextObservation[] {
  const normalized = text.trim();
  if (!normalized) return [];
  return [
    {
      text: normalized,
      bounds: {
        x: bbox.x0,
        y: bbox.y0,
        width: Math.max(0, bbox.x1 - bbox.x0),
        height: Math.max(0, bbox.y1 - bbox.y0),
      },
    },
  ];
}
