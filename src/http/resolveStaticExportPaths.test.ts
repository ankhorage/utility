import { describe, expect, test } from 'bun:test';

import { resolveStaticExportPaths } from './resolveStaticExportPaths.js';

describe('resolveStaticExportPaths', () => {
  test('resolves the root export', () => {
    expect(resolveStaticExportPaths('/')).toEqual(['index.html']);
  });

  test('keeps direct files unchanged', () => {
    expect(resolveStaticExportPaths('/assets/app.js')).toEqual(['assets/app.js']);
  });

  test('resolves extensionless routes to HTML and directory-index candidates', () => {
    expect(resolveStaticExportPaths('/catalog/items')).toEqual([
      'catalog/items.html',
      'catalog/items/index.html',
    ]);
  });

  test('decodes URL path segments before resolving candidates', () => {
    expect(resolveStaticExportPaths('/catalog/My%20Item')).toEqual([
      'catalog/My Item.html',
      'catalog/My Item/index.html',
    ]);
  });

  test('normalizes surrounding slashes without introducing platform separators', () => {
    expect(resolveStaticExportPaths('///catalog/items///')).toEqual([
      'catalog/items.html',
      'catalog/items/index.html',
    ]);
  });
});
