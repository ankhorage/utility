import type { UiNode } from '@ankhorage/contracts';

import type {
  ScreenImageCandidateEvidence,
  ScreenImageComponentMeta,
  ScreenImageDiagnostic,
  ScreenImageVisualNode,
  ScreenImageVisualSimilarity,
} from './types.js';

interface MatchContext {
  readonly image: Uint8Array;
  readonly components: readonly ScreenImageComponentMeta[];
  readonly minConfidence: number;
  readonly visualSimilarity?: ScreenImageVisualSimilarity;
  readonly candidates: ScreenImageCandidateEvidence[];
  readonly diagnostics: ScreenImageDiagnostic[];
  readonly screenId: string;
}

interface MatchedNode {
  readonly component: ScreenImageComponentMeta;
  readonly score: number;
  readonly visual: ScreenImageVisualNode;
  readonly children: readonly MatchedNode[];
}

/*** Match a visual graph to the highest-confidence globally valid component tree. */
export async function matchScreenComponentTreeAsync(input: {
  readonly image: Uint8Array;
  readonly root: ScreenImageVisualNode;
  readonly components: readonly ScreenImageComponentMeta[];
  readonly screenId: string;
  readonly minConfidence: number;
  readonly visualSimilarity?: ScreenImageVisualSimilarity;
}): Promise<{
  readonly root: UiNode;
  readonly confidence: number;
  readonly candidates: readonly ScreenImageCandidateEvidence[];
  readonly diagnostics: readonly ScreenImageDiagnostic[];
}> {
  const candidates: ScreenImageCandidateEvidence[] = [];
  const diagnostics: ScreenImageDiagnostic[] = [];
  const context: MatchContext = {
    image: input.image,
    components: input.components,
    minConfidence: input.minConfidence,
    candidates,
    diagnostics,
    screenId: input.screenId,
    ...(input.visualSimilarity ? { visualSimilarity: input.visualSimilarity } : {}),
  };
  const matched = await solveNodeAsync(input.root, context);

  if (!matched) {
    throw new Error('No direct manifest component can represent the analyzed screen root.');
  }

  const scores: number[] = [];
  collectScores(matched, scores);
  return {
    root: toUiNode(matched, input.screenId),
    confidence:
      scores.length === 0 ? 0 : scores.reduce((sum, score) => sum + score, 0) / scores.length,
    candidates,
    diagnostics,
  };
}

/*** Solve one visual subtree by trying specific high-level candidates before primitive fallbacks. */
async function solveNodeAsync(
  visual: ScreenImageVisualNode,
  context: MatchContext,
  allowedNames?: ReadonlySet<string>,
): Promise<MatchedNode | undefined> {
  const scored = await scoreCandidatesAsync(visual, context, allowedNames);
  const preferred = scored.filter((entry) => entry.score >= context.minConfidence);
  const ordered = preferred.length > 0 ? preferred : scored;

  for (const entry of ordered) {
    const { allowedChildren } = entry.component;
    if (visual.children.length > 0 && allowedChildren?.length === 0) {
      continue;
    }

    const childAllowedNames = allowedChildren ? new Set(allowedChildren) : undefined;
    const children: MatchedNode[] = [];
    let valid = true;
    for (const child of visual.children) {
      const matchedChild = await solveNodeAsync(child, context, childAllowedNames);
      if (!matchedChild) {
        valid = false;
        break;
      }
      children.push(matchedChild);
    }
    if (!valid) {
      continue;
    }

    if (entry.score < context.minConfidence) {
      context.diagnostics.push({
        kind: 'unresolved',
        nodeId: visual.id,
        message: `Low-confidence region ${visual.id} fell back to ${entry.component.name} (${entry.score.toFixed(2)}).`,
      });
    }
    return { component: entry.component, score: entry.score, visual, children };
  }

  context.diagnostics.push({
    kind: 'structure',
    nodeId: visual.id,
    message: `No component candidate can satisfy parent/child constraints for ${visual.id}.`,
  });
  return undefined;
}

