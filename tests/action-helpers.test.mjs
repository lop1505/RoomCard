import assert from "node:assert/strict";
import test from "node:test";
import { buildHassActionDetail } from "../src/lib/actions.js";

test("action payload construction retains action type, target and explicit configuration", () => {
  const action = { action: "call-service", service: "light.turn_on", target: { entity_id: "light.target" }, data: { brightness_pct: 42 } };
  const detail = buildHassActionDetail("double_tap", { entity: "light.original", double_tap_action: action }, {});
  assert.equal(detail.action, "double_tap");
  assert.equal(detail.config.entity, "light.target");
  assert.equal(detail.config.double_tap_action, action);
});

test("climate toggles retain the existing explicit service translation", () => {
  const config = { entity: "climate.room", hold_action: { action: "toggle" } };
  const on = buildHassActionDetail("hold", config, { states: { "climate.room": { state: "heat" } } });
  assert.deepEqual(on.config.hold_action, { action: "call-service", service: "climate.set_hvac_mode", data: { hvac_mode: "off" }, target: { entity_id: "climate.room" } });
  const off = buildHassActionDetail("hold", config, { states: { "climate.room": { state: "off" } } });
  assert.equal(off.config.hold_action.service, "climate.turn_on");
  assert.equal(config.hold_action.action, "toggle");
});

test("missing and invalid actions preserve the none fallback and existing normalization", () => {
  assert.deepEqual(buildHassActionDetail("tap", { entity: "light.room", tap_action: "invalid" }, {}).config.tap_action, { action: "none" });
  const config = { entity: "light.room", tap_action: {} };
  assert.equal(buildHassActionDetail("tap", config, {}).config.tap_action.action, "none");
  assert.equal(config.tap_action.action, "none");
});
