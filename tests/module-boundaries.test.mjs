import assert from "node:assert/strict";
import test from "node:test";
import { assertModuleBoundaries } from "../scripts/module-boundaries.mjs";

const input = (...dependencies) => ({ imports: dependencies.map(path => ({ path })) });

test("module boundaries accept the intended acyclic dependency direction", () => {
  assert.doesNotThrow(() => assertModuleBoundaries({
    "src/room-card.js": input("src/card/room-card.js", "src/editor/room-card-editor.js"),
    "src/card/room-card.js": input("src/shared/presentation.js"),
    "src/editor/room-card-editor.js": input("src/shared/presentation.js"),
    "src/shared/presentation.js": input("src/lib/values.js", "src/i18n/translations.js", "src/version.js"),
    "src/lib/values.js": input(), "src/i18n/translations.js": input(), "src/version.js": input()
  }));
});

test("module boundaries reject cycles and back-imports", () => {
  assert.throws(() => assertModuleBoundaries({ "src/lib/a.js": input("src/lib/b.js"), "src/lib/b.js": input("src/lib/a.js") }), /Module cycle/);
  assert.throws(() => assertModuleBoundaries({ "src/room-card.js": input(), "src/lib/a.js": input("src/room-card.js") }), /Back-import/);
  assert.throws(() => assertModuleBoundaries({ "src/lib/a.js": input("src/shared/presentation.js"), "src/shared/presentation.js": input() }), /Invalid library dependency/);
  assert.throws(() => assertModuleBoundaries({ "src/shared/presentation.js": input("src/card/room-card.js"), "src/card/room-card.js": input() }), /Invalid shared dependency/);
  assert.throws(() => assertModuleBoundaries({ "src/editor/editor.js": input("src/card/room-card.js"), "src/card/room-card.js": input() }), /Editor must not depend on card/);
});
