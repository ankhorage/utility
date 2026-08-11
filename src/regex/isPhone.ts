const PHONE_CHARACTER_PATTERN = /^[+()\d\s.-]+$/u;

export function isPhone(value: string): boolean {
  const normalized = value.trim();
  if (normalized.length === 0 || !PHONE_CHARACTER_PATTERN.test(normalized)) return false;

  const digitCount = (normalized.match(/\d/gu) ?? []).length;
  if (digitCount < 7 || digitCount > 15) return false;

  const plusCount = (normalized.match(/\+/gu) ?? []).length;
  if (plusCount > 1 || (plusCount === 1 && !normalized.startsWith('+'))) return false;

  return hasBalancedParentheses(normalized);
}

function hasBalancedParentheses(value: string): boolean {
  let depth = 0;
  for (const character of value) {
    if (character === '(') {
      if (depth !== 0) return false;
      depth = 1;
    } else if (character === ')') {
      if (depth !== 1) return false;
      depth = 0;
    }
  }
  return depth === 0;
}
