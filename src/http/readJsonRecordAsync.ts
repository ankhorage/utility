import { isRecord } from '../object/isRecord.js';

/*** Read a request JSON body as a record, returning an empty record for invalid input. */
export async function readJsonRecordAsync(
  request: Request,
): Promise<Readonly<Record<string, unknown>>> {
  try {
    const value: unknown = await request.json();
    return isRecord(value) ? value : {};
  } catch {
    return {};
  }
}
