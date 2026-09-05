import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createContext, SourceTextModule } from "node:vm";

// Execute the unchanged artifact with browser-style module URLs, without any
// network requests or rewriting import.meta in its source. This runs in a
// dedicated Node process because SourceTextModule requires an opt-in flag.
const code = await readFile(new URL("../../dist/room-card.js", import.meta.url), "utf8");
const { version } = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));
for (const moduleUrl of [
  "https://ha.example/hacsfiles/RoomCard/room-card.js?hacstag=140",
  "https://cdn.jsdelivr.net/gh/lop1505/RoomCard@88b2314/dist/room-card.js",
  "https://ha.example/local/room-card.js?v=test"
]) {
  const registrations = new Map();
  const context = createContext({
    HTMLElement: class {},
    window: {},
    console: { info() {} },
    URL,
    location: { href: "https://ha.example/lovelace/0" },
    customElements: {
      define: (name, constructor) => registrations.set(name, constructor),
      get: (name) => registrations.get(name)
    }
  });
  const module = new SourceTextModule(code, {
    context,
    identifier: moduleUrl,
    initializeImportMeta: (meta) => { meta.url = moduleUrl; }
  });
  await module.link(() => { throw new Error("Unexpected runtime module import"); });
  await module.evaluate();
  for (const preset of module.namespace.ROOM_IMAGE_PRESETS) {
    const actual = new URL(module.namespace.getRoomImagePresetUrl(preset.id));
    assert.equal(actual.searchParams.get("v"), version);
    actual.search = "";
    assert.equal(actual.href, new URL(`./rooms/${preset.file}`, moduleUrl).href);
    assert.equal(actual.pathname.includes("/lovelace/"), false);
  }
}
