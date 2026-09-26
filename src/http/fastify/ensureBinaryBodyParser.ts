import type { FastifyInstance } from 'fastify';

/*** Register an octet-stream Buffer parser once on a Fastify instance. */
export function ensureBinaryBodyParser(fastify: FastifyInstance): void {
  if (fastify.hasContentTypeParser('application/octet-stream')) return;
  fastify.addContentTypeParser(
    'application/octet-stream',
    { parseAs: 'buffer' },
    (_request, body, done) => done(null, body),
  );
}
