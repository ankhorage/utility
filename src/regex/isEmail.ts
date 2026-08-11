const LOCAL_PART_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/u;
const DOMAIN_LABEL_PATTERN = /^[A-Za-z0-9-]+$/u;

export function isEmail(value: string): boolean {
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > 254) return false;

  const atIndex = normalized.indexOf('@');
  if (atIndex <= 0 || atIndex !== normalized.lastIndexOf('@')) return false;

  const localPart = normalized.slice(0, atIndex);
  const domainPart = normalized.slice(atIndex + 1);
  if (localPart.length > 64 || domainPart.length === 0) return false;
  if (!LOCAL_PART_PATTERN.test(localPart)) return false;

  const hasInvalidDomainShape =
    domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.includes('..');
  if (hasInvalidDomainShape) return false;

  const labels = domainPart.split('.');
  if (labels.length < 2 || labels.some(isInvalidDomainLabel)) return false;

  return (labels.at(-1) ?? '').length >= 2;
}

function isInvalidDomainLabel(label: string): boolean {
  return (
    label.length === 0 ||
    label.length > 63 ||
    label.startsWith('-') ||
    label.endsWith('-') ||
    !DOMAIN_LABEL_PATTERN.test(label)
  );
}
