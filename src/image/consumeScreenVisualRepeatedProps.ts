// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import type { UiComponentMeta, UiComponentPropSchema } from '@ankhorage/contracts';
//
// import { collectScreenVisualTexts } from './collectScreenVisualTexts.js';
// import { isScreenTextContentPropName } from './isScreenTextContentPropName.js';
// import type { ScreenImageVisualNode } from './types.js';
//
// /*** Consume a repeated visual subtree into one owner-declared structured array prop. */
// export function consumeScreenVisualRepeatedProps(
//   visual: ScreenImageVisualNode,
//   component: UiComponentMeta,
// ): Readonly<Record<string, unknown>> | undefined {
//   if (!visual.repeated || visual.children.length < 2) return undefined;
//
//   const candidate = resolveRepeatedArrayProp(component);
//   if (!candidate) return undefined;
//
//   const defaults = component.blueprint?.defaultProps?.[candidate.name];
//   if (!Array.isArray(defaults) || defaults.length !== visual.children.length) {
//     return undefined;
//   }
//
//   const contentKeys = resolveVisibleItemKeys(candidate.schema);
//   if (contentKeys.length === 0) return undefined;
//
//   const items = visual.children.map((child, index) =>
//     consumeRepeatedItem(
//       defaults.at(index),
//       collectScreenVisualTexts(child),
//       contentKeys,
//       candidate.schema,
//     ),
//   );
//   if (items.some((item) => item === undefined)) return undefined;
//
//   return {
//     ...resolveCanonicalStateDefaults(component, candidate.name),
//     ...inferRepeatedVisualEnumProps(visual, component),
//     [candidate.name]: items,
//   };
// }
//
// /*** Resolve one unambiguous owner-declared structured array prop. */
// function resolveRepeatedArrayProp(
//   component: UiComponentMeta,
// ): { readonly name: string; readonly schema: UiComponentPropSchema } | undefined {
//   const candidates = Object.entries(component.props).filter(
//     ([, schema]) => schema.type === 'array' && (schema.itemSchema?.length ?? 0) > 0,
//   );
//   if (candidates.length !== 1) return undefined;
//   const [name, schema] = candidates[0] ?? [];
//   return name && schema ? { name, schema } : undefined;
// }
//
// /*** Resolve visible string fields from owner-declared array-item metadata. */
// function resolveVisibleItemKeys(schema: UiComponentPropSchema): readonly string[] {
//   return (schema.itemSchema ?? [])
//     .filter((entry) => entry.schema.type === 'string' && isScreenTextContentPropName(entry.key))
//     .map((entry) => entry.key);
// }
//
// /*** Merge visible repeated text into one serializable owner blueprint item. */
// function consumeRepeatedItem(
//   defaultItem: unknown,
//   texts: readonly string[],
//   contentKeys: readonly string[],
//   schema: UiComponentPropSchema,
// ): Readonly<Record<string, unknown>> | undefined {
//   if (!isRecord(defaultItem) || texts.length === 0 || texts.length > contentKeys.length) {
//     return undefined;
//   }
//
//   const scaffold = resolveRepeatedItemScaffold(defaultItem, schema);
//   const visible = Object.fromEntries(
//     texts
//       .map((text, index): readonly [string | undefined, string] => [contentKeys.at(index), text])
//       .filter(hasDefinedKey),
//   );
//   return { ...scaffold, ...visible };
// }
//
// /*** Preserve only declared item identities and canonical state defaults from blueprint structure. */
// function resolveRepeatedItemScaffold(
//   defaultItem: Readonly<Record<string, unknown>>,
//   schema: UiComponentPropSchema,
// ): Readonly<Record<string, unknown>> {
//   return Object.fromEntries(
//     (schema.itemSchema ?? []).flatMap((entry) => {
//       if (isRepeatedItemIdentityKey(entry.key) && Object.hasOwn(defaultItem, entry.key)) {
//         return [[entry.key, defaultItem[entry.key]] as const];
//       }
//       return isCanonicalStateDefault(entry.schema)
//         ? ([[entry.key, entry.schema.default]] as const)
//         : [];
//     }),
//   );
// }
//
// /*** Preserve explicit schema defaults only when they describe canonical runtime state. */
// function resolveCanonicalStateDefaults(
//   component: UiComponentMeta,
//   repeatedPropName: string,
// ): Readonly<Record<string, unknown>> {
//   return Object.fromEntries(
//     Object.entries(component.props).flatMap(([name, schema]) =>
//       name !== repeatedPropName && isCanonicalStateDefault(schema)
//         ? ([[name, schema.default]] as const)
//         : [],
//     ),
//   );
// }
//
// /*** Infer owner-declared enum props only when repeated visual geometry supports their values. */
// function inferRepeatedVisualEnumProps(
//   visual: ScreenImageVisualNode,
//   component: UiComponentMeta,
// ): Readonly<Record<string, unknown>> {
//   return Object.fromEntries(
//     Object.entries(component.props).flatMap(([name, schema]) => {
//       if (schema.type !== 'enum') return [];
//       const arrangement = findStringEnumValue(schema, visual.arrangement);
//       if (arrangement && visual.arrangement !== 'none') {
//         return [[name, arrangement] as const];
//       }
//       const card = hasRepeatedContainerGeometry(visual)
//         ? findStringEnumValue(schema, 'card')
//         : undefined;
//       return card ? [[name, card] as const] : [];
//     }),
//   );
// }
//
// /*** Find one owner-declared string enum value by normalized text. */
// function findStringEnumValue(schema: UiComponentPropSchema, expected: string): string | undefined {
//   return schema.enum?.find(
//     (value): value is string =>
//       typeof value === 'string' && value.toLowerCase() === expected.toLowerCase(),
//   );
// }
//
// /*** Detect repeated container regions whose nested geometry supports a card presentation. */
// function hasRepeatedContainerGeometry(visual: ScreenImageVisualNode): boolean {
//   if (visual.arrangement === 'none' || visual.children.length < 2) return false;
//   return visual.children.every(
//     (child) => child.children.length > 0 && fillsRepeatedCrossAxis(child, visual),
//   );
// }
//
// /*** Require each repeated container to occupy most of the group's cross axis. */
// function fillsRepeatedCrossAxis(
//   child: ScreenImageVisualNode,
//   group: ScreenImageVisualNode,
// ): boolean {
//   if (group.arrangement === 'horizontal') {
//     return child.bounds.height / Math.max(1, group.bounds.height) >= 0.65;
//   }
//   if (group.arrangement === 'vertical') {
//     return child.bounds.width / Math.max(1, group.bounds.width) >= 0.65;
//   }
//   const childArea = child.bounds.width * child.bounds.height;
//   const groupArea = Math.max(1, group.bounds.width * group.bounds.height);
//   return childArea / groupArea >= 0.05;
// }
//
// /*** Identify stable non-visible fields that may scaffold one repeated item. */
// function isRepeatedItemIdentityKey(name: string): boolean {
//   const normalized = name.trim();
//   const lower = normalized.toLowerCase();
//   return (
//     lower === 'id' ||
//     lower === 'key' ||
//     lower === 'slug' ||
//     lower === 'value' ||
//     normalized.endsWith('Id') ||
//     normalized.endsWith('ID')
//   );
// }
//
// /*** Detect an explicit schema default classified as canonical runtime state. */
// function isCanonicalStateDefault(schema: UiComponentPropSchema): boolean {
//   return schema.category.toLowerCase() === 'state' && schema.default !== undefined;
// }
//
// /*** Narrow an unknown blueprint value to a plain object. */
// function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
//   return typeof value === 'object' && value !== null && !Array.isArray(value);
// }
//
// /*** Keep only repeated text entries whose owner metadata key was resolved. */
// function hasDefinedKey(
//   entry: readonly [string | undefined, string],
// ): entry is readonly [string, string] {
//   return entry[0] !== undefined;
// }
