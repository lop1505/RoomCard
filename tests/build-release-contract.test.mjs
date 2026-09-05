import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, readdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { installDomEnvironment, importRoomCard } from "./support/dom-env.mjs";
import { assertFreshDistribution } from "../scripts/check-build.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("a stale artifact is rejected without overwriting it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "roomcard-stale-test-"));
  try {
    const fixture = join(directory, "room-card.js");
    const stale = "// deliberately stale distribution\n";
    await writeFile(fixture, stale);
    await assert.rejects(assertFreshDistribution(fixture), /dist\/room-card\.js is stale/);
    assert.equal(await readFile(fixture, "utf8"), stale);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("the committed HACS artifact is deterministic, self-contained, and registers once", async () => {
  installDomEnvironment();
  await assertFreshDistribution();
  const distribution = await readFile(resolve(repositoryRoot, "dist/room-card.js"), "utf8");
  assert.equal(/^\s*import\s/m.test(distribution), false);
  // The build's parsed esbuild metafile also checks static/dynamic imports;
  // a text regex would incorrectly flag the French label "l'import (...)".
  assert.equal(distribution.includes("sourceMappingURL="), false);

  const registrations = [];
  const define = customElements.define.bind(customElements);
  customElements.define = (name, constructor, options) => {
    registrations.push(name);
    return define(name, constructor, options);
  };

  const load = (suffix) => import(`data:text/javascript;base64,${Buffer.from(`${distribution}\n// ${suffix}`).toString("base64")}`);
  await load("first registration pass");
  await load("second registration pass");

  assert.deepEqual(registrations, [
    "oneline-room-card-textfield",
    "oneline-room-card-editor",
    "oneline-room-card"
  ]);

  assert.ok(customElements.get("oneline-room-card-textfield"));
  assert.ok(customElements.get("oneline-room-card"));
  assert.ok(customElements.get("oneline-room-card-editor"));
  assert.equal(window.customCards.filter((card) => card.type === "oneline-room-card").length, 1);
});

test("all preset images resolve beside the real module URL and exist in the HACS distribution", async () => {
  const { ROOM_IMAGE_PRESETS, getRoomImagePresetUrl } = await importRoomCard();
  const artifactUrl = new URL("../dist/room-card.js", import.meta.url);
  const hacs = JSON.parse(await readFile(resolve(repositoryRoot, "hacs.json"), "utf8"));
  assert.equal(hacs.filename, "room-card.js");
  assert.deepEqual((await readdir(resolve(repositoryRoot, "dist"))).sort(), ["room-card.js", "rooms"]);
  const version = JSON.parse(await readFile(resolve(repositoryRoot, "package.json"), "utf8")).version;
  const expectedFiles = [];
  for (const preset of ROOM_IMAGE_PRESETS) {
    const expected = new URL(`./rooms/${preset.file}`, artifactUrl);
    expected.searchParams.set("v", version);
    assert.equal(getRoomImagePresetUrl(preset.id), expected.href);
    const bytes = await readFile(expected);
    assert.ok(bytes.length > 0, `${preset.file} must not be empty`);
    assert.equal(bytes.subarray(0, 3).toString("hex"), "ffd8ff", `${preset.file} must be an actual JPEG`);
    expectedFiles.push(preset.file);
  }
  assert.deepEqual((await readdir(resolve(repositoryRoot, "dist/rooms"))).sort(), expectedFiles.sort());
  assert.equal(getRoomImagePresetUrl("not-a-preset"), "");
});

test("release metadata accepts the matching tag and rejects a mismatched tag clearly", async () => {
  const source = await readFile(resolve(repositoryRoot, "src/version.js"), "utf8");
  const version = source.match(/const VERSION = "(\d+\.\d+\.\d+)";/)?.[1];
  assert.ok(version);
  const runCheck = (tag) => spawnSync(process.execPath, ["scripts/check-release.mjs"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: { ...process.env, GITHUB_REF_TYPE: "tag", GITHUB_REF_NAME: tag }
  });

  const matching = runCheck(`v${version}`);
  assert.equal(matching.status, 0, matching.stderr);
  assert.match(matching.stdout, new RegExp(`consistent for v${version.replaceAll(".", "\\.")}`));

  const mismatch = runCheck("v9.9.9");
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, new RegExp(`Tag v9\\.9\\.9 does not match source version ${version.replaceAll(".", "\\.")}`));
});

test("browser-style HACS, CDN, and local module URLs preserve relative preset resolution", () => {
  const result = spawnSync(process.execPath, ["--experimental-vm-modules", "tests/support/bundle-url-probe.mjs"], {
    cwd: repositoryRoot,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
