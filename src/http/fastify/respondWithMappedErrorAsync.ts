import type { FastifyReply } from 'fastify';

/*** Execute a Fastify route operation and map a thrown value to an HTTP response. */
export async function respondWithMappedErrorAsync(
  reply: FastifyReply,
  operation: () => Promise<unknown>,
  status: number,
  mapError: (error: unknown) => unknown,
): Promise<unknown> {
  try {
    return await operation();
  } catch (error) {
    return reply.status(status).send(mapError(error));
  }
}
