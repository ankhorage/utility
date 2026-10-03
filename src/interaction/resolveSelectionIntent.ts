import type { SelectionIntent } from '../selection/types.js';
import type { SelectionInteractionInput } from './types.js';

/*** Translate cross-platform activation state into semantic replace or toggle selection intent. */
export function resolveSelectionIntent(input: SelectionInteractionInput): SelectionIntent {
  if (input.kind === 'touch') return 'toggle';
  return input.modifiers?.metaKey === true || input.modifiers?.ctrlKey === true
    ? 'toggle'
    : 'replace';
}
