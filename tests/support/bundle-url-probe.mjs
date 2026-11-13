import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createContext, SourceTextModule } from "node:vm";

// Execute the unchanged artifact with browser-style module URLs, without any
// network requests or rewriting import.meta in its source. This runs in a
// dedicated Node process because SourceTextModule requires an opt-in flag.
const installationUrl = process.argv[2]
  ? pathToFileURL(`${resolve(process.argv[2])}/`)
  : new URL("../../dist/", import.meta.url);
const code = await readFile(new URL("room-card.js", installationUrl), "utf8");
const { version } = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));
for (const moduleUrl of [
  "https://ha.example/hacsfiles/RoomCard/room-card.js?hacstag=140",
  "https://ha.example/local/community/RoomCard/room-card.js?v=1131808070-1.5.1",
  "https://cdn.jsdelivr.net/gh/lop1505/RoomCard@88b2314/dist/room-card.js",
  "https://ha.example/local/room-card.js?v=test",
  "https://ha.example/local/room-card/room-card.js?v=test",
  "https://ha.example/proxy/ha/local/community/RoomCard/room-card.js?v=test"
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
    assert.equal(actual.href, new URL(`./${preset.file}`, moduleUrl).href);
    assert.equal(actual.pathname.includes("/lovelace/"), false);
    // Resolve a real installed file for every URL; a plausible URL alone hid
    // missing Marketplace/HACS release assets in issue #161.
    const relativePath = actual.pathname.slice(new URL(".", moduleUrl).pathname.length);
    const bytes = await readFile(new URL(relativePath, installationUrl));
    assert.equal(bytes.subarray(0, 3).toString("hex"), "ffd8ff", `${actual.href} must provide a JPEG`);
  }
}
