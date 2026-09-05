import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAdaptiveImageConditions, evaluateRoomModeActiveWhen,
  evaluateVisibilityCondition, getConditionEntityDependencies } from "../src/lib/conditions.js";

const hass = { states: {
  "sensor.value": { state: "12", attributes: {} },
  "sensor.limit": { state: "10", attributes: {} },
  "light.room": { state: "off", attributes: {} }
}, user: { id: "owner" } };
const now = new Date(2026, 8, 5, 23, 30);

test("condition families retain different incomplete-rule and state-list semantics", () => {
  const incomplete = { condition: "state" };
  assert.equal(evaluateVisibilityCondition(incomplete, hass), true);
  assert.deepEqual(evaluateRoomModeActiveWhen([incomplete], hass), { valid: false, active: false });
  assert.deepEqual(evaluateAdaptiveImageConditions([incomplete], hass, now), { valid: false, active: false });
  const list = { condition: "state", entity: "light.room", state: ["off"] };
  assert.equal(evaluateVisibilityCondition(list, hass), false);
  assert.equal(evaluateRoomModeActiveWhen([list], hass).active, true);
  assert.equal(evaluateAdaptiveImageConditions([list], hass, now).active, true);
  assert.equal(evaluateVisibilityCondition({ condition: "future" }, hass), true);
  assert.equal(evaluateRoomModeActiveWhen([{ condition: "future" }], hass).valid, false);
});

test("numeric thresholds are intentionally distinct across condition policies", () => {
  const condition = { condition: "numeric_state", entity: "sensor.value", above: "sensor.limit" };
  assert.equal(evaluateVisibilityCondition(condition, hass), true);
  assert.equal(evaluateRoomModeActiveWhen([condition], hass).valid, false);
  assert.equal(evaluateAdaptiveImageConditions([condition], hass, now).active, true);
  assert.equal(evaluateAdaptiveImageConditions([{ ...condition, above: "sensor.missing" }], hass, now).valid, false);
  const nested = { condition: "and", conditions: [condition] };
  assert.deepEqual(getConditionEntityDependencies([nested]), ["sensor.value", "sensor.limit"]);
});

test("screen and time conditions use explicit environment inputs, including nested rules", () => {
  const screen = { condition: "screen", media_query: "(min-width: 768px)" };
  const matcher = query => ({ matches: query === screen.media_query });
  assert.equal(evaluateVisibilityCondition(screen, hass, matcher), true);
  assert.equal(evaluateAdaptiveImageConditions([{ condition: "and", conditions: [screen] }], hass, now, matcher).active, true);
  assert.equal(evaluateAdaptiveImageConditions([screen], hass, now).valid, false);
  const fail = () => { throw Error("invalid media query"); };
  assert.throws(() => evaluateVisibilityCondition(screen, hass, fail), /invalid media query/);
  assert.equal(evaluateAdaptiveImageConditions([screen], hass, now, fail).valid, false);
  assert.equal(evaluateAdaptiveImageConditions([{ condition: "time", after: "22:00", before: "06:00" }], hass, now).active, true);
});

test("visibility recursion can preserve the card's delegated condition callback", () => {
  const visited = [];
  assert.equal(evaluateVisibilityCondition({ condition: "not", conditions: [{ condition: "custom" }] }, hass, undefined, condition => {
    visited.push(condition.condition);
    return false;
  }), true);
  assert.deepEqual(visited, ["custom"]);
});
