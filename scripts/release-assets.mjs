import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const distributionDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");

// Marketplace/HACS install release assets as individual files, without unpacking
// a supplementary ZIP. Repository installs also need assets directly in dist/.
export const getReleaseAssets = async (directory = distributionDirectory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    assert.ok(entry.isFile() && /^[a-z0-9-]+\.(js|jpg)$/.test(entry.name),
      `Keep every release asset directly in dist/: ${entry.name}`);
  }
  const names = entries.map((entry) => entry.name).sort();
  assert.ok(names.includes("room-card.js"), "The release must include room-card.js.");
  return names.map((name) => resolve(directory, name));
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log((await getReleaseAssets()).join("\n"));
}
