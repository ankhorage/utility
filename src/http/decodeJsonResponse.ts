/*** Decode a response body as JSON and attach response context to invalid-JSON failures. */
export async function decodeJsonResponse(
  response: Response,
  label = 'HTTP response',
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} returned invalid JSON (HTTP ${response.status}).`);
  }
}
