import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { buildRoomCard, repositoryRoot } from "./build-config.mjs";

export const assertFreshDistribution = async (distributionFile = resolve(repositoryRoot, "dist/room-card.js")) => {
  const directory = await mkdtemp(join(tmpdir(), "roomcard-build-"));
  try {
    const output = join(directory, "room-card.js");
    await buildRoomCard(output);
    const [fresh, committed] = await Promise.all([
      readFile(output, "utf8"),
      readFile(distributionFile, "utf8")
    ]);
    assert.ok(committed === fresh, "dist/room-card.js is stale. Run `npm run build`.");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};
