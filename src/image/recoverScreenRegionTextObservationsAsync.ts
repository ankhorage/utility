// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import type {
//   ScreenImageDiagnostic,
//   ScreenImageOcr,
//   ScreenImageRect,
//   ScreenImageTextObservation,
//   ScreenImageVisualGraph,
//   ScreenImageVisualNode,
// } from './types.js';
//
// const REGION_SCALE = 2;
// const MIN_REGION_AREA_RATIO = 0.002;
// const MAX_REGION_AREA_RATIO = 0.25;
// const MIN_REGION_DIMENSION = 12;
// const MIN_REGION_OCR_CONFIDENCE = 0.6;
//
// /*** Recover text from meaningful textless regions with deterministic local OCR crops. */
// export async function recoverScreenRegionTextObservationsAsync(input: {
//   readonly image: Uint8Array;
//   readonly graph: ScreenImageVisualGraph;
//   readonly ocr: ScreenImageOcr;
// }): Promise<{
//   readonly observations: readonly ScreenImageTextObservation[];
//   readonly diagnostics: readonly ScreenImageDiagnostic[];
// }> {
//   const candidates = collectRegionCandidates(input.graph);
//   const observations: ScreenImageTextObservation[] = [];
//   const diagnostics: ScreenImageDiagnostic[] = [];
//
//   for (const candidate of candidates) {
//     try {
//       const crop = clampRect(candidate.bounds, input.graph.width, input.graph.height);
//       const image = await createRegionOcrImageAsync(input.image, crop);
//       const recognized = await input.ocr.recognizeAsync(image, { scope: 'region' });
//       observations.push(
//         ...recognized
//           .filter(isUsableRegionObservation)
//           .map((observation) => translateRegionObservation(observation, crop)),
//       );
//     } catch (error) {
//       diagnostics.push({
//         kind: 'ocr',
//         nodeId: candidate.id,
//         message: `Region OCR evidence was unavailable for ${candidate.id}: ${errorMessage(error)}`,
//       });
//     }
//   }
//
//   return { observations, diagnostics };
// }
//
// /*** Collect leaf regions worth probing while avoiding text already owned by an ancestor. */
// function collectRegionCandidates(graph: ScreenImageVisualGraph): readonly ScreenImageVisualNode[] {
//   const screenArea = Math.max(1, graph.width * graph.height);
//   const candidates = collectRegionCandidatesFromNode(graph.root, screenArea, false);
//   const textNodes = collectScreenTextEvidenceNodes(graph.root);
//   return candidates.filter(
//     (candidate) => !textNodes.some((textNode) => overlapsTextCenter(candidate, textNode)),
//   );
// }
//
// /*** Traverse detected regions and return meaningful textless leaves in screen-tree order. */
// function collectRegionCandidatesFromNode(
//   node: ScreenImageVisualNode,
//   screenArea: number,
//   ancestorHasText: boolean,
// ): readonly ScreenImageVisualNode[] {
//   const nodeHasText = node.id !== 'screen' && Boolean(node.text?.trim());
//   const blockedByText = ancestorHasText || nodeHasText;
//   const descendants = node.children.flatMap((child) =>
//     collectRegionCandidatesFromNode(child, screenArea, blockedByText),
//   );
//   if (descendants.length > 0) return descendants;
//   const descendantHasText = node.children.some(hasScreenTextEvidence);
//   return !blockedByText && !descendantHasText && isMeaningfulDetectedRegion(node, screenArea)
//     ? [node]
//     : [];
// }
//
// /*** Detect existing OCR evidence anywhere in one visual subtree. */
// function hasScreenTextEvidence(node: ScreenImageVisualNode): boolean {
//   return Boolean(node.text?.trim()) || node.children.some(hasScreenTextEvidence);
// }
//
// /*** Collect visual nodes that already own non-empty OCR evidence. */
// function collectScreenTextEvidenceNodes(
//   node: ScreenImageVisualNode,
// ): readonly ScreenImageVisualNode[] {
//   return [
//     ...(node.id !== 'screen' && node.text?.trim() ? [node] : []),
//     ...node.children.flatMap(collectScreenTextEvidenceNodes),
//   ];
// }
//
// /*** Detect a candidate and text node whose centers overlap the other's visual bounds. */
// function overlapsTextCenter(
//   candidate: ScreenImageVisualNode,
//   textNode: ScreenImageVisualNode,
// ): boolean {
//   return (
//     containsRectCenter(candidate.bounds, textNode.bounds) ||
//     containsRectCenter(textNode.bounds, candidate.bounds)
//   );
// }
//
// /*** Determine whether one rectangle contains the center of another rectangle. */
// function containsRectCenter(container: ScreenImageRect, target: ScreenImageRect): boolean {
//   const x = target.x + target.width / 2;
//   const y = target.y + target.height / 2;
//   return (
//     x >= container.x &&
//     x <= container.x + container.width &&
//     y >= container.y &&
//     y <= container.y + container.height
//   );
// }
//
// /*** Restrict fallback OCR to substantial OpenCV regions rather than noise or large imagery. */
// function isMeaningfulDetectedRegion(node: ScreenImageVisualNode, screenArea: number): boolean {
//   const areaRatio = (node.bounds.width * node.bounds.height) / screenArea;
//   return (
//     node.id.startsWith('region-') &&
//     node.bounds.width >= MIN_REGION_DIMENSION &&
//     node.bounds.height >= MIN_REGION_DIMENSION &&
//     areaRatio >= MIN_REGION_AREA_RATIO &&
//     areaRatio <= MAX_REGION_AREA_RATIO
//   );
// }
//
// /*** Crop, upscale, grayscale, and normalize one UI region before local OCR. */
// async function createRegionOcrImageAsync(
//   image: Uint8Array,
//   crop: ScreenImageRect,
// ): Promise<Uint8Array> {
//   const { default: sharp } = await import('sharp');
//   const output = await sharp(Buffer.from(image))
//     .extract({ left: crop.x, top: crop.y, width: crop.width, height: crop.height })
//     .resize(crop.width * REGION_SCALE, crop.height * REGION_SCALE, {
//       fit: 'fill',
//       kernel: 'lanczos3',
//     })
//     .grayscale()
//     .normalize()
//     .png()
//     .toBuffer();
//   return Uint8Array.from(output);
// }
//
// /*** Keep non-empty local OCR evidence unless its known normalized confidence is too low. */
// function isUsableRegionObservation(observation: ScreenImageTextObservation): boolean {
//   return (
//     Boolean(observation.text.trim()) &&
//     (observation.confidence === undefined || observation.confidence >= MIN_REGION_OCR_CONFIDENCE)
//   );
// }
//
// /*** Translate one upscaled crop-local OCR observation into full-screen coordinates. */
// function translateRegionObservation(
//   observation: ScreenImageTextObservation,
//   crop: ScreenImageRect,
// ): ScreenImageTextObservation {
//   const bounds = observation.bounds
//     ? {
//         x: crop.x + observation.bounds.x / REGION_SCALE,
//         y: crop.y + observation.bounds.y / REGION_SCALE,
//         width: observation.bounds.width / REGION_SCALE,
//         height: observation.bounds.height / REGION_SCALE,
//       }
//     : crop;
//   return {
//     ...observation,
//     bounds: clampRectToParent(bounds, crop),
//   };
// }
//
// /*** Clamp a detected rectangle to integer pixel coordinates within the screen. */
// function clampRect(rect: ScreenImageRect, width: number, height: number): ScreenImageRect {
//   const left = Math.max(0, Math.floor(rect.x));
//   const top = Math.max(0, Math.floor(rect.y));
//   const right = Math.min(width, Math.ceil(rect.x + rect.width));
//   const bottom = Math.min(height, Math.ceil(rect.y + rect.height));
//   return {
//     x: left,
//     y: top,
//     width: Math.max(1, right - left),
//     height: Math.max(1, bottom - top),
//   };
// }
//
// /*** Clamp translated OCR bounds to the source crop that produced them. */
// function clampRectToParent(rect: ScreenImageRect, parent: ScreenImageRect): ScreenImageRect {
//   const left = Math.max(parent.x, rect.x);
//   const top = Math.max(parent.y, rect.y);
//   const right = Math.min(parent.x + parent.width, rect.x + rect.width);
//   const bottom = Math.min(parent.y + parent.height, rect.y + rect.height);
//   return {
//     x: left,
//     y: top,
//     width: Math.max(0, right - left),
//     height: Math.max(0, bottom - top),
//   };
// }
//
// /*** Convert an unknown thrown value into a stable diagnostic message. */
// function errorMessage(error: unknown): string {
//   return error instanceof Error ? error.message : String(error);
// }
