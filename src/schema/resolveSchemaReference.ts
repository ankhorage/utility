import type { SchemaReferenceLike } from './types.js';

/*** Resolve a reference recursively through a keyed schema registry while preventing reference cycles. */
export function resolveSchemaReference<TSchema extends SchemaReferenceLike>(
  schema: TSchema | undefined,
  schemas: Readonly<Record<string, TSchema>> | undefined,
  seen: ReadonlySet<string> = new Set(),
): TSchema | undefined {
  const refId = schema?.ref?.id;
  if (!refId || !schemas || seen.has(refId) || !Object.hasOwn(schemas, refId)) return schema;
  const referenced = schemas[refId];
  return referenced
    ? resolveSchemaReference(referenced, schemas, new Set([...seen, refId]))
    : schema;
}
