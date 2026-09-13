// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import { expect, test } from 'bun:test';
// import sharp from 'sharp';
//
// import { recoverScreenRegionTextObservationsAsync } from './recoverScreenRegionTextObservationsAsync';
// import type { ScreenImageVisualGraph } from './types';
//
// const graph: ScreenImageVisualGraph = {
//   width: 120,
//   height: 100,
//   root: {
//     id: 'screen',
//     bounds: { x: 0, y: 0, width: 120, height: 100 },
//     arrangement: 'none',
//     repeated: false,
//     children: [
//       {
//         id: 'region-001',
//         bounds: { x: 10, y: 20, width: 50, height: 20 },
//         arrangement: 'none',
//         repeated: false,
//         children: [],
//       },
//     ],
//   },
// };
//
// const nestedGraph: ScreenImageVisualGraph = {
//   ...graph,
//   root: {
//     ...graph.root,
//     text: 'Unbounded screen evidence',
//     children: [
//       {
//         id: 'region-001',
//         bounds: { x: 10, y: 10, width: 45, height: 35 },
//         arrangement: 'none',
//         repeated: false,
//         children: [
//           {
//             id: 'region-002',
//             bounds: { x: 15, y: 15, width: 30, height: 15 },
//             arrangement: 'none',
//             repeated: false,
//             text: 'Existing evidence',
//             children: [],
//           },
//           {
//             id: 'region-004',
//             bounds: { x: 12, y: 12, width: 40, height: 30 },
//             arrangement: 'none',
//             repeated: false,
//             children: [],
//           },
//         ],
//       },
//       {
//         id: 'region-003',
//         bounds: { x: 65, y: 20, width: 40, height: 20 },
//         arrangement: 'none',
//         repeated: false,
//         children: [],
//       },
//     ],
//   },
// };
//
// /*** Create a deterministic image fixture for crop preprocessing assertions. */
// async function createFixtureAsync(): Promise<Uint8Array> {
//   return Uint8Array.from(
//     await sharp({
//       create: {
//         width: graph.width,
//         height: graph.height,
//         channels: 4,
//         background: '#ffffff',
//       },
//     })
//       .png()
//       .toBuffer(),
//   );
// }
//
// test('preprocesses a region and translates crop-local OCR bounds to screen coordinates', async () => {
//   const image = await createFixtureAsync();
//   let receivedSize: { readonly width?: number; readonly height?: number } = {};
//   const result = await recoverScreenRegionTextObservationsAsync({
//     image,
//     graph,
//     ocr: {
//       recognizeAsync: async (crop, request) => {
//         receivedSize = await sharp(Buffer.from(crop)).metadata();
//         expect(request).toEqual({ scope: 'region' });
//         return [
//           {
//             text: 'Start assessment',
//             bounds: { x: 20, y: 10, width: 60, height: 20 },
//             confidence: 0.96,
//           },
//         ];
//       },
//     },
//   });
//
//   expect(receivedSize).toMatchObject({ width: 100, height: 40 });
//   expect(result.observations).toEqual([
//     {
//       text: 'Start assessment',
//       bounds: { x: 20, y: 25, width: 30, height: 10 },
//       confidence: 0.96,
//     },
//   ]);
//   expect(result.diagnostics).toEqual([]);
// });
//
// test('keeps low-confidence region OCR unresolved', async () => {
//   const result = await recoverScreenRegionTextObservationsAsync({
//     image: await createFixtureAsync(),
//     graph,
//     ocr: {
//       recognizeAsync: () => Promise.resolve([{ text: 'Unreliable', confidence: 0.35 }]),
//     },
//   });
//
//   expect(result.observations).toEqual([]);
// });
//
// test('skips a text-bearing subtree while probing an independent textless sibling', async () => {
//   const receivedSizes: { readonly width?: number; readonly height?: number }[] = [];
//
//   await recoverScreenRegionTextObservationsAsync({
//     image: await createFixtureAsync(),
//     graph: nestedGraph,
//     ocr: {
//       recognizeAsync: async (crop) => {
//         const { width, height } = await sharp(Buffer.from(crop)).metadata();
//         receivedSizes.push({ width, height });
//         return [];
//       },
//     },
//   });
//
//   expect(receivedSizes).toEqual([{ width: 80, height: 40 }]);
// });
//
// test('reports region OCR failure without discarding geometry', async () => {
//   const result = await recoverScreenRegionTextObservationsAsync({
//     image: await createFixtureAsync(),
//     graph,
//     ocr: {
//       recognizeAsync: () => Promise.reject(new Error('fixture region failure')),
//     },
//   });
//
//   expect(result.observations).toEqual([]);
//   expect(result.diagnostics).toEqual([
//     {
//       kind: 'ocr',
//       nodeId: 'region-001',
//       message: 'Region OCR evidence was unavailable for region-001: fixture region failure',
//     },
//   ]);
//   expect(graph.root.children).toHaveLength(1);
// });
