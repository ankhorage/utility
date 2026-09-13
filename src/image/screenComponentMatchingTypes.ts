// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import type { UiComponentMeta } from '@ankhorage/contracts';
//
// import type {
//   ScreenImageCandidateEvidence,
//   ScreenImageDiagnostic,
//   ScreenImageVisualNode,
//   ScreenImageVisualSimilarity,
// } from './types.js';
//
// export interface ScreenImageMatchContext {
//   readonly image: Uint8Array;
//   readonly components: readonly UiComponentMeta[];
//   readonly minConfidence: number;
//   readonly unresolvedComponentName?: string;
//   readonly visualSimilarity?: ScreenImageVisualSimilarity;
//   readonly candidates: ScreenImageCandidateEvidence[];
//   readonly diagnostics: ScreenImageDiagnostic[];
//   readonly screenId: string;
// }
//
// export interface MatchedScreenImageNode {
//   readonly component: UiComponentMeta;
//   readonly score: number;
//   readonly visual: ScreenImageVisualNode;
//   readonly props?: Readonly<Record<string, unknown>>;
//   readonly children: readonly MatchedScreenImageNode[];
// }
//
// export interface ScoredScreenImageCandidate {
//   readonly component: UiComponentMeta;
//   readonly score: number;
// }
