import type { UiComponentMeta } from '@ankhorage/contracts';

import { consumeScreenVisualTextProps } from './consumeScreenVisualTextProps.js';
import type {
  ScoredScreenImageCandidate,
  ScreenImageMatchContext,
} from './screenComponentMatchingTypes.js';
import type { ScreenImageVisualNode } from './types.js';

/*** Score eligible owner-supplied components against one visual subtree. */
export async function scoreScreenComponentCandidatesAsync(
  visual: ScreenImageVisualNode,
  context: ScreenImageMatchContext,
  allowedNames?: ReadonlySet<string>,
): Promise<readonly ScoredScreenImageCandidate[]> {
  const eligible = context.components.filter(
    (component) =>
      component.directManifestNode &&
      isRootCandidate(visual, component) &&
      component.name !== context.unresolvedComponentName &&
      (!allowedNames || allowedNames.has(component.name)),
  );
  const scored = await Promise.all(
    eligible.map(async (component) => scoreCandidateAsync(visual, component, context)),
  );
  const ordered = scored.sort(
    (left, right) =>
      right.score - left.score || specificity(right.component) - specificity(left.component),
  );

  ordered.slice(0, 3).forEach((entry) => {
    context.candidates.push({
      nodeId: visual.id,
      componentName: entry.component.name,
      score: entry.score,
    });
  });
  return ordered;
}

/*** Combine deterministic metadata evidence with optional injected visual similarity. */
async function scoreCandidateAsync(
  visual: ScreenImageVisualNode,
  component: UiComponentMeta,
  context: ScreenImageMatchContext,
): Promise<ScoredScreenImageCandidate> {
  const base = scoreMetadata(visual, component);
  if (!context.visualSimilarity) {
    return { component, score: base };
  }

  const visualScore = clamp(
    await context.visualSimilarity.scoreAsync({ image: context.image, node: visual, component }),
  );
  return { component, score: clamp(base * 0.65 + visualScore * 0.35) };
}

/*** Keep the visual screen root structural while allowing semantic matching below it. */
function isRootCandidate(visual: ScreenImageVisualNode, component: UiComponentMeta): boolean {
  return visual.id !== 'screen' || component.category === 'layout';
}

/*** Score component metadata without product-specific component tables. */
function scoreMetadata(visual: ScreenImageVisualNode, component: UiComponentMeta): number {
  const haystack = `${component.name} ${component.description ?? ''}`.toLowerCase();
  return clamp(
    categoryBaseScore(component.category, visual.children.length > 0) +
      screenSemanticScore(visual, haystack) +
      arrangementSemanticScore(visual, haystack) +
      repeatedSemanticScore(visual, haystack) +
      textSemanticScore(visual, haystack) +
      propConsumptionSemanticScore(visual, component) +
      patternSemanticScore(visual, component),
  );
}

/*** Score screen-root semantics from generic component metadata text. */
function screenSemanticScore(visual: ScreenImageVisualNode, haystack: string): number {
  return visual.id === 'screen' && containsAny(haystack, ['screen', 'page', 'layout']) ? 0.45 : 0;
}

/*** Score coarse layout semantics from inferred arrangement and generic metadata text. */
function arrangementSemanticScore(visual: ScreenImageVisualNode, haystack: string): number {
  if (visual.arrangement === 'grid' && containsAny(haystack, ['grid', 'tile', 'rail'])) {
    return 0.3;
  }
  if (
    visual.arrangement === 'horizontal' &&
    containsAny(haystack, ['row', 'inline', 'group', 'rail'])
  ) {
    return 0.2;
  }
  if (
    visual.arrangement === 'vertical' &&
    containsAny(haystack, ['stack', 'list', 'section', 'column'])
  ) {
    return 0.2;
  }
  return 0;
}

/*** Score repeated visual geometry against generic repeated-content semantics. */
function repeatedSemanticScore(visual: ScreenImageVisualNode, haystack: string): number {
  return visual.repeated && containsAny(haystack, ['card', 'item', 'list', 'grid', 'rail', 'row'])
    ? 0.2
    : 0;
}

/*** Score OCR evidence against generic text-bearing component semantics. */
function textSemanticScore(visual: ScreenImageVisualNode, haystack: string): number {
  return hasVisualText(visual) &&
    containsAny(haystack, ['text', 'heading', 'label', 'title', 'input', 'search'])
    ? 0.2
    : 0;
}

/*** Detect whether a visual subtree contains any OCR text evidence. */
function hasVisualText(visual: ScreenImageVisualNode): boolean {
  return Boolean(visual.text?.trim()) || visual.children.some((child) => hasVisualText(child));
}

/*** Reward a component when its declared string props can consume the visible text subtree. */
function propConsumptionSemanticScore(
  visual: ScreenImageVisualNode,
  component: UiComponentMeta,
): number {
  return consumeScreenVisualTextProps(visual, component) ? 0.25 : 0;
}

/*** Slightly favor semantic patterns that can consume a meaningful visual subtree. */
function patternSemanticScore(visual: ScreenImageVisualNode, component: UiComponentMeta): number {
  return component.category === 'pattern' && visual.children.length >= 2
    ? Math.min(0.15, visual.children.length * 0.03)
    : 0;
}

/*** Return a base confidence favoring semantic components for subtrees and components for leaves. */
function categoryBaseScore(category: string, hasChildren: boolean): number {
  const normalized = category.toLowerCase();
  if (hasChildren) {
    if (normalized === 'pattern') return 0.48;
    if (normalized === 'layout') return 0.44;
    if (normalized === 'component') return 0.3;
    if (normalized === 'foundation') return 0.26;
    return 0.24;
  }
  if (normalized === 'component') return 0.48;
  if (normalized === 'foundation') return 0.4;
  if (normalized === 'pattern') return 0.32;
  if (normalized === 'layout') return 0.22;
  return 0.25;
}

/*** Rank component categories so semantic patterns win score ties over primitives. */
function specificity(component: UiComponentMeta): number {
  if (component.category === 'pattern') return 4;
  if (component.category === 'component') return 3;
  if (component.category === 'layout') return 2;
  return 1;
}

/*** Check whether a string contains any provided semantic token. */
function containsAny(value: string, tokens: readonly string[]): boolean {
  return tokens.some((token) => value.includes(token));
}

/*** Clamp a confidence value to the inclusive zero-to-one interval. */
function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
