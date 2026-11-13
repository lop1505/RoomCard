import assert from "node:assert/strict";
import test from "node:test";
import { getRoomEntities, resolveAutomaticRoom } from "../src/lib/room-discovery.js";
import { roomFixture } from "./support/room-fixture.mjs";
const ids = result => result.config.controls.map(control => control.entity);
const freeze = value => { if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

test("room discovery honors explicit entity area over device area and excludes hidden, disabled and diagnostic entities", () => {
  const hass = roomFixture();
  const found = getRoomEntities(hass, "living").map(entry => entry.entity_id);
  assert.ok(found.includes("light.direct_area"));
  assert.ok(found.includes("light.offline"));
  for (const id of ["light.other_room", "light.hidden", "light.disabled", "light.diagnostic", "light.disabled_device"]) assert.ok(!found.includes(id), id);
  assert.deepEqual(getRoomEntities(hass, ""), []);
});

test("automatic controls use stable domain/entity-ID order without relying on state or friendly names", () => {
  const hass = roomFixture();
  const result = resolveAutomaticRoom({ area: "living" }, hass);
  assert.deepEqual(ids(result), ["light.a", "light.direct_area", "light.offline", "light.z", "switch.plug", "cover.blind", "fan.ceiling", "media_player.radio", "lock.front"]);
  hass.states["light.z"].attributes.friendly_name = "First light";
  hass.states["light.a"].state = "on";
  assert.deepEqual(ids(resolveAutomaticRoom({ area: "living" }, hass)), ids(result));
  assert.equal(result.config.controls.at(-1).tap_action.action, "more-info", "locks do not unlock on discovery or a default tap");
});

test("manual controls, duplicates, actions and drawer placement take precedence without mutation", () => {
  const config = freeze({ area: "living", exclude_entities: ["light.a", "light.z"], card: {
    name: "Custom room", image: "/local/own.jpg", detail_drawer: { enabled: true },
    controls: [{ entity: "light.a", name: "Pinned", display_in: "drawer", tap_action: { action: "none" } }, { entity: "light.a", name: "Second" }, { type: "template", content: "Always here" }, { entity: "light.outside" }]
  } });
  const result = resolveAutomaticRoom(config, freeze(roomFixture()));
  assert.deepEqual(result.config.controls.slice(0, 4), config.card.controls);
  assert.equal(ids(result).filter(id => id === "light.a").length, 2);
  assert.ok(!ids(result).includes("light.z"));
  assert.equal(result.config.image, "/local/own.jpg");
  result.config.controls[0].tap_action.action = "toggle";
  assert.equal(config.card.controls[0].tap_action.action, "none");
});

test("header discovery uses device classes with explicit and empty overrides", () => {
  const hass = roomFixture();
  const { config } = resolveAutomaticRoom({ area: "living" }, hass);
  assert.equal(config.name, "Living room");
  assert.equal(config.icon, "mdi:sofa");
  assert.equal(config.entity, "climate.heating");
  assert.equal(config.temp_sensor, "sensor.temp");
  assert.equal(config.humid_sensor, "sensor.humidity");
  assert.deepEqual(config.window_sensors, ["binary_sensor.window"]);
  assert.deepEqual(config.battery_sensors, ["sensor.battery"]);
  const overridden = resolveAutomaticRoom({ area: "living", card: { name: "", entity: "", temp_sensor: "sensor.other", window_sensors: [] } }, hass).config;
  assert.equal(overridden.name, ""); assert.equal(overridden.entity, "");
  assert.equal(overridden.temp_sensor, "sensor.other"); assert.deepEqual(overridden.window_sensors, []);
  assert.equal(resolveAutomaticRoom({ area: "living", auto_sensors: false }, hass).config.entity, undefined);
});

test("domain and entity exclusions apply to automatic controls and header sensors, including an empty domain list", () => {
  const hass = roomFixture();
  const config = { area: "living", domains: ["light"], exclude_entities: ["light.z", "sensor.temp", "binary_sensor.window"] };
  const result = resolveAutomaticRoom(config, hass);
  assert.deepEqual(ids(result), ["light.a", "light.direct_area", "light.offline"]);
  assert.equal(result.config.temp_sensor, undefined);
  assert.deepEqual(result.config.window_sensors, []);
  assert.deepEqual(ids(resolveAutomaticRoom({ area: "living", domains: [] }, hass)), []);
});

test("registry additions, moves and removals update derived membership while retaining saved overrides", () => {
  const hass = roomFixture();
  const config = { area: "living", card: { controls: [{ entity: "light.pinned", display_in: "both" }] } };
  const saved = JSON.stringify(config);
  hass.entities = { ...hass.entities, "light.new": { entity_id: "light.new", area_id: "living" } };
  assert.ok(ids(resolveAutomaticRoom(config, hass)).includes("light.new"));
  hass.entities["light.new"].area_id = "bedroom";
  delete hass.entities["light.z"];
  const next = ids(resolveAutomaticRoom(config, hass));
  assert.ok(!next.includes("light.new")); assert.ok(!next.includes("light.z"));
  assert.ok(next.includes("light.pinned"));
  assert.equal(JSON.stringify(config), saved);
});

test("missing registries, deleted areas and malformed optional settings fail safely without discovering the whole home", () => {
  assert.equal(resolveAutomaticRoom({}, roomFixture()).error, "room_section_choose_area");
  assert.equal(resolveAutomaticRoom({ area: "living" }, {}).error, "room_section_loading");
  assert.equal(resolveAutomaticRoom({ area: "deleted" }, roomFixture()).error, "room_section_missing_area");
  assert.equal(resolveAutomaticRoom({ area: "toString" }, roomFixture()).error, "room_section_missing_area");
  for (const card of [null, "invalid", { controls: {} }, { controls: [null, 1, []] }]) {
    assert.ok(resolveAutomaticRoom({ area: "living", card, exclude_entities: {} }, roomFixture()).config.controls.length > 0);
  }
});
