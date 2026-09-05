import assert from "node:assert/strict";
import test from "node:test";
import { formatEntityStateForDisplay, formatEntityAttributeForDisplay } from "../src/lib/formatting.js";

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
