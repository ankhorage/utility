import type {
  ScreenImageTextObservation,
  ScreenImageVisualGraph,
  ScreenImageVisualNode,
} from './types.js';

/*** Attach OCR observations to the smallest visual regions that contain their centers. */
export function applyScreenTextObservations(
  graph: ScreenImageVisualGraph,
  observations: readonly ScreenImageTextObservation[],
): ScreenImageVisualGraph {
  const assignments = new Map<string, string[]>();

  observations.forEach((observation) => {
    const node = observation.bounds
      ? findSmallestContainingNode(graph.root, observation.bounds)
      : graph.root;
    const values = assignments.get(node.id) ?? [];
    values.push(observation.text.trim());
    assignments.set(node.id, values);
  });

  return {
    ...graph,
    root: applyAssignments(graph.root, assignments),
  };
}

/*** Apply assigned text immutably to one visual subtree. */
function applyAssignments(
  node: ScreenImageVisualNode,
  assignments: ReadonlyMap<string, readonly string[]>,
): ScreenImageVisualNode {
  const text = assignments.get(node.id)?.filter(Boolean).join(' ').trim();
  const children = node.children.map((child) => applyAssignments(child, assignments));
  return text ? { ...node, text, children } : { ...node, children };
}

/*** Find the smallest node containing the center point of an OCR observation. */
function findSmallestContainingNode(
  node: ScreenImageVisualNode,
  bounds: NonNullable<ScreenImageTextObservation['bounds']>,
): ScreenImageVisualNode {
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  const child = node.children.find((candidate) => containsPoint(candidate, x, y));
  return child ? findSmallestContainingNode(child, bounds) : node;
}

/*** Determine whether a visual node contains a point. */
function containsPoint(node: ScreenImageVisualNode, x: number, y: number): boolean {
  return (
    x >= node.bounds.x &&
    y >= node.bounds.y &&
    x <= node.bounds.x + node.bounds.width &&
    y <= node.bounds.y + node.bounds.height
  );
}
