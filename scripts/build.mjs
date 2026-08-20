import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = resolve(repositoryRoot, "src/room-card.js");
const distributionFile = resolve(repositoryRoot, "dist/room-card.js");

await mkdir(dirname(distributionFile), { recursive: true });
await copyFile(sourceFile, distributionFile);

console.log("Built dist/room-card.js from src/room-card.js.");
