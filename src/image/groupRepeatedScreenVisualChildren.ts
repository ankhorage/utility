// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import type { ScreenImageVisualNode } from './types.js';
//
// const SIZE_SIMILARITY = 0.18;
// const ALIGNMENT_FACTOR = 0.25;
// const MAX_GAP_FACTOR = 1.5;
//
// /*** Partition sibling visual nodes into deterministic repeated runs without forcing a semantic group. */
// export function groupRepeatedScreenVisualChildren(
//   children: readonly ScreenImageVisualNode[],
// ): readonly (readonly ScreenImageVisualNode[])[] {
//   const groups: ScreenImageVisualNode[][] = [];
//   let index = 0;
//
//   while (index < children.length) {
//     const first = children.at(index);
//     if (!first) break;
//
//     const run = [first];
//     let nextIndex = index + 1;
//     while (nextIndex < children.length) {
//       const previous = run.at(-1);
//       const candidate = children.at(nextIndex);
//       if (!previous || !candidate || !sharesRepeatedRun(previous, candidate)) break;
//       run.push(candidate);
//       nextIndex += 1;
//     }
//
//     if (run.length >= 2) {
//       groups.push(run);
//     } else {
//       groups.push([first]);
//     }
//     index += run.length;
//   }
//
//   return groups;
// }
//
// /*** Determine whether adjacent siblings form one repeated visual run. */
// function sharesRepeatedRun(left: ScreenImageVisualNode, right: ScreenImageVisualNode): boolean {
//   if (!hasSimilarSize(left, right)) return false;
//
//   const vertical =
//     centerOffsetX(left, right) <=
//       Math.max(left.bounds.width, right.bounds.width) * ALIGNMENT_FACTOR &&
//     forwardVerticalGap(left, right) <=
//       Math.max(left.bounds.height, right.bounds.height) * MAX_GAP_FACTOR;
//   const horizontal =
//     centerOffsetY(left, right) <=
//       Math.max(left.bounds.height, right.bounds.height) * ALIGNMENT_FACTOR &&
//     forwardHorizontalGap(left, right) <=
//       Math.max(left.bounds.width, right.bounds.width) * MAX_GAP_FACTOR;
//   return vertical || horizontal;
// }
//
// /*** Compare sibling dimensions using a symmetric relative tolerance. */
// function hasSimilarSize(left: ScreenImageVisualNode, right: ScreenImageVisualNode): boolean {
//   const widthDelta =
//     Math.abs(left.bounds.width - right.bounds.width) /
//     Math.max(1, Math.max(left.bounds.width, right.bounds.width));
//   const heightDelta =
//     Math.abs(left.bounds.height - right.bounds.height) /
//     Math.max(1, Math.max(left.bounds.height, right.bounds.height));
//   return widthDelta <= SIZE_SIMILARITY && heightDelta <= SIZE_SIMILARITY;
// }
//
// /*** Return the horizontal center distance between sibling regions. */
// function centerOffsetX(left: ScreenImageVisualNode, right: ScreenImageVisualNode): number {
//   return Math.abs(
//     left.bounds.x + left.bounds.width / 2 - (right.bounds.x + right.bounds.width / 2),
//   );
// }
//
// /*** Return the vertical center distance between sibling regions. */
// function centerOffsetY(left: ScreenImageVisualNode, right: ScreenImageVisualNode): number {
//   return Math.abs(
//     left.bounds.y + left.bounds.height / 2 - (right.bounds.y + right.bounds.height / 2),
//   );
// }
//
// /*** Return vertical separation only when the second sibling follows the first on screen. */
// function forwardVerticalGap(left: ScreenImageVisualNode, right: ScreenImageVisualNode): number {
//   if (right.bounds.y < left.bounds.y) return Number.POSITIVE_INFINITY;
//   return Math.max(0, right.bounds.y - (left.bounds.y + left.bounds.height));
// }
//
// /*** Return horizontal separation only when the second sibling follows the first on screen. */
// function forwardHorizontalGap(left: ScreenImageVisualNode, right: ScreenImageVisualNode): number {
//   if (right.bounds.x < left.bounds.x) return Number.POSITIVE_INFINITY;
//   return Math.max(0, right.bounds.x - (left.bounds.x + left.bounds.width));
// }
