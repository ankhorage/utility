import type { UiComponentMeta, UiComponentPropSchema } from '@ankhorage/contracts';

import { collectScreenVisualTexts } from './collectScreenVisualTexts.js';
import { isScreenTextContentPropName } from './isScreenTextContentPropName.js';
import type { ScreenImageVisualNode } from './types.js';

/*** Consume a repeated visual subtree into one owner-declared structured array prop. */
export function consumeScreenVisualRepeatedProps(
  visual: ScreenImageVisualNode,
  component: UiComponentMeta,
): Readonly<Record<string, unknown>> | undefined {
  if (!visual.repeated || visual.children.length < 2) return undefined;

  const candidate = resolveRepeatedArrayProp(component);
  if (!candidate) return undefined;

  const defaults = component.blueprint?.defaultProps?.[candidate.name];
  if (!Array.isArray(defaults) || defaults.length !== visual.children.length) {
    return undefined;
  }

  const contentKeys = resolveVisibleItemKeys(candidate.schema);
  if (contentKeys.length === 0) return undefined;

  const items = visual.children.map((child, index) =>
    consumeRepeatedItem(defaults[index], collectScreenVisualTexts(child), contentKeys),
  );
  if (items.some((item) => item === undefined)) return undefined;

  return {
    ...(component.blueprint?.defaultProps ?? {}),
    [candidate.name]: items,
  };
}

/*** Resolve one unambiguous owner-declared structured array prop. */
function resolveRepeatedArrayProp(
  component: UiComponentMeta,
): { readonly name: string; readonly schema: UiComponentPropSchema } | undefined {
  const candidates = Object.entries(component.props).filter(
    ([, schema]) => schema.type === 'array' && (schema.itemSchema?.length ?? 0) > 0,
  );
  if (candidates.length !== 1) return undefined;
  const [name, schema] = candidates[0] ?? [];
  return name && schema ? { name, schema } : undefined;
}

/*** Resolve visible string fields from owner-declared array-item metadata. */
function resolveVisibleItemKeys(schema: UiComponentPropSchema): readonly string[] {
  return (schema.itemSchema ?? [])
    .filter(
      (entry) =>
        entry.schema.type === 'string' && isScreenTextContentPropName(entry.key),
    )
    .map((entry) => entry.key);
}

/*** Merge visible repeated text into one serializable owner blueprint item. */
function consumeRepeatedItem(
  defaultItem: unknown,
  texts: readonly string[],
  contentKeys: readonly string[],
): Readonly<Record<string, unknown>> | undefined {
  if (!isRecord(defaultItem) || texts.length === 0 || texts.length > contentKeys.length) {
    return undefined;
  }

  const visible = Object.fromEntries(
    texts
      .map(
        (text, index): readonly [string | undefined, string] => [contentKeys[index], text],
      )
      .filter(hasDefinedKey),
  );
  return { ...defaultItem, ...visible };
}

/*** Narrow an unknown blueprint value to a plain object. */
function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/*** Keep only repeated text entries whose owner metadata key was resolved. */
function hasDefinedKey(
  entry: readonly [string | undefined, string],
): entry is readonly [string, string] {
  return entry[0] !== undefined;
}
