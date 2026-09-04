import type { TreeAdapter, TreeNodeLocation } from './types.js';

/*** Find a tree node together with its parent and sibling index. */
export function findTreeNodeWithParent<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): TreeNodeLocation<TNode> | undefined {
  if (Object.is(adapter.getId(root), id)) return { node: root, parent: null, index: -1 };
  const children = adapter.getChildren(root) ?? [];
  for (const [index, child] of children.entries()) {
    if (Object.is(adapter.getId(child), id)) return { node: child, parent: root, index };
    const found = findTreeNodeWithParent(child, id, adapter);
    if (found !== undefined) return found;
  }
  return undefined;
}
