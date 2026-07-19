import { EMAIL_PATTERN, URL_PATTERN } from './patterns.js';

export { EMAIL_PATTERN, URL_PATTERN };

export function isEmailLike(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function isUrlLike(value: string): boolean {
  return URL_PATTERN.test(value);
}
