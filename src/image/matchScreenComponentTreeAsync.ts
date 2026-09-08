import type { UiComponentMeta, UiNode } from '@ankhorage/contracts';

import type {
  ScreenImageCandidateEvidence,
  ScreenImageDiagnostic,
  ScreenImageVisualNode,
  ScreenImageVisualSimilarity,
} from './types.js';

const LARGE_UNTEXTED_LEAF_RATIO = 0.08;

interface MatchContext {
  readonly image: Uint8Array;
  readonly components: readonly UiComponentMeta[];
  readonly minConfidence: number;
  readonly unresolvedComponentName?: string;
  readonly visualSimilarity?: ScreenImageVisualSimilarity;
  readonly candidates: ScreenImageCandidateEvidence[];
  readonly diagnostics: ScreenImageDiagnostic[];
  readonly screenId: string;
}

interface MatchedNode {
  readonly component: UiComponentMeta;
  readonly score: number;
  readonly visual: ScreenImageVisualNode;
  readonly props?: Readonly<Record<string, unknown>>;
  readonly children: readonly MatchedNode[];
}

/*** Match a visual graph to the highest-confidence globally valid component tree. */
export async function matchScreenComponentTreeAsync(input: {
  readonly image: Uint8Array;
  readonly root: ScreenImageVisualNode;
  readonly components: readonly UiComponentMeta[];
  readonly screenId: string;
  readonly minConfidence: number;
  readonly unresolvedComponentName?: string;
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
    ...(input.unresolvedComponentName
      ? { unresolvedComponentName: input.unresolvedComponentName }
      : {}),
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

/*** Solve one visual subtree by trying specific high-level candidates before structural fallbacks. */
async function solveNodeAsync(
  visual: ScreenImageVisualNode,
  context: MatchContext,
  allowedNames?: ReadonlySet<string>,
): Promise<MatchedNode | undefined> {
  const scored = await scoreCandidatesAsync(visual, context, allowedNames);
  const preferred = scored.filter((entry) => entry.score >= context.minConfidence);

  for (const entry of preferred) {
    const consumedProps = consumeVisualTextProps(visual, entry.component);
    if (visual.children.length > 0 && consumedProps) {
      return {
        component: entry.component,
        score: entry.score,
        visual,
        props: consumedProps,
        children: [],
      };
    }

    const allowedChildren = resolveAllowedChildren(entry.component);
    if (visual.children.length > 0 && allowedChildren.length === 0) {
      continue;
    }

    const children: MatchedNode[] = [];
    let valid = true;
    const childAllowedNames = new Set(allowedChildren);
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

    return {
      component: entry.component,
      score: entry.score,
      visual,
      ...(consumedProps ? { props: consumedProps } : {}),
      children,
    };
  }

  return resolveUnresolvedNode(visual, context, allowedNames, scored);
}

/*** Resolve a configured unresolved marker instead of inventing a low-confidence real component. */
function resolveUnresolvedNode(
  visual: ScreenImageVisualNode,
  context: MatchContext,
  allowedNames: ReadonlySet<string> | undefined,
  scored: readonly { readonly component: UiComponentMeta; readonly score: number }[],
): MatchedNode | undefined {
  const { unresolvedComponentName } = context;
  const component = unresolvedComponentName
    ? context.components.find((candidate) => candidate.name === unresolvedComponentName)
    : undefined;
  if (
    !component ||
    !component.directManifestNode ||
    (allowedNames && !allowedNames.has(component.name))
  ) {
    context.diagnostics.push({
      kind: 'structure',
      nodeId: visual.id,
      message: `No component candidate can satisfy the confidence and parent/child constraints for ${visual.id}.`,
    });
    return undefined;
  }

  const best = scored.at(0);
  context.diagnostics.push({
    kind: 'unresolved',
    nodeId: visual.id,
    message: best
      ? `Region ${visual.id} remained unresolved; best candidate ${best.component.name} scored ${best.score.toFixed(2)}.`
      : `Region ${visual.id} remained unresolved because no eligible component candidate exists.`,
  });
  return {
    component,
    score: 0,
    visual,
    ...(component.blueprint?.defaultProps
      ? { props: { ...component.blueprint.defaultProps } }
      : {}),
    children: [],
  };
}

/*** Score all eligible components from semantic, structural, geometry, and optional visual evidence. */
async function scoreCandidatesAsync(
  visual: ScreenImageVisualNode,
  context: MatchContext,
  allowedNames?: ReadonlySet<string>,
): Promise<readonly { readonly component: UiComponentMeta; readonly score: number }[]> {
  const eligible = context.components.filter(
    (component) =>
      component.directManifestNode &&
      isRootCandidate(visual, component) &&
      component.name !== context.unresolvedComponentName &&
      (!allowedNames || allowedNames.has(component.name)),
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

/*** Keep the visual screen root structural while allowing semantic matching below it. */
function isRootCandidate(visual: ScreenImageVisualNode, component: UiComponentMeta): boolean {
  return visual.id !== 'screen' || component.category === 'layout';
}

/*** Score component metadata against one visual subtree without product-specific component tables. */
function scoreMetadata(visual: ScreenImageVisualNode, component: UiComponentMeta): number {
  const haystack = `${component.name} ${component.description ?? ''}`.toLowerCase();
  const base = categoryBaseScore(component.category, visual.children.length > 0);
  return clamp(
    base +
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

/*** Score repeated visual geometry against generic repeated-content component semantics. */
function repeatedSemanticScore(visual: ScreenImageVisualNode, haystack: string): number {
  return visual.repeated && containsAny(haystack, ['card', 'item', 'list', 'grid', 'rail', 'row'])
    ? 0.2
    : 0;
}

/*** Score OCR evidence against generic text-bearing component semantics. */
function textSemanticScore(visual: ScreenImageVisualNode, haystack: string): number {
  return collectVisualTexts(visual).length > 0 &&
    containsAny(haystack, ['text', 'heading', 'label', 'title', 'input', 'search'])
    ? 0.2
    : 0;
}

/*** Reward a component when its declared string props can consume the visible text subtree. */
function propConsumptionSemanticScore(
  visual: ScreenImageVisualNode,
  component: UiComponentMeta,
): number {
  return consumeVisualTextProps(visual, component) ? 0.25 : 0;
}

/*** Slightly favor semantic patterns that can consume a meaningful visual subtree. */
function patternSemanticScore(visual: ScreenImageVisualNode, component: UiComponentMeta): number {
  return component.category === 'pattern' && visual.children.length >= 2
    ? Math.min(0.15, visual.children.length * 0.03)
    : 0;
}

/*** Return the direct manifest child contract, including an explicit children slot when present. */
function resolveAllowedChildren(component: UiComponentMeta): readonly string[] {
  if (component.allowedChildren.length > 0) {
    return component.allowedChildren;
  }
  return component.slots?.children?.allowedChildren ?? component.allowedChildren;
}

/*** Consume a text-only visual subtree into string props declared by component metadata. */
function consumeVisualTextProps(
  visual: ScreenImageVisualNode,
  component: UiComponentMeta,
): Readonly<Record<string, unknown>> | undefined {
  const texts = collectVisualTexts(visual);
  if (texts.length === 0 || hasSubstantialUntextedLeaf(visual)) {
    return undefined;
  }

  const propNames = resolveConsumableTextPropNames(component);
  if (propNames.length < texts.length) {
    return undefined;
  }

  return Object.fromEntries(
    texts.map((text, index) => [propNames.at(index), text] as const).filter(hasDefinedKey),
  );
}

/*** Resolve declared string content props in owner-defined authoring order. */
function resolveConsumableTextPropNames(component: UiComponentMeta): readonly string[] {
  const i18nNames = component.i18n?.fields.map((field) => field.defaultTextProp) ?? [];
  const remainingNames = Object.entries(component.props)
    .filter(([name, schema]) => schema.type === 'string' && isTextContentPropName(name))
    .map(([name]) => name)
    .filter((name) => !i18nNames.includes(name));
  return [...i18nNames, ...remainingNames];
}

/*** Limit automatic OCR mapping to visible copy-like prop names rather than identifiers or URLs. */
function isTextContentPropName(name: string): boolean {
  const normalized = name.toLowerCase();
  return [
    'body',
    'brand',
    'caption',
    'description',
    'eyebrow',
    'label',
    'message',
    'name',
    'price',
    'subtitle',
    'text',
    'title',
    'vendor',
  ].some((token) => normalized.includes(token));
}

/*** Collect OCR text from a visual subtree in deterministic screen-tree order. */
function collectVisualTexts(visual: ScreenImageVisualNode): readonly string[] {
  const ownText = visual.text?.trim();
  return [
    ...(ownText ? [ownText] : []),
    ...visual.children.flatMap((child) => collectVisualTexts(child)),
  ];
}

/*** Detect a large geometry leaf that cannot safely be discarded as text-only detail. */
function hasSubstantialUntextedLeaf(visual: ScreenImageVisualNode): boolean {
  const parentArea = Math.max(1, visual.bounds.width * visual.bounds.height);
  return visual.children.some((child) => {
    if (child.children.length > 0) {
      return hasSubstantialUntextedLeaf(child);
    }
    if (child.text?.trim()) {
      return false;
    }
    const childArea = child.bounds.width * child.bounds.height;
    return childArea / parentArea >= LARGE_UNTEXTED_LEAF_RATIO;
  });
}

/*** Keep only text-to-prop entries whose metadata key was resolved. */
function hasDefinedKey(
  entry: readonly [string | undefined, string],
): entry is readonly [string, string] {
  return entry[0] !== undefined;
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
function specificity(component: UiComponentMeta): number {
  if (component.category === 'pattern') return 4;
  if (component.category === 'component') return 3;
  if (component.category === 'layout') return 2;
  if (component.category === 'foundation') return 1;
  return 0;
}

/*** Convert a matched component subtree to the canonical Contracts UiNode shape. */
function toUiNode(node: MatchedNode, screenId: string): UiNode {
  const children = node.children.map((child) => toUiNode(child, screenId));
  return {
    id: `${screenId}-${node.visual.id}`,
    type: node.component.name,
    ...(node.props ? { props: { ...node.props } } : {}),
    ...(children.length > 0 ? { children } : {}),
  };
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
