// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import type { UiComponentMeta, UiNode } from '@ankhorage/contracts';
//
// import { unionRects } from '../geometry/unionRects.js';
// import { consumeScreenVisualRepeatedProps } from './consumeScreenVisualRepeatedProps.js';
// import { consumeScreenVisualTextProps } from './consumeScreenVisualTextProps.js';
// import { groupRepeatedScreenVisualChildren } from './groupRepeatedScreenVisualChildren.js';
// import { scoreScreenComponentCandidatesAsync } from './scoreScreenComponentCandidatesAsync.js';
// import type {
//   MatchedScreenImageNode,
//   ScoredScreenImageCandidate,
//   ScreenImageMatchContext,
// } from './screenComponentMatchingTypes.js';
// import type {
//   ScreenImageArrangement,
//   ScreenImageCandidateEvidence,
//   ScreenImageDiagnostic,
//   ScreenImageVisualNode,
//   ScreenImageVisualSimilarity,
// } from './types.js';
//
// /*** Match a visual graph to the highest-confidence globally valid component tree. */
// export async function matchScreenComponentTreeAsync(input: {
//   readonly image: Uint8Array;
//   readonly root: ScreenImageVisualNode;
//   readonly components: readonly UiComponentMeta[];
//   readonly screenId: string;
//   readonly minConfidence: number;
//   readonly unresolvedComponentName?: string;
//   readonly visualSimilarity?: ScreenImageVisualSimilarity;
// }): Promise<{
//   readonly root: UiNode;
//   readonly confidence: number;
//   readonly candidates: readonly ScreenImageCandidateEvidence[];
//   readonly diagnostics: readonly ScreenImageDiagnostic[];
// }> {
//   const candidates: ScreenImageCandidateEvidence[] = [];
//   const diagnostics: ScreenImageDiagnostic[] = [];
//   const context: ScreenImageMatchContext = {
//     image: input.image,
//     components: input.components,
//     minConfidence: input.minConfidence,
//     candidates,
//     diagnostics,
//     screenId: input.screenId,
//     ...(input.unresolvedComponentName
//       ? { unresolvedComponentName: input.unresolvedComponentName }
//       : {}),
//     ...(input.visualSimilarity ? { visualSimilarity: input.visualSimilarity } : {}),
//   };
//   const matched = await solveNodeAsync(input.root, context);
//
//   if (!matched) {
//     throw new Error('No direct manifest component can represent the analyzed screen root.');
//   }
//
//   return createMatchResult(matched, input.screenId, candidates, diagnostics);
// }
//
// /*** Solve one visual subtree by trying semantic candidates before explicit unresolved fallback. */
// async function solveNodeAsync(
//   visual: ScreenImageVisualNode,
//   context: ScreenImageMatchContext,
//   allowedNames?: ReadonlySet<string>,
// ): Promise<MatchedScreenImageNode | undefined> {
//   const preferred = await matchPreferredNodeAsync(visual, context, allowedNames);
//   return preferred.match ?? resolveUnresolvedNode(visual, context, allowedNames, preferred.scored);
// }
//
// /*** Match only confidence-qualified semantic candidates without applying unresolved fallback. */
// async function matchPreferredNodeAsync(
//   visual: ScreenImageVisualNode,
//   context: ScreenImageMatchContext,
//   allowedNames?: ReadonlySet<string>,
// ): Promise<{
//   readonly match?: MatchedScreenImageNode;
//   readonly scored: readonly ScoredScreenImageCandidate[];
// }> {
//   const scored = await scoreScreenComponentCandidatesAsync(visual, context, allowedNames);
//   for (const entry of scored.filter((candidate) => candidate.score >= context.minConfidence)) {
//     const match = await createCandidateMatchAsync(visual, entry, context);
//     if (match) return { match, scored };
//   }
//   return { scored };
// }
//
// /*** Match a matcher-created repeated group only through owner-declared structured consumption. */
// async function matchRepeatedGroupAsync(
//   visual: ScreenImageVisualNode,
//   context: ScreenImageMatchContext,
//   allowedNames: ReadonlySet<string>,
// ): Promise<MatchedScreenImageNode | undefined> {
//   const scored = await scoreScreenComponentCandidatesAsync(visual, context, allowedNames);
//   for (const entry of scored.filter((candidate) => candidate.score >= context.minConfidence)) {
//     const props = consumeScreenVisualRepeatedProps(visual, entry.component);
//     if (!props) continue;
//     return {
//       component: entry.component,
//       score: entry.score,
//       visual,
//       props,
//       children: [],
//     };
//   }
//   return undefined;
// }
//
// /*** Try to represent one visual subtree with an already-scored component candidate. */
// async function createCandidateMatchAsync(
//   visual: ScreenImageVisualNode,
//   entry: ScoredScreenImageCandidate,
//   context: ScreenImageMatchContext,
// ): Promise<MatchedScreenImageNode | undefined> {
//   const consumedProps =
//     consumeScreenVisualRepeatedProps(visual, entry.component) ??
//     consumeScreenVisualTextProps(visual, entry.component);
//   if (visual.children.length > 0 && consumedProps) {
//     return {
//       component: entry.component,
//       score: entry.score,
//       visual,
//       props: consumedProps,
//       children: [],
//     };
//   }
//
//   const allowedChildren = resolveAllowedChildren(entry.component);
//   if (visual.children.length > 0 && allowedChildren.length === 0) return undefined;
//   const children = await matchChildrenAsync(
//     visual.children,
//     context,
//     new Set(allowedChildren),
//     !isSyntheticGroup(visual),
//   );
//   if (!children) return undefined;
//
//   return {
//     component: entry.component,
//     score: entry.score,
//     visual,
//     ...(consumedProps ? { props: consumedProps } : {}),
//     children,
//   };
// }
//
// /*** Match direct visual children while first offering repeated sibling runs to group-level metadata. */
// async function matchChildrenAsync(
//   children: readonly ScreenImageVisualNode[],
//   context: ScreenImageMatchContext,
//   allowedNames: ReadonlySet<string>,
//   allowGrouping: boolean,
// ): Promise<readonly MatchedScreenImageNode[] | undefined> {
//   const segments = allowGrouping
//     ? groupRepeatedScreenVisualChildren(children)
//     : children.map((child) => [child] as const);
//   const matchedChildren: MatchedScreenImageNode[] = [];
//
//   for (const segment of segments) {
//     if (segment.length > 1) {
//       const grouped = await matchRepeatedGroupAsync(
//         createRepeatedGroupVisualNode(segment),
//         context,
//         allowedNames,
//       );
//       if (grouped) {
//         matchedChildren.push(grouped);
//         continue;
//       }
//     }
//
//     for (const child of segment) {
//       const matched = await solveNodeAsync(child, context, allowedNames);
//       if (!matched) return undefined;
//       matchedChildren.push(matched);
//     }
//   }
//   return matchedChildren;
// }
//
// /*** Create a synthetic repeated visual node that remains owner-neutral until candidate matching. */
// function createRepeatedGroupVisualNode(
//   children: readonly ScreenImageVisualNode[],
// ): ScreenImageVisualNode {
//   const bounds = unionRects(children.map((child) => child.bounds));
//   const [first] = children;
//   const last = children.at(-1);
//   if (!bounds || !first || !last) {
//     throw new Error('Cannot create a repeated visual group from an empty sibling run.');
//   }
//   return {
//     id: `group-${first.id}-${last.id}`,
//     bounds,
//     arrangement: inferRepeatedArrangement(children),
//     repeated: true,
//     children,
//   };
// }
//
// /*** Infer the coarse arrangement of a synthetic repeated sibling group. */
// function inferRepeatedArrangement(
//   children: readonly ScreenImageVisualNode[],
// ): ScreenImageArrangement {
//   const centersX = children.map((child) => child.bounds.x + child.bounds.width / 2);
//   const centersY = children.map((child) => child.bounds.y + child.bounds.height / 2);
//   const averageWidth = average(children.map((child) => child.bounds.width));
//   const averageHeight = average(children.map((child) => child.bounds.height));
//   const horizontal = spread(centersY) <= Math.max(3, averageHeight * 0.35);
//   const vertical = spread(centersX) <= Math.max(3, averageWidth * 0.35);
//   if (vertical) return 'vertical';
//   if (horizontal) return 'horizontal';
//   return 'grid';
// }
//
// /*** Detect matcher-created grouping nodes so nested matching does not regroup the same siblings. */
// function isSyntheticGroup(visual: ScreenImageVisualNode): boolean {
//   return visual.id.startsWith('group-');
// }
//
// /*** Resolve a configured unresolved marker instead of inventing a low-confidence real component. */
// function resolveUnresolvedNode(
//   visual: ScreenImageVisualNode,
//   context: ScreenImageMatchContext,
//   allowedNames: ReadonlySet<string> | undefined,
//   scored: readonly ScoredScreenImageCandidate[],
// ): MatchedScreenImageNode | undefined {
//   const component = resolveUnresolvedComponent(context, allowedNames);
//   if (!component) {
//     context.diagnostics.push({
//       kind: 'structure',
//       nodeId: visual.id,
//       message: `No component candidate can satisfy the confidence and parent/child constraints for ${visual.id}.`,
//     });
//     return undefined;
//   }
//
//   const best = scored.at(0);
//   context.diagnostics.push({
//     kind: 'unresolved',
//     nodeId: visual.id,
//     message: best
//       ? `Region ${visual.id} remained unresolved; best candidate ${best.component.name} scored ${best.score.toFixed(2)}.`
//       : `Region ${visual.id} remained unresolved because no eligible component candidate exists.`,
//   });
//   return {
//     component,
//     score: 0,
//     visual,
//     ...(component.blueprint?.defaultProps
//       ? { props: { ...component.blueprint.defaultProps } }
//       : {}),
//     children: [],
//   };
// }
//
// /*** Resolve the owner-supplied unresolved marker within current parent constraints. */
// function resolveUnresolvedComponent(
//   context: ScreenImageMatchContext,
//   allowedNames: ReadonlySet<string> | undefined,
// ): UiComponentMeta | undefined {
//   const component = context.unresolvedComponentName
//     ? context.components.find((candidate) => candidate.name === context.unresolvedComponentName)
//     : undefined;
//   if (!component?.directManifestNode || (allowedNames && !allowedNames.has(component.name))) {
//     return undefined;
//   }
//   return component;
// }
//
// /*** Return the direct manifest child contract, including an explicit children slot when present. */
// function resolveAllowedChildren(component: UiComponentMeta): readonly string[] {
//   if (component.allowedChildren.length > 0) return component.allowedChildren;
//   return component.slots?.children?.allowedChildren ?? component.allowedChildren;
// }
//
// /*** Build the public match result and aggregate selected-node confidence. */
// function createMatchResult(
//   matched: MatchedScreenImageNode,
//   screenId: string,
//   candidates: readonly ScreenImageCandidateEvidence[],
//   diagnostics: readonly ScreenImageDiagnostic[],
// ): {
//   readonly root: UiNode;
//   readonly confidence: number;
//   readonly candidates: readonly ScreenImageCandidateEvidence[];
//   readonly diagnostics: readonly ScreenImageDiagnostic[];
// } {
//   const scores: number[] = [];
//   collectScores(matched, scores);
//   return {
//     root: toUiNode(matched, screenId),
//     confidence:
//       scores.length === 0 ? 0 : scores.reduce((sum, score) => sum + score, 0) / scores.length,
//     candidates,
//     diagnostics,
//   };
// }
//
// /*** Convert a matched component subtree to the canonical Contracts UiNode shape. */
// function toUiNode(node: MatchedScreenImageNode, screenId: string): UiNode {
//   const children = node.children.map((child) => toUiNode(child, screenId));
//   return {
//     id: `${screenId}-${node.visual.id}`,
//     type: node.component.name,
//     ...(node.props ? { props: { ...node.props } } : {}),
//     ...(children.length > 0 ? { children } : {}),
//   };
// }
//
// /*** Collect selected confidence scores from the matched component tree. */
// function collectScores(node: MatchedScreenImageNode, scores: number[]): void {
//   scores.push(node.score);
//   node.children.forEach((child) => collectScores(child, scores));
// }
//
// /*** Calculate the arithmetic mean of a numeric list. */
// function average(values: readonly number[]): number {
//   return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
// }
//
// /*** Calculate the numeric spread of a list. */
// function spread(values: readonly number[]): number {
//   return Math.max(...values) - Math.min(...values);
// }
