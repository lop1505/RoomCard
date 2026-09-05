import assert from "node:assert/strict";
import test from "node:test";
import { STATE_DEFINITIONS, DOMAIN_STATE_ICON_MAPS, getEntityDomain, isEntityOffline,
  isEntityOn, isEntityOff, isEntityActive } from "../src/lib/states.js";

test("state definitions retain domain parsing, offline detection and icon mappings", () => {
  assert.equal(getEntityDomain("light.room"), "light");
  assert.equal(getEntityDomain(null), "");
  assert.equal(getEntityDomain("light"), "");
  assert.equal(isEntityOffline({ state: "unavailable" }), true);
  assert.equal(isEntityOffline({ state: "unknown" }), true);
  assert.equal(isEntityOffline(undefined), false);
  assert.equal(isEntityOn({ state: "on" }), true);
  assert.equal(isEntityOff({ state: "off" }), true);
  assert.equal(Object.isFrozen(STATE_DEFINITIONS), true);
  assert.equal(DOMAIN_STATE_ICON_MAPS.cover.opening, "mdi:window-shutter-open");
});

test("domain activation keeps legacy fallbacks rather than unifying semantics", () => {
  assert.equal(isEntityActive(undefined, "light.room"), false);
  assert.equal(isEntityActive({ state: "paused" }, "media_player.room"), false);
  assert.equal(isEntityActive({ state: "playing" }, "media_player.room"), true);
  assert.equal(isEntityActive({ state: "closed" }, "cover.room"), false);
  assert.equal(isEntityActive({ state: "opening" }, "cover.room"), true);
  // Preserve the historical domain fallback; availability is checked separately.
  assert.equal(isEntityActive({ state: "unknown" }, "cover.room"), true);
  assert.equal(isEntityActive({ state: "unknown" }, "climate.room"), false);
  assert.equal(isEntityActive({ state: "idle" }, "climate.room"), true);
});