/*** Score all eligible components from semantic, structural, geometry, and optional visual evidence. */
async function scoreCandidatesAsync(
  visual: ScreenImageVisualNode,
  context: MatchContext,
  allowedNames?: ReadonlySet<string>,
): Promise<readonly { readonly component: ScreenImageComponentMeta; readonly score: number }[]> {
  const eligible = context.components.filter(
    (component) =>
      component.directManifestNode !== false && (!allowedNames || allowedNames.has(component.name)),
  );
  const scored = await Promise.all(
    eligible.map(async (component) => {
      const base = scoreMetadata(visual, component);
      const visualScore = context.visualSimilarity
        ? clamp(
            await context.visualSimilarity.scoreAsync({
              image: context.image,
              node: visual,
              component,
            }),
          )
        : undefined;
      const score = visualScore === undefined ? base : clamp(base * 0.65 + visualScore * 0.35);
      return { component, score };
    }),
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

/*** Score component metadata against one visual subtree without product-specific component tables. */
function scoreMetadata(visual: ScreenImageVisualNode, component: ScreenImageComponentMeta): number {
  const haystack = `${component.name} ${component.description ?? ''}`.toLowerCase();
  const base = categoryBaseScore(component.category, visual.children.length > 0);
  return clamp(
    base +
      screenSemanticScore(visual, haystack) +
      arrangementSemanticScore(visual, haystack) +
      repeatedSemanticScore(visual, haystack) +
      textSemanticScore(visual, haystack) +
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

/*** Score repeated visual geometry against generic repeated-content component semantics. */
function repeatedSemanticScore(visual: ScreenImageVisualNode, haystack: string): number {
  return visual.repeated && containsAny(haystack, ['card', 'item', 'list', 'grid', 'rail', 'row'])
    ? 0.2
    : 0;
}

/*** Score OCR text evidence against generic text-bearing component semantics. */
function textSemanticScore(visual: ScreenImageVisualNode, haystack: string): number {
  return visual.text &&
    containsAny(haystack, ['text', 'heading', 'label', 'title', 'input', 'search'])
    ? 0.2
    : 0;
}

/*** Slightly favor semantic patterns that can consume a meaningful visual subtree. */
function patternSemanticScore(
  visual: ScreenImageVisualNode,
  component: ScreenImageComponentMeta,
): number {
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

/*** Rank component categories so larger semantic patterns win score ties over primitives. */
function specificity(component: ScreenImageComponentMeta): number {
  if (component.category === 'pattern') return 4;
  if (component.category === 'component') return 3;
  if (component.category === 'layout') return 2;
  if (component.category === 'foundation') return 1;
  return 0;
}

/*** Convert a matched component subtree to the canonical Contracts UiNode shape. */
function toUiNode(node: MatchedNode, screenId: string): UiNode {
  const props = textProps(node.component, node.visual.text);
  const children = node.children.map((child) => toUiNode(child, screenId));
  return {
    id: `${screenId}-${node.visual.id}`,
    type: node.component.name,
    ...(props ? { props } : {}),
    ...(children.length > 0 ? { children } : {}),
  };
}

/*** Map OCR text only to a prop that the supplied component metadata explicitly declares. */
function textProps(
  component: ScreenImageComponentMeta,
  text: string | undefined,
): Record<string, unknown> | undefined {
  const { props } = component;
  if (!text || !props) {
    return undefined;
  }
  const key = ['text', 'label', 'title'].find((candidate) => candidate in props);
  return key ? { [key]: text } : undefined;
}

/*** Collect selected confidence scores from the matched component tree. */
function collectScores(node: MatchedNode, scores: number[]): void {
  scores.push(node.score);
  node.children.forEach((child) => collectScores(child, scores));
}

/*** Check whether a string contains any provided semantic token. */
function containsAny(value: string, tokens: readonly string[]): boolean {
  return tokens.some((token) => value.includes(token));
}

/*** Clamp a confidence value to the inclusive zero-to-one interval. */
function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
