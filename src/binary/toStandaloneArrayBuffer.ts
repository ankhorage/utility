/*** Copy a Uint8Array into a standalone ArrayBuffer containing exactly the visible byte range. */
export function toStandaloneArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
