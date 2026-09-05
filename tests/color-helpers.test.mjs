import assert from "node:assert/strict";
import test from "node:test";
import { hexToRgba, readableTextForHex, parseColorToPickerHex } from "../src/lib/colors.js";

test("color helpers retain accepted formats, contrast threshold and safe fallbacks", () => {
  assert.equal(hexToRgba(" #336699 ", 0.2), "rgba(51, 102, 153, 0.2)");
  assert.equal(hexToRgba("#fff"), "");
  assert.equal(hexToRgba("invalid"), "");
  assert.equal(readableTextForHex("#fff"), "#000000");
  assert.equal(readableTextForHex("#000"), "#ffffff");
  assert.equal(readableTextForHex("#8c8c8c"), "#000000");
  assert.equal(readableTextForHex("#8b8b8b"), "#ffffff");
  assert.equal(readableTextForHex("red"), "");
  assert.equal(parseColorToPickerHex(" #ABCDEF "), "#ABCDEF");
  assert.equal(parseColorToPickerHex("rgba(999, 0, 42, 0.5)"), "#ff002a");
  assert.equal(parseColorToPickerHex("#fff"), "#000000");
  assert.equal(parseColorToPickerHex("invalid"), "#000000");
});
