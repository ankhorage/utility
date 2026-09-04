export interface SchemaReferenceLike {
  readonly ref?: { readonly id: string };
}

export type SchemaPrimitiveType = 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';

export interface SchemaShape extends SchemaReferenceLike {
  readonly additionalProperties?: unknown;
  readonly format?: string;
  readonly items?: unknown;
  readonly properties?: Readonly<Record<string, unknown>>;
  readonly type?: SchemaPrimitiveType | readonly SchemaPrimitiveType[];
}

export type EffectiveSchemaType =
  | 'array'
  | 'boolean'
  | 'date'
  | 'number'
  | 'object'
  | 'record'
  | 'string'
  | 'unknown';

/***
 * Resolve a reference recursively through a keyed schema registry while preventing reference cycles.
 */
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

/***
 * Return a declared schema type only when the declaration contains exactly one primitive type.
 */
export function resolveSingleSchemaType<TType extends string>(
  type: TType | readonly TType[] | undefined,
): TType | undefined {
  if (typeof type === 'string') return type;
  return type?.length === 1 ? type[0] : undefined;
}

/***
 * Normalize JSON-schema-like type, format, and structural hints into one effective value type.
 */
export function resolveEffectiveSchemaType(schema: SchemaShape): EffectiveSchemaType {
  if (schema.format === 'date' || schema.format === 'date-time') return 'date';
  const rawType = resolveSingleSchemaType(schema.type);
  if (rawType === 'integer') return 'number';
  if (rawType === 'object') return schema.additionalProperties ? 'record' : 'object';
  if (
    rawType === 'array' ||
    rawType === 'boolean' ||
    rawType === 'number' ||
    rawType === 'string'
  ) {
    return rawType;
  }
  if (!rawType && schema.properties) return 'object';
  if (!rawType && schema.items) return 'array';
  return 'unknown';
}
