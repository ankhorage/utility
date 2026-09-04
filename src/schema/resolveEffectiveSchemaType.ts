import { resolveSingleSchemaType } from './resolveSingleSchemaType.js';
import type { EffectiveSchemaType, SchemaShape } from './types.js';

/*** Normalize JSON-schema-like type, format, and structural hints into one effective value type. */
export function resolveEffectiveSchemaType(schema: SchemaShape): EffectiveSchemaType {
  if (schema.format === 'date' || schema.format === 'date-time') return 'date';
  const rawType = resolveSingleSchemaType(schema.type);
  if (rawType === 'integer') return 'number';
  if (rawType === 'object') return schema.additionalProperties ? 'record' : 'object';
  if (rawType !== undefined) return rawType;
  if (schema.properties !== undefined) return 'object';
  if (schema.items !== undefined) return 'array';
  return 'unknown';
}
