// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// /*** Determine whether an owner-declared prop name represents visible copy rather than an identifier. */
// export function isScreenTextContentPropName(name: string): boolean {
//   const normalized = name.toLowerCase();
//   return [
//     'body',
//     'brand',
//     'caption',
//     'description',
//     'eyebrow',
//     'label',
//     'message',
//     'name',
//     'price',
//     'subtitle',
//     'text',
//     'title',
//     'vendor',
//   ].some((token) => normalized.includes(token));
// }
