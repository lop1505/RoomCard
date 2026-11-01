import assert from "node:assert/strict";
import test from "node:test";
import { getEntityDisplayName, formatEntityStateForDisplay, formatEntityAttributeForDisplay } from "../src/lib/formatting.js";

test("entity names prefer explicit text, then the bound HA formatter, with safe legacy fallbacks", () => {
  const id = "sensor.temperature";
  const state = { entity_id: id, state: "21", attributes: { friendly_name: "Legacy name" } };
  const hass = { states: { [id]: state }, entities: { [id]: { name: "HA name" } }, formatEntityName(value) {
    assert.equal(value, state);
    return this.entities[value.entity_id].name;
  } };
  assert.equal(getEntityDisplayName(hass, id), "HA name");
  assert.equal(getEntityDisplayName(hass, id, "My name"), "My name");
  assert.equal(getEntityDisplayName(hass, id, ""), "");
  for (const formatter of [undefined, () => { throw Error("registry unavailable"); }, () => "", () => undefined]) {
    assert.equal(getEntityDisplayName({ ...hass, formatEntityName: formatter }, id), "Legacy name");
  }
  assert.equal(getEntityDisplayName({ states: { [id]: { state: "unavailable" } } }, id), id);
  assert.equal(getEntityDisplayName(hass, "sensor.missing"), "sensor.missing");
  assert.equal(getEntityDisplayName(undefined, id), id);
  assert.equal(getEntityDisplayName(undefined, undefined), "");
});

test("state formatting prefers HA and preserves existing unit fallback concatenation", () => {
  const sensor = { state: "21", attributes: {} };
  assert.equal(formatEntityStateForDisplay({}, null), "");
  assert.equal(formatEntityStateForDisplay({}, sensor, "°C"), "21°C");
  assert.equal(formatEntityStateForDisplay({ formatEntityState: () => "21.0" }, sensor, "°C"), "21.0°C");
  sensor.attributes.unit_of_measurement = " °F ";
  assert.equal(formatEntityStateForDisplay({}, sensor, "°C"), "21°F");
  assert.equal(formatEntityStateForDisplay({ formatEntityState() { throw Error(); } }, sensor), "21°F");
  assert.equal(formatEntityStateForDisplay({ formatEntityState: () => "formatted" }, sensor, "°C"), "formatted");
});

test("attribute formatting keeps HA arguments and handles missing values and formatter errors", () => {
  const sensor = { state: "on", attributes: {} };
  assert.equal(formatEntityAttributeForDisplay({}, sensor, "temperature", null), "");
  assert.equal(formatEntityAttributeForDisplay({}, sensor, "temperature", 0, "°C"), "0°C");
  assert.equal(formatEntityAttributeForDisplay({ formatEntityAttributeValue(...args) {
    assert.deepEqual(args, [sensor, "temperature", 21]);
    return "HA temperature";
  } }, sensor, "temperature", 21), "HA temperature");
  assert.equal(formatEntityAttributeForDisplay({ formatEntityAttributeValue() { throw Error(); } }, sensor, "temperature", 21, "°C"), "21°C");
});
