import { describe, expect, test } from 'bun:test';

import { quoteJavaScriptString, serializeJavaScriptLiteral } from './index.js';

describe('JavaScript source literals', () => {
  test('quotes strings without changing Unicode or exposing line separators', () => {
    expect(quoteJavaScriptString('it\'s "ready"\\now\n\t\u2028\u2029🙂')).toBe(
      "'it\\'s \"ready\"\\\\now\\n\\t\\u2028\\u2029🙂'",
    );
    expect(quoteJavaScriptString('')).toBe("''");
  });

  test('serializes nested data with stable property order and explicit undefined handling', () => {
    expect(
      serializeJavaScriptLiteral({
        title: 'Home',
        hidden: undefined,
        'has space': [true, undefined, null, { count: 2 }],
      }),
    ).toBe("{ title: 'Home', 'has space': [true, null, null, { count: 2 }] }");
    expect(serializeJavaScriptLiteral([])).toBe('[]');
    expect(serializeJavaScriptLiteral({})).toBe('{  }');
  });

  test('rejects values that cannot be emitted as supported literals', () => {
    for (const value of [NaN, Infinity, -Infinity, undefined, 1n, Symbol('x'), () => true]) {
      expect(() => serializeJavaScriptLiteral(value)).toThrow(
        'Unsupported generated source literal value.',
      );
    }
  });
});
