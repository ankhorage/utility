import { groupScreenTextObservations } from './groupScreenTextObservations.js';
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
  const unmatched: ScreenImageTextObservation[] = [];

  observations.forEach((observation) => {
    const node = observation.bounds
      ? findSmallestContainingNode(graph.root, observation.bounds)
      : graph.root;
    if (node.id === graph.root.id && observation.bounds) {
      unmatched.push(observation);
      return;
    }
    const values = assignments.get(node.id) ?? [];
    values.push(observation.text.trim());
    assignments.set(node.id, values);
  });

  const evidenceNodes = createTextEvidenceNodes(graph.root, unmatched);
  const root = {
    ...graph.root,
    children: [...graph.root.children, ...evidenceNodes].sort(compareVisualNodes),
  };

  return {
    ...graph,
    root: applyAssignments(root, assignments),
  };
}

/*** Create deterministic visual children for bounded OCR that no detected region contains. */
function createTextEvidenceNodes(
  root: ScreenImageVisualNode,
  observations: readonly ScreenImageTextObservation[],
): readonly ScreenImageVisualNode[] {
  const usedIds = new Set(collectNodeIds(root));
  let nextId = 1;
  return groupScreenTextObservations(observations).map((observation) => {
    while (usedIds.has(formatTextEvidenceId(nextId))) nextId += 1;
    const id = formatTextEvidenceId(nextId);
    usedIds.add(id);
    nextId += 1;
    if (!observation.bounds) {
      throw new Error('Grouped screen text evidence requires bounds.');
    }
    return {
      id,
      bounds: observation.bounds,
      arrangement: 'none',
      repeated: false,
      text: observation.text,
      children: [],
    };
  });
}

/*** Collect existing visual node identifiers before allocating synthetic OCR node IDs. */
function collectNodeIds(node: ScreenImageVisualNode): readonly string[] {
  return [node.id, ...node.children.flatMap((child) => collectNodeIds(child))];
}

/*** Format one stable synthetic OCR evidence node identifier. */
function formatTextEvidenceId(index: number): string {
  return `ocr-${String(index).padStart(3, '0')}`;
}

/*** Apply assigned text immutably to one visual subtree. */
function applyAssignments(
  node: ScreenImageVisualNode,
  assignments: ReadonlyMap<string, readonly string[]>,
): ScreenImageVisualNode {
  const text = [node.text, ...(assignments.get(node.id) ?? [])]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ')
    .trim();
  const children = node.children.map((child) => applyAssignments(child, assignments));
  return text ? { ...node, text, children } : { ...node, children };
}

/*** Compare visual nodes by screen position while preserving stable IDs for exact ties. */
function compareVisualNodes(left: ScreenImageVisualNode, right: ScreenImageVisualNode): number {
  return (
    left.bounds.y - right.bounds.y ||
    left.bounds.x - right.bounds.x ||
    left.id.localeCompare(right.id)
  );
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
