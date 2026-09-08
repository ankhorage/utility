import type { UiComponentMeta } from '@ankhorage/contracts';

import type {
  ScreenImageCandidateEvidence,
  ScreenImageDiagnostic,
  ScreenImageVisualNode,
  ScreenImageVisualSimilarity,
} from './types.js';

export interface ScreenImageMatchContext {
  readonly image: Uint8Array;
  readonly components: readonly UiComponentMeta[];
  readonly minConfidence: number;
  readonly unresolvedComponentName?: string;
  readonly visualSimilarity?: ScreenImageVisualSimilarity;
  readonly candidates: ScreenImageCandidateEvidence[];
  readonly diagnostics: ScreenImageDiagnostic[];
  readonly screenId: string;
}

export interface MatchedScreenImageNode {
  readonly component: UiComponentMeta;
  readonly score: number;
  readonly visual: ScreenImageVisualNode;
  readonly props?: Readonly<Record<string, unknown>>;
  readonly children: readonly MatchedScreenImageNode[];
}

export interface ScoredScreenImageCandidate {
  readonly component: UiComponentMeta;
  readonly score: number;
}
