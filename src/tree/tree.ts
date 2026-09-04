export interface TreeAdapter<TNode, TId = string> {
  readonly getId: (node: TNode) => TId;
  readonly getChildren: (node: TNode) => readonly TNode[] | undefined;
  readonly withChildren: (node: TNode, children: readonly TNode[]) => TNode;
}

export interface TreeCloneAdapter<TNode, TId = string> extends TreeAdapter<TNode, TId> {
  readonly withId: (node: TNode, id: TId) => TNode;
}

export interface TreeNodeLocation<TNode> {
  readonly node: TNode;
  readonly parent: TNode | null;
  readonly index: number;
}

export interface TreeRemovalResult<TNode> {
  readonly root: TNode | undefined;
  readonly removed: TNode | undefined;
}

export interface TreeInsertionResult<TNode> {
  readonly root: TNode;
  readonly inserted: boolean;
}

/***
 * Find the first tree node with a matching id using depth-first traversal.
 */
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

/***
 * Return whether a tree contains a node with the supplied id.
 */
export function treeContainsId<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): boolean {
  return findTreeNode(root, id, adapter) !== undefined;
}

/***
 * Find a tree node together with its parent and sibling index.
 */
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

/***
 * Return whether one id identifies a strict descendant of another node in the tree.
 */
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

/***
 * Immutably update one tree node while preserving unchanged branches by reference.
 */
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

/***
 * Immutably remove a node by id, returning undefined when the root itself is removed.
 */
export function removeTreeNode<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): TNode | undefined {
  return removeTreeNodeWithValue(root, id, adapter).root;
}

/***
 * Immutably remove a node by id and return both the next tree and removed node.
 */
export function removeTreeNodeWithValue<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): TreeRemovalResult<TNode> {
  if (Object.is(adapter.getId(root), id)) return { root: undefined, removed: root };
  return removeTreeNodeFromChildren(root, id, adapter);
}

/***
 * Remove a matching descendant from one node's child tree while preserving unaffected branches.
 */
function removeTreeNodeFromChildren<TNode, TId>(
  root: TNode,
  id: TId,
  adapter: TreeAdapter<TNode, TId>,
): TreeRemovalResult<TNode> {
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

/***
 * Immutably insert a child at a bounded index under a matching parent id.
 */
export function insertTreeChildAtIndex<TNode, TId>(
  root: TNode,
  parentId: TId,
  child: TNode,
  index: number,
  adapter: TreeAdapter<TNode, TId>,
): TreeInsertionResult<TNode> {
  if (Object.is(adapter.getId(root), parentId)) {
    const children = [...(adapter.getChildren(root) ?? [])];
    const targetIndex = Math.max(0, Math.min(index, children.length));
    children.splice(targetIndex, 0, child);
    return { root: adapter.withChildren(root, children), inserted: true };
  }

  const children = adapter.getChildren(root);
  if (children === undefined || children.length === 0) return { root, inserted: false };

  for (const [childIndex, currentChild] of children.entries()) {
    const result = insertTreeChildAtIndex(currentChild, parentId, child, index, adapter);
    if (!result.inserted) continue;
    const nextChildren = [...children];
    nextChildren[childIndex] = result.root;
    return { root: adapter.withChildren(root, nextChildren), inserted: true };
  }

  return { root, inserted: false };
}

/***
 * Deep-clone a tree while assigning a fresh id to every cloned node.
 */
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
