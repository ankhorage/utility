import { findTreeNode } from './findTreeNode.js';
import type { TreeAdapter } from './types.js';

/*** Return whether a tree contains a node with the supplied id. */
export function treeContainsId<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): boolean {
  return findTreeNode(root, id, adapter) !== undefined;
}
