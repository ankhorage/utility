import type { ScreenSpec } from '@ankhorage/contracts';

import { applyScreenTextObservations } from './applyScreenTextObservations.js';
import { detectScreenRegionsAsync } from './detectScreenRegionsAsync.js';
import { loadScreenImageAsync } from './loadScreenImageAsync.js';
import { matchScreenComponentTreeAsync } from './matchScreenComponentTreeAsync.js';
import type {
  ScreenImageAnalysisOptions,
  ScreenImageAnalysisResult,
  ScreenImageDiagnostic,
  ScreenImageInput,
} from './types.js';

const DEFAULT_MIN_CONFIDENCE = 0.42;

/*** Analyze a UI screenshot and derive one canonical Contracts ScreenSpec from local evidence. */
export async function analyzeScreenImageAsync(
  image: ScreenImageInput,
  options: ScreenImageAnalysisOptions,
): Promise<ScreenImageAnalysisResult> {
  if (options.components.length === 0) {
    throw new Error('Screen image analysis requires at least one component metadata entry.');
  }

  const pixels = await loadScreenImageAsync(image);
  let graph = await detectScreenRegionsAsync(pixels);
  const diagnostics: ScreenImageDiagnostic[] = [];

  if (options.ocr) {
    try {
      const observations = await options.ocr.recognizeAsync(pixels.png);
      graph = applyScreenTextObservations(graph, observations);
    } catch (error) {
      diagnostics.push({
        kind: 'ocr',
        message: `OCR evidence was unavailable: ${errorMessage(error)}`,
      });
    }
  }

  const matched = await matchScreenComponentTreeAsync({
    image: pixels.png,
    root: graph.root,
    components: options.components,
    screenId: options.screen.id,
    minConfidence: options.minConfidence ?? DEFAULT_MIN_CONFIDENCE,
    ...(options.visualSimilarity ? { visualSimilarity: options.visualSimilarity } : {}),
  });
  const screen = createScreenSpec(options, matched.root);

  return {
    screen,
    graph,
    confidence: matched.confidence,
    candidates: matched.candidates,
    diagnostics: [...diagnostics, ...matched.diagnostics],
  };
}

/*** Create the canonical screen contract without introducing a parallel ScreenManifest type. */
function createScreenSpec(
  options: ScreenImageAnalysisOptions,
  root: ScreenSpec['root'],
): ScreenSpec {
  return {
    id: options.screen.id,
    name: options.screen.name,
    root,
    ...(options.screen.title ? { title: options.screen.title } : {}),
    ...(options.screen.description ? { description: options.screen.description } : {}),
  };
}

/*** Convert an unknown thrown value into a stable diagnostic message. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
