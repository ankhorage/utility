/*** Determine whether an owner-declared prop name represents visible copy rather than an identifier. */
export function isScreenTextContentPropName(name: string): boolean {
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
