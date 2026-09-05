import assert from "node:assert/strict";
import test from "node:test";
import { installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();
const { OneLineRoomCardTextField } = await import("../src/editor/text-field-compat.js");

test("the compatibility wrapper is directly importable without the card/editor classes", () => {
  assert.equal(typeof OneLineRoomCardTextField, "function");
  assert.deepEqual(OneLineRoomCardTextField.observedAttributes, [
    "label", "placeholder", "type", "min", "max", "step", "rows",
    "multiline", "disabled", "readonly", "required", "icon"
  ]);
});
