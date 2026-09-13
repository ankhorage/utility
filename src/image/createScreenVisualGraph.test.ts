// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import { describe, expect, test } from 'bun:test';
//
// import { createScreenVisualGraph } from './createScreenVisualGraph';
//
// const verticalRegions = [
//   { x: 20, y: 20, width: 80, height: 30 },
//   { x: 20, y: 70, width: 80, height: 30 },
//   { x: 20, y: 120, width: 80, height: 30 },
// ] as const;
//
// const horizontalRegions = [
//   { x: 20, y: 20, width: 40, height: 40 },
//   { x: 80, y: 20, width: 40, height: 40 },
//   { x: 140, y: 20, width: 40, height: 40 },
// ] as const;
//
// const gridRegions = [
//   { x: 20, y: 20, width: 40, height: 40 },
//   { x: 80, y: 20, width: 40, height: 40 },
//   { x: 20, y: 80, width: 40, height: 40 },
//   { x: 80, y: 80, width: 40, height: 40 },
// ] as const;
//
// describe('createScreenVisualGraph', () => {
//   test('infers vertical stacks and repeated geometry', () => {
//     const graph = createScreenVisualGraph(verticalRegions, 200, 200);
//
//     expect(graph.root.arrangement).toBe('vertical');
//     expect(graph.root.repeated).toBe(true);
//   });
//
//   test('infers horizontal repeated regions', () => {
//     const graph = createScreenVisualGraph(horizontalRegions, 200, 100);
//
//     expect(graph.root.arrangement).toBe('horizontal');
//     expect(graph.root.repeated).toBe(true);
//   });
//
//   test('infers a grid from repeated two-dimensional regions', () => {
//     const graph = createScreenVisualGraph(gridRegions, 200, 200);
//
//     expect(graph.root.arrangement).toBe('grid');
//     expect(graph.root.repeated).toBe(true);
//   });
//
//   test('derives containment as parent-child structure', () => {
//     const graph = createScreenVisualGraph(
//       [
//         { x: 10, y: 10, width: 180, height: 180 },
//         { x: 30, y: 30, width: 60, height: 60 },
//       ],
//       200,
//       200,
//     );
//
//     expect(graph.root.children).toHaveLength(1);
//     expect(graph.root.children[0]?.children).toHaveLength(1);
//   });
//
//   test('keeps region IDs and order deterministic for unsorted input', () => {
//     const forward = createScreenVisualGraph(verticalRegions, 200, 200);
//     const reverse = createScreenVisualGraph([...verticalRegions].reverse(), 200, 200);
//
//     expect(reverse).toEqual(forward);
//     expect(forward.root.children.map((child) => child.id)).toEqual([
//       'region-001',
//       'region-002',
//       'region-003',
//     ]);
//   });
// });
