import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertFreshDistribution } from "./check-build.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const read = (path) => readFile(resolve(repositoryRoot, path), "utf8");
const [source, distribution, readme, changelog, packageJson] = await Promise.all([
  read("src/room-card.js"),
  read("dist/room-card.js"),
  read("README.md"),
  read("CHANGELOG.md"),
  read("package.json")
]);

const matchVersion = (content, pattern, label) => {
  const match = content.match(pattern);
  assert.ok(match, `Could not find ${label} version.`);
  return match[1];
};

const sourceVersion = matchVersion(source, /const VERSION = "(\d+\.\d+\.\d+)";/, "source");
const distributionVersion = matchVersion(distribution, /(?:const|var|let) VERSION = "(\d+\.\d+\.\d+)";/, "distribution");
const readmeVersion = matchVersion(readme, /What's new in (\d+\.\d+\.\d+)/, "README");
const changelogVersion = matchVersion(changelog, /^## \[(\d+\.\d+\.\d+)\]$/m, "changelog");
const manifestVersion = JSON.parse(packageJson).version;

await assertFreshDistribution();

for (const [label, version] of [
  ["distribution", distributionVersion],
  ["README", readmeVersion],
  ["changelog", changelogVersion],
  ["package.json", manifestVersion]
]) {
  assert.equal(version, sourceVersion, `${label} version ${version} does not match source version ${sourceVersion}.`);
}

if (process.env.GITHUB_REF_TYPE === "tag") {
  assert.equal(
    process.env.GITHUB_REF_NAME,
    `v${sourceVersion}`,
    `Tag ${process.env.GITHUB_REF_NAME} does not match source version ${sourceVersion}.`
  );
}

console.log(`Distribution and release metadata are consistent for v${sourceVersion}.`);
