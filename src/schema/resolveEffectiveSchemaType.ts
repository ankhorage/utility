import { resolveSingleSchemaType } from './resolveSingleSchemaType.js';
import type { EffectiveSchemaType, SchemaShape } from './types.js';

/*** Normalize JSON-schema-like type, format, and structural hints into one effective value type. */
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
  ) return rawType;
  if (!rawType && schema.properties) return 'object';
  if (!rawType && schema.items) return 'array';
  return 'unknown';
}
