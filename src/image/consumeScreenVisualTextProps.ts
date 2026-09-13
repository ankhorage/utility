// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import type { UiComponentMeta } from '@ankhorage/contracts';
//
// import { collectScreenVisualTexts } from './collectScreenVisualTexts.js';
// import { isScreenTextContentPropName } from './isScreenTextContentPropName.js';
// import type { ScreenImageVisualNode } from './types.js';
//
// const LARGE_UNTEXTED_LEAF_RATIO = 0.08;
//
// /*** Consume a text-only visual subtree into string props declared by component metadata. */
// export function consumeScreenVisualTextProps(
//   visual: ScreenImageVisualNode,
//   component: UiComponentMeta,
// ): Readonly<Record<string, unknown>> | undefined {
//   const texts = collectScreenVisualTexts(visual);
//   if (texts.length === 0 || hasSubstantialUntextedLeaf(visual)) {
//     return undefined;
//   }
//
//   const propNames = resolveConsumableTextPropNames(component);
//   if (propNames.length < texts.length) {
//     return undefined;
//   }
//
//   return Object.fromEntries(
//     texts.map((text, index) => [propNames.at(index), text] as const).filter(hasDefinedKey),
//   );
// }
//
// /*** Resolve declared string content props in owner-defined authoring order. */
// function resolveConsumableTextPropNames(component: UiComponentMeta): readonly string[] {
//   const i18nNames = component.i18n?.fields.map((field) => field.defaultTextProp) ?? [];
//   const remainingNames = Object.entries(component.props)
//     .filter(([name, schema]) => schema.type === 'string' && isScreenTextContentPropName(name))
//     .map(([name]) => name)
//     .filter((name) => !i18nNames.includes(name));
//   return [...i18nNames, ...remainingNames];
// }
//
// /*** Detect a large geometry leaf that cannot safely be discarded as text-only detail. */
// function hasSubstantialUntextedLeaf(visual: ScreenImageVisualNode): boolean {
//   const parentArea = Math.max(1, visual.bounds.width * visual.bounds.height);
//   return visual.children.some((child) => {
//     if (child.children.length > 0) {
//       return hasSubstantialUntextedLeaf(child);
//     }
//     if (child.text?.trim()) {
//       return false;
//     }
//     const childArea = child.bounds.width * child.bounds.height;
//     return childArea / parentArea >= LARGE_UNTEXTED_LEAF_RATIO;
//   });
// }
//
// /*** Keep only text-to-prop entries whose metadata key was resolved. */
// function hasDefinedKey(
//   entry: readonly [string | undefined, string],
// ): entry is readonly [string, string] {
//   return entry[0] !== undefined;
// }
