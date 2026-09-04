import type { TreeAdapter } from './types.js';

/*** Immutably update one tree node while preserving unchanged branches by reference. */
export function updateTreeNode<TNode, TId>(
  root: TNode,
  id: TId,
  update: (node: TNode) => TNode,
  adapter: TreeAdapter<TNode, TId>,
): TNode {
  if (Object.is(adapter.getId(root), id)) return update(root);
  const children = adapter.getChildren(root);
  if (children === undefined || children.length === 0) return root;
  let changed = false;
  const nextChildren = children.map((child) => {
    const nextChild = updateTreeNode(child, id, update, adapter);
    if (!Object.is(nextChild, child)) changed = true;
    return nextChild;
  });
  return changed ? adapter.withChildren(root, nextChildren) : root;
}
