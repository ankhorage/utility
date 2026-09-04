import type { TreeCloneAdapter } from './types.js';

/*** Deep-clone a tree while assigning a fresh id to every cloned node. */
export function cloneTreeWithNewIds<TNode, TId>(
  root: TNode,
  createId: (node: TNode) => TId,
  adapter: TreeCloneAdapter<TNode, TId>,
): TNode {
  const clonedChildren = (adapter.getChildren(root) ?? []).map((child) =>
    cloneTreeWithNewIds(child, createId, adapter),
  );
  const withId = adapter.withId(root, createId(root));
  return adapter.withChildren(withId, clonedChildren);
}
