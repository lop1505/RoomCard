import { buildRoomCard, repositoryRoot } from "./build-config.mjs";
import { resolve } from "node:path";

await buildRoomCard(resolve(repositoryRoot, "dist/room-card.js"));
console.log("Bundled dist/room-card.js from src/room-card.js.");
