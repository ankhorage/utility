import { findTreeNode } from './findTreeNode.js';
import { treeContainsId } from './treeContainsId.js';
import type { TreeAdapter } from './types.js';

/*** Return whether one id identifies a strict descendant of another node in the tree. */
export function isTreeDescendant<TNode, TId>(
  root: TNode,
  ancestorId: TId,
  descendantId: TId,
  adapter: TreeAdapter<TNode, TId>,
): boolean {
  if (Object.is(ancestorId, descendantId)) return false;
  const ancestor = findTreeNode(root, ancestorId, adapter);
  return ancestor !== undefined && treeContainsId(ancestor, descendantId, adapter);
}
