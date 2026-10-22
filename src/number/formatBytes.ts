const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/*** Formats a byte count with binary units and at most one fractional digit. */
export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B';

  const resolvedUnitIndex = resolveByteUnitIndex(value);
  const size = value / 1024 ** resolvedUnitIndex;
  const rounded = resolvedUnitIndex === 0 ? Math.round(size) : Math.round(size * 10) / 10;
  const unit = BYTE_UNITS.at(resolvedUnitIndex) ?? 'B';

  return `${rounded} ${unit}`;
}

/*** Resolves the largest supported binary unit for a positive byte count. */
function resolveByteUnitIndex(value: number): number {
  return Math.min(Math.floor(Math.log(value) / Math.log(1024)), BYTE_UNITS.length - 1);
}
