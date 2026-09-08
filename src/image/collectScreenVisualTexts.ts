import type { ScreenImageVisualNode } from './types.js';

/*** Collect OCR text from a visual subtree in deterministic screen-tree order. */
export function collectScreenVisualTexts(visual: ScreenImageVisualNode): readonly string[] {
  const ownText = visual.text?.trim();
  return [
    ...(ownText ? [ownText] : []),
    ...visual.children.flatMap((child) => collectScreenVisualTexts(child)),
  ];
}
