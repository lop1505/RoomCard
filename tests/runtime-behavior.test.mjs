import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();

const helpers = [
  "clampNum",
  "convertTemperatureValue",
  "evalTemplateString",
  "formatConvertedTemperature",
  "formatEntityStateForDisplay",
  "hexToRgba",
  "normalizeTemperatureUnit",
  "readableTextForHex",
  "replaceTemplateExpressions"
];
const roomCardModule = await importRoomCard(helpers);
const RoomCard = customElements.get("oneline-room-card");

const createCard = (hass = createHass()) => {
  const card = document.createElement("oneline-room-card");
  card._hass = hass;
  return card;
};

test("pure helpers preserve formatting, conversion, and template behavior", () => {
  assert.equal(roomCardModule.clampNum("12", 0, 10, 5), 10);
  assert.equal(roomCardModule.clampNum("invalid", 0, 10, 5), 5);
  assert.equal(roomCardModule.normalizeTemperatureUnit("F"), "°F");
  assert.equal(roomCardModule.normalizeTemperatureUnit(" C "), "°C");
  assert.equal(roomCardModule.convertTemperatureValue(0, "°C", "°F"), 32);
  assert.equal(roomCardModule.convertTemperatureValue(212, "°F", "°C"), 100);
  assert.equal(roomCardModule.hexToRgba("#336699", 0.2), "rgba(51, 102, 153, 0.2)");
  assert.equal(roomCardModule.readableTextForHex("#ffffff"), "#000000");
  assert.equal(roomCardModule.readableTextForHex("#000000"), "#ffffff");

  const replaced = roomCardModule.replaceTemplateExpressions("A ${1 + 1} B", (expression) => expression === "1 + 1" ? 2 : "");
  assert.equal(replaced, "A 2 B");

  const hass = createHass({
    states: {
      "sensor.temperature": { state: "21", attributes: { unit_of_measurement: "°C" } }
    },
    formatEntityState: () => "21.0 °C"
  });
  assert.equal(
    roomCardModule.formatEntityStateForDisplay(hass, hass.states["sensor.temperature"]),
    "21.0 °C"
  );
  const conversionHass = createHass();
  assert.equal(
    roomCardModule.formatConvertedTemperature(conversionHass, hass.states["sensor.temperature"], 0, "°C", "°F"),
    "32.0 °F"
  );
  assert.equal(
    roomCardModule.evalTemplateString('Next: ${Number(entity("sensor.temperature").state) + 1}', hass, {}),
    "Next: 22"
  );
  assert.equal(roomCardModule.evalTemplateString("Safe ${not valid JavaScript}", hass, {}), "Safe ");
});

test("visibility conditions handle state, numeric, user, and nested logic", () => {
  const hass = createHass({
    states: {
      "binary_sensor.window": { state: "off", attributes: {} },
      "sensor.humidity": { state: "61", attributes: {} }
    },
    user: { id: "owner" }
  });
  const card = createCard(hass);

  assert.equal(card._checkCondition({ condition: "state", entity: "binary_sensor.window", state: "off" }, hass), true);
  assert.equal(card._checkCondition({ condition: "numeric_state", entity: "sensor.humidity", above: 60, below: 70 }, hass), true);
  assert.equal(card._checkCondition({ condition: "user", users: ["owner"] }, hass), true);
  assert.equal(card._checkCondition({
    condition: "and",
    conditions: [
      { condition: "state", entity: "binary_sensor.window", state: "off" },
      { condition: "not", conditions: [{ condition: "numeric_state", entity: "sensor.humidity", above: 70 }] }
    ]
  }, hass), true);
  assert.equal(card._checkConditions([{ condition: "numeric_state", entity: "sensor.humidity", below: 60 }], hass), false);
});

test("alert configuration normalizes states and evaluates thresholds", () => {
  const card = createCard();

  assert.deepEqual(
    card._normalizeAlertSensorConfig({ entity: "sensor.status", state: "Warning, Error" }),
    { entity: "sensor.status", state: ["warning", "error"] }
  );
  assert.equal(card._isAlertSensorActive(
    { entity: "sensor.status", state: ["warning"] },
    { state: "WARNING", attributes: {} }
  ), true);
  assert.equal(card._isAlertSensorActive(
    { entity: "sensor.humidity", above: 60 },
    { state: "61", attributes: {} }
  ), true);
  assert.equal(card._isAlertSensorActive(
    { entity: "sensor.humidity", below: 20 },
    { state: "25", attributes: {} }
  ), false);
});

test("slider capabilities convert supported domains without service calls", () => {
  const hass = createHass({
    states: {
      "light.ceiling": { state: "on", attributes: { brightness: 128 } },
      "climate.room": { state: "heat", attributes: { min_temp: 10, max_temp: 30, temperature: 21 } },
      "media_player.room": { state: "playing", attributes: { volume_level: 0.42 } }
    }
  });
  const card = createCard(hass);

  assert.deepEqual(
    card._getSliderCapabilities("light", hass.states["light.ceiling"], { entity: "light.ceiling" }),
    { supported: true, min: 0, max: 100, step: 1, value: 50, pct: 50, action: "brightness" }
  );
  assert.equal(card._getSliderCapabilities("climate", hass.states["climate.room"], { entity: "climate.room" }).value, 21);
  assert.equal(card._getSliderCapabilities("media_player", hass.states["media_player.room"], { entity: "media_player.room" }).value, 42);
  assert.equal(hass.__serviceCalls.length, 0);
});

test("actions dispatch the Home Assistant action contract and suppress unavailable entities", () => {
  const hass = createHass({
    states: {
      "light.ceiling": { state: "on", attributes: {} },
      "light.offline": { state: "unavailable", attributes: {} }
    }
  });
  const card = createCard(hass);
  const events = [];
  card.addEventListener("hass-action", (event) => events.push(event.detail));

  card._fireAction("tap", {
    entity: "light.ceiling",
    tap_action: { action: "toggle" }
  });
  card._fireAction("tap", {
    entity: "light.offline",
    tap_action: { action: "toggle" }
  });

  assert.deepEqual(events, [{
    action: "tap",
    config: {
      entity: "light.ceiling",
      tap_action: { action: "toggle" }
    }
  }]);
});

test("disconnecting a card clears timers, intervals, and pending sparkline requests", () => {
  const card = new RoomCard();
  const timeout = setTimeout(() => {}, 60_000);
  card._activeTimers.add(timeout);
  card._lastChangedInterval = setInterval(() => {}, 60_000);
  card._sparklineInterval = setInterval(() => {}, 60_000);
  card._sparklinePending.set("sensor.test|24", Promise.resolve([]));

  card.disconnectedCallback();

  assert.equal(card._activeTimers.size, 0);
  assert.equal(card._lastChangedInterval, null);
  assert.equal(card._sparklineInterval, null);
  assert.equal(card._sparklinePending.size, 0);
});
