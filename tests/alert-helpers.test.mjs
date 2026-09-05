import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAlertSensorConfig, isAlertSensorActive } from "../src/lib/alerts.js";

test("alert normalization accepts legacy strings without mutating configured state lists", () => {
  assert.equal(normalizeAlertSensorConfig(null), null);
  assert.equal(normalizeAlertSensorConfig(42), null);
  assert.deepEqual(normalizeAlertSensorConfig("sensor.alert"), { entity: "sensor.alert" });
  const original = { entity: "sensor.alert", state: [" Warning ", "ERROR", ""] };
  assert.deepEqual(normalizeAlertSensorConfig(original).state, ["warning", "error"]);
  assert.deepEqual(original.state, [" Warning ", "ERROR", ""]);
});

test("alert thresholds retain OR semantics, aliases and active-state fallback", () => {
  assert.equal(isAlertSensorActive({ entity: "sensor.alert", above: 10, below: 5 }, { state: "12" }), true);
  assert.equal(isAlertSensorActive({ entity: "sensor.alert", min: 10 }, { state: "10" }), false);
  assert.equal(isAlertSensorActive({ entity: "sensor.alert", max: 5 }, { state: "4" }), true);
  assert.equal(isAlertSensorActive({ entity: "sensor.alert", above: 99 }, { state: "warning" }), true);
  assert.equal(isAlertSensorActive({ entity: "sensor.alert", state: ["off"], above: 10 }, { state: "12" }), false);
  assert.equal(isAlertSensorActive({}, { state: "warning" }), false);
  assert.equal(isAlertSensorActive({ entity: "sensor.alert" }, undefined), false);
  assert.equal(isAlertSensorActive({}, { state: "custom" }, () => ({ entity: "sensor.alert", state: ["custom"] })), true);
});
