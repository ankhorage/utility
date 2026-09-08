import type { ScreenSpec, UiComponentMeta } from '@ankhorage/contracts';

export type ScreenImageInput = string | Uint8Array;

export interface ScreenImageRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type ScreenImageArrangement = 'grid' | 'horizontal' | 'none' | 'vertical';

export interface ScreenImageVisualNode {
  readonly id: string;
  readonly bounds: ScreenImageRect;
  readonly arrangement: ScreenImageArrangement;
  readonly repeated: boolean;
  readonly text?: string;
  readonly children: readonly ScreenImageVisualNode[];
}

export interface ScreenImageVisualGraph {
  readonly width: number;
  readonly height: number;
  readonly root: ScreenImageVisualNode;
}

export interface ScreenImageTextObservation {
  readonly text: string;
  readonly bounds?: ScreenImageRect;
  /** Normalized zero-to-one OCR confidence when the provider exposes it. */
  readonly confidence?: number;
}

export interface ScreenImageOcrRequest {
  readonly scope: 'region' | 'screen';
}

export interface ScreenImageOcr {
  readonly recognizeAsync: (
    image: Uint8Array,
    request?: ScreenImageOcrRequest,
  ) => Promise<readonly ScreenImageTextObservation[]>;
  readonly terminateAsync?: () => Promise<void>;
}

export interface ScreenImageVisualSimilarity {
  readonly scoreAsync: (input: {
    readonly image: Uint8Array;
    readonly node: ScreenImageVisualNode;
    readonly component: UiComponentMeta;
  }) => Promise<number>;
}

export interface ScreenImageCandidateEvidence {
  readonly nodeId: string;
  readonly componentName: string;
  readonly score: number;
}

export interface ScreenImageDiagnostic {
  readonly kind: 'ocr' | 'structure' | 'unresolved';
  readonly nodeId?: string;
  readonly message: string;
}

export interface ScreenImageAnalysisOptions {
  readonly screen: {
    readonly id: string;
    readonly name: string;
    readonly title?: string;
    readonly description?: string;
  };
  readonly components: readonly UiComponentMeta[];
  readonly unresolvedComponentName?: string;
  readonly ocr?: ScreenImageOcr;
  readonly visualSimilarity?: ScreenImageVisualSimilarity;
  readonly minConfidence?: number;
}

export interface ScreenImageAnalysisResult {
  readonly screen: ScreenSpec;
  readonly graph: ScreenImageVisualGraph;
  readonly confidence: number;
  readonly candidates: readonly ScreenImageCandidateEvidence[];
  readonly diagnostics: readonly ScreenImageDiagnostic[];
}

export interface ScreenImageComparisonResult {
  readonly mismatchedPixels: number;
  readonly mismatchRatio: number;
  readonly dimensionsMatch: boolean;
}

export interface ScreenImagePixels {
  readonly data: Uint8Array;
  readonly png: Uint8Array;
  readonly width: number;
  readonly height: number;
}
