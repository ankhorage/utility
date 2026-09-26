import type { FastifyRequest } from 'fastify';

/*** Read a named string route parameter from a Fastify request. */
export function readFastifyRouteParam(request: FastifyRequest, name: string): string {
  const value = Object.entries(request.params as Readonly<Record<string, unknown>>).find(
    ([key]) => key === name,
  )?.[1];
  if (typeof value !== 'string') throw new Error(`Missing string route parameter: ${name}`);
  return value;
}
