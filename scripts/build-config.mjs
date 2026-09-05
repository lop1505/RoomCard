import assert from "node:assert/strict";
import { build } from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertModuleBoundaries } from "./module-boundaries.mjs";

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// One options owner for the committed artifact and isolated reproducibility checks.
export const buildRoomCard = async (outfile) => {
  const result = await build({
    absWorkingDir: repositoryRoot,
    entryPoints: ["src/room-card.js"],
    outfile,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    minify: false,
    treeShaking: false,
    splitting: false,
    sourcemap: false,
    charset: "utf8",
    legalComments: "inline",
    metafile: true,
    logLevel: "silent"
  });
  const outputs = Object.values(result.metafile.outputs);
  assert.equal(outputs.length, 1, "HACS requires a single JavaScript artifact.");
  assert.deepEqual(outputs[0].imports, [], "The artifact must not contain runtime imports.");
  assertModuleBoundaries(result.metafile.inputs);
  return result;
};
