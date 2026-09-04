import type { TreeAdapter, TreeRemovalResult } from './types.js';

/*** Immutably remove a node by id and return both the next tree and removed node. */
export function removeTreeNodeWithValue<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): TreeRemovalResult<TNode> {
  if (Object.is(adapter.getId(root), id)) return { root: undefined, removed: root };
  const children = adapter.getChildren(root);
  if (children === undefined || children.length === 0) return { root, removed: undefined };
  for (const [index, child] of children.entries()) {
    const result = removeTreeNodeWithValue(child, id, adapter);
    if (result.removed === undefined) continue;
    const nextChildren = [...children];
    if (result.root === undefined) nextChildren.splice(index, 1);
    else nextChildren[index] = result.root;
    return { root: adapter.withChildren(root, nextChildren), removed: result.removed };
  }
  return { root, removed: undefined };
}
