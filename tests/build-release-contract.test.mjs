import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { installDomEnvironment } from "./support/dom-env.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("the committed HACS artifact is deterministic, self-contained, and registers once", async () => {
  installDomEnvironment();
  const [source, distribution] = await Promise.all([
    readFile(resolve(repositoryRoot, "src/room-card.js"), "utf8"),
    readFile(resolve(repositoryRoot, "dist/room-card.js"), "utf8")
  ]);
  assert.equal(distribution, source);
  assert.equal(/^\s*import\s/m.test(distribution), false);

  const load = (suffix) => import(`data:text/javascript;base64,${Buffer.from(`${distribution}\n// ${suffix}`).toString("base64")}`);
  await load("first registration pass");
  await load("second registration pass");

  assert.ok(customElements.get("oneline-room-card-textfield"));
  assert.ok(customElements.get("oneline-room-card"));
  assert.ok(customElements.get("oneline-room-card-editor"));
  assert.equal(window.customCards.filter((card) => card.type === "oneline-room-card").length, 1);
});

test("release metadata accepts the matching tag and rejects a mismatched tag clearly", async () => {
  const source = await readFile(resolve(repositoryRoot, "src/room-card.js"), "utf8");
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
