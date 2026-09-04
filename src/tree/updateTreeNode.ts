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
  const nextChildren = children.map((child) => updateTreeNode(child, id, update, adapter));
  const changed = nextChildren.some((child, index) => !Object.is(child, children.at(index)));
  return changed ? adapter.withChildren(root, nextChildren) : root;
}
