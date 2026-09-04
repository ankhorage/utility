import type { TreeAdapter } from './types.js';

/*** Find the first tree node with a matching id using depth-first traversal. */
export function findTreeNode<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): TNode | undefined {
  if (Object.is(adapter.getId(root), id)) return root;
  for (const child of adapter.getChildren(root) ?? []) {
    const found = findTreeNode(child, id, adapter);
    if (found !== undefined) return found;
  }
  return undefined;
}
