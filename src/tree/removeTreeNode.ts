import { removeTreeNodeWithValue } from './removeTreeNodeWithValue.js';
import type { TreeAdapter } from './types.js';

/*** Immutably remove a node by id, returning undefined when the root itself is removed. */
export function removeTreeNode<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): TNode | undefined {
  return removeTreeNodeWithValue(root, id, adapter).root;
}
