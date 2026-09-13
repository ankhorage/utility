// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import type { ScreenImageVisualNode } from './types.js';
//
// /*** Collect OCR text from a visual subtree in deterministic screen-tree order. */
// export function collectScreenVisualTexts(visual: ScreenImageVisualNode): readonly string[] {
//   const ownText = visual.text?.trim();
//   return [
//     ...(ownText ? [ownText] : []),
//     ...visual.children.flatMap((child) => collectScreenVisualTexts(child)),
//   ];
// }
