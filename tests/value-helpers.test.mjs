import assert from "node:assert/strict";
import test from "node:test";
import { clampNum, trimStr, replaceTemplateExpressions } from "../src/lib/values.js";

test("value helpers import without browser globals and preserve coercion", () => {
  assert.equal(clampNum(null, 0, 10, 7), 0);
  assert.equal(clampNum("", 0, 10, 7), 0);
  assert.equal(clampNum(Infinity, 0, 10, 7), 7);
  assert.equal(clampNum("-4", 0, 10, 7), 0);
  assert.equal(clampNum("12", 0, 10, 7), 10);
  assert.equal(trimStr("  hello  "), "hello");
  const object = {};
  assert.equal(trimStr(object), object);
  assert.equal(trimStr(null), null);
});

test("template tokenization preserves nested braces, quoted braces and incomplete input", () => {
  const expressions = [];
  const input = 'A ${ ({ nested: { value: "}" } }) } B ${ 2 }';
  assert.equal(replaceTemplateExpressions(input, (expression) => {
    expressions.push(expression);
    return "value";
  }), "A value B value");
  assert.deepEqual(expressions, ['({ nested: { value: "}" } })', "2"]);
  assert.equal(replaceTemplateExpressions("before ${ unfinished", () => "unexpected"), "before ${ unfinished");
});
