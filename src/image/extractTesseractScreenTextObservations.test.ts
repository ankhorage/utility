// Disabled: image analysis does not belong in @ankhorage/utility.
// The entire capability must move to a separate repository.
// Preserved as comments at the maintainer's request until that move.
// Utility must not depend on @ankhorage/contracts.

// import { expect, test } from 'bun:test';
//
// import { extractTesseractScreenTextObservations } from './extractTesseractScreenTextObservations';
//
// test('prefers line bounds over a broad Tesseract block', () => {
//   const observations = extractTesseractScreenTextObservations([
//     {
//       text: 'First Second Third',
//       bbox: { x0: 60, y0: 600, x1: 790, y1: 1260 },
//       paragraphs: [
//         {
//           lines: [
//             {
//               text: 'First',
//               confidence: 96,
//               bbox: { x0: 240, y0: 700, x1: 360, y1: 740 },
//             },
//             { text: 'Second', bbox: { x0: 240, y0: 910, x1: 390, y1: 950 } },
//             { text: 'Third', bbox: { x0: 240, y0: 1120, x1: 370, y1: 1160 } },
//           ],
//         },
//       ],
//     },
//   ]);
//
//   expect(observations).toEqual([
//     {
//       text: 'First',
//       bounds: { x: 240, y: 700, width: 120, height: 40 },
//       confidence: 0.96,
//     },
//     { text: 'Second', bounds: { x: 240, y: 910, width: 150, height: 40 } },
//     { text: 'Third', bounds: { x: 240, y: 1120, width: 130, height: 40 } },
//   ]);
// });
//
// test('falls back to a block observation when no lines are available', () => {
//   expect(
//     extractTesseractScreenTextObservations([
//       {
//         text: 'Fallback',
//         bbox: { x0: 10, y0: 20, x1: 70, y1: 50 },
//         paragraphs: [],
//       },
//     ]),
//   ).toEqual([{ text: 'Fallback', bounds: { x: 10, y: 20, width: 60, height: 30 } }]);
// });
//
// test('excludes short uncertain oversized glyphs from reliable line words', () => {
//   const observations = extractTesseractScreenTextObservations([
//     {
//       text: '@) Learning the ranges v',
//       bbox: { x0: 108, y0: 904, x1: 755, y1: 1003 },
//       confidence: 78,
//       paragraphs: [
//         {
//           lines: [
//             {
//               text: '@) Learning the ranges v',
//               bbox: { x0: 108, y0: 904, x1: 755, y1: 1003 },
//               confidence: 78,
//               words: [
//                 { text: '@)', confidence: 30, bbox: { x0: 108, y0: 904, x1: 203, y1: 1003 } },
//                 {
//                   text: 'Learning',
//                   confidence: 96,
//                   bbox: { x0: 245, y0: 940, x1: 392, y1: 978 },
//                 },
//                 { text: 'the', confidence: 97, bbox: { x0: 403, y0: 940, x1: 460, y1: 970 } },
//                 {
//                   text: 'ranges',
//                   confidence: 96,
//                   bbox: { x0: 472, y0: 948, x1: 588, y1: 978 },
//                 },
//                 { text: 'v', confidence: 72, bbox: { x0: 697, y0: 924, x1: 755, y1: 983 } },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   ]);
//
//   expect(observations).toHaveLength(1);
//   expect(observations[0]).toMatchObject({
//     text: 'Learning the ranges',
//     bounds: { x: 245, y: 940, width: 343, height: 38 },
//   });
//   expect(observations[0]?.confidence).toBeCloseTo(0.9633, 4);
// });
//
// test('preserves uncertain words with ordinary line geometry', () => {
//   expect(
//     extractTesseractScreenTextObservations([
//       {
//         text: 'Go forward',
//         bbox: { x0: 10, y0: 20, x1: 160, y1: 50 },
//         paragraphs: [
//           {
//             lines: [
//               {
//                 text: 'Go forward',
//                 bbox: { x0: 10, y0: 20, x1: 160, y1: 50 },
//                 confidence: 70,
//                 words: [
//                   { text: 'Go', confidence: 55, bbox: { x0: 10, y0: 20, x1: 45, y1: 50 } },
//                   {
//                     text: 'forward',
//                     confidence: 95,
//                     bbox: { x0: 55, y0: 20, x1: 160, y1: 50 },
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     ]),
//   ).toEqual([
//     {
//       text: 'Go forward',
//       bounds: { x: 10, y: 20, width: 150, height: 30 },
//       confidence: 0.7,
//     },
//   ]);
// });
//
// test('preserves lines without reliable comparison words', () => {
//   expect(
//     extractTesseractScreenTextObservations([
//       {
//         text: 'W sharkprey',
//         bbox: { x0: 68, y0: 106, x1: 409, y1: 218 },
//         paragraphs: [
//           {
//             lines: [
//               {
//                 text: 'W sharkprey',
//                 bbox: { x0: 68, y0: 106, x1: 409, y1: 218 },
//                 confidence: 25,
//                 words: [
//                   { text: 'W', confidence: 42, bbox: { x0: 68, y0: 110, x1: 130, y1: 203 } },
//                   {
//                     text: 'sharkprey',
//                     confidence: 8,
//                     bbox: { x0: 176, y0: 106, x1: 409, y1: 218 },
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     ]),
//   ).toEqual([
//     {
//       text: 'W sharkprey',
//       bounds: { x: 68, y: 106, width: 341, height: 112 },
//       confidence: 0.25,
//     },
//   ]);
// });
