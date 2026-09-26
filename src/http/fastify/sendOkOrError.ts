import type { FastifyReply } from 'fastify';

/*** Return an `ok` result or send a failed result with a caller-selected HTTP status. */
export function sendOkOrError<TResult extends { readonly ok: boolean }>(
  reply: FastifyReply,
  result: TResult,
  failureStatus: number,
): TResult | FastifyReply {
  return result.ok ? result : reply.status(failureStatus).send(result);
}
