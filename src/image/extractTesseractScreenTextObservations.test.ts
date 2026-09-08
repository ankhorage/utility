import { expect, test } from 'bun:test';

import { extractTesseractScreenTextObservations } from './extractTesseractScreenTextObservations';

test('prefers line bounds over a broad Tesseract block', () => {
  const observations = extractTesseractScreenTextObservations([
    {
      text: 'First Second Third',
      bbox: { x0: 60, y0: 600, x1: 790, y1: 1260 },
      paragraphs: [
        {
          lines: [
            {
              text: 'First',
              confidence: 96,
              bbox: { x0: 240, y0: 700, x1: 360, y1: 740 },
            },
            { text: 'Second', bbox: { x0: 240, y0: 910, x1: 390, y1: 950 } },
            { text: 'Third', bbox: { x0: 240, y0: 1120, x1: 370, y1: 1160 } },
          ],
        },
      ],
    },
  ]);

  expect(observations).toEqual([
    {
      text: 'First',
      bounds: { x: 240, y: 700, width: 120, height: 40 },
      confidence: 0.96,
    },
    { text: 'Second', bounds: { x: 240, y: 910, width: 150, height: 40 } },
    { text: 'Third', bounds: { x: 240, y: 1120, width: 130, height: 40 } },
  ]);
});

test('falls back to a block observation when no lines are available', () => {
  expect(
    extractTesseractScreenTextObservations([
      {
        text: 'Fallback',
        bbox: { x0: 10, y0: 20, x1: 70, y1: 50 },
        paragraphs: [],
      },
    ]),
  ).toEqual([{ text: 'Fallback', bounds: { x: 10, y: 20, width: 60, height: 30 } }]);
});
