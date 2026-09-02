import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";

installDomEnvironment();
const {
  SHARED_SPARKLINE_CACHE,
  SHARED_SPARKLINE_PENDING,
  normalizeSparklineSamples,
  getSparklineStats
} = await importRoomCard([
  "SHARED_SPARKLINE_CACHE",
  "SHARED_SPARKLINE_PENDING",
  "normalizeSparklineSamples",
  "getSparklineStats"
]);

const createRenderedCard = (config, hass) => {
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig(config);
  card.hass = hass;
  return card;
};

const history = (entity, values) => ({
  [entity]: values.map((value, index) => ({
    state: String(value),
    last_changed: new Date(Date.UTC(2026, 7, 20, 10 + index)).toISOString()
  }))
});

test("raw history samples normalize independently and produce statistics", () => {
  const samples = [
    { timestamp: 30, value: 5 },
    { timestamp: 10, value: 1 },
    { timestamp: 20, value: 3 }
  ];
  assert.deepEqual(normalizeSparklineSamples(samples), [
    { x: 0, y: 1 },
    { x: 0.5, y: 3 },
    { x: 1, y: 5 }
  ]);
  assert.deepEqual(getSparklineStats(samples), { min: 1, max: 5, average: 3 });
  assert.deepEqual(normalizeSparklineSamples([{ timestamp: 10, value: 2 }]), [{ x: 0, y: 2 }, { x: 1, y: 2 }]);
});

test("interactive sparklines isolate parent actions and reuse cache across 6h, 24h, and 7d", async () => {
  SHARED_SPARKLINE_CACHE.clear();
  SHARED_SPARKLINE_PENDING.clear();
  const entity = "sensor.temperature";
  const requests = [];
  const hass = createHass({
    states: {
      [entity]: { state: "3", attributes: { friendly_name: "Temperature", unit_of_measurement: "°C" } }
    },
    formatEntityState: (stateObj) => `HA:${stateObj.state} ${stateObj.attributes.unit_of_measurement}`,
    callWS: async (request) => {
      requests.push(request);
      return history(entity, [1, 3, 5]);
    }
  });
  const card = createRenderedCard({
    controls: [{
      entity,
      show_sparkline: true,
      sparkline_detail: true,
      sparkline_hours: 24,
      tap_action: { action: "toggle" },
      hold_action: { action: "toggle" },
      double_tap_action: { action: "toggle" }
    }]
  }, hass);
  const parentActions = [];
  card.addEventListener("hass-action", (event) => parentActions.push(event.detail));
  await wait(10);

  const sparkline = card.shadowRoot.querySelector("button.btn-sparkline");
  assert.ok(sparkline);
  sparkline.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  sparkline.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
  sparkline.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  sparkline.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
  sparkline.click();
  await wait(5);
  assert.equal(parentActions.length, 0);
  assert.equal(requests.length, 1, "the already loaded 24h history is reused");
  assert.match(card.shadowRoot.querySelector(".sparkline-current").textContent, /HA:3 °C/);
  assert.deepEqual(
    Array.from(card.shadowRoot.querySelectorAll(".sparkline-stats dd"), (node) => node.textContent),
    ["HA:1 °C", "HA:5 °C", "HA:3 °C"]
  );

  card.shadowRoot.querySelector('.sparkline-ranges button[data-hours="6"]').click();
  await wait(5);
  card.shadowRoot.querySelector('.sparkline-ranges button[data-hours="168"]').click();
  await wait(5);
  assert.equal(requests.length, 3);
  assert.equal(card.shadowRoot.querySelector('.sparkline-ranges button[data-hours="168"]').getAttribute("aria-pressed"), "true");
  card._closeDialog();
  card.remove();
});

test("sparkline detail distinguishes empty data and request errors", async () => {
  SHARED_SPARKLINE_CACHE.clear();
  SHARED_SPARKLINE_PENDING.clear();
  const emptyEntity = "sensor.empty";
  const emptyCard = createRenderedCard({ controls: [] }, createHass({
    states: { [emptyEntity]: { state: "0", attributes: {} } },
    callWS: async () => ({ [emptyEntity]: [] })
  }));
  emptyCard._showSparklineDialog(emptyEntity, 24, emptyCard);
  await wait(5);
  assert.equal(emptyCard.shadowRoot.querySelector(".sparkline-dialog-message").textContent, "No history data available.");
  emptyCard._closeDialog();
  emptyCard.remove();

  const errorEntity = "sensor.error";
  const errorCard = createRenderedCard({ controls: [] }, createHass({
    states: { [errorEntity]: { state: "0", attributes: {} } },
    callWS: async () => { throw new Error("offline"); }
  }));
  errorCard._showSparklineDialog(errorEntity, 24, errorCard);
  await wait(5);
  assert.equal(errorCard.shadowRoot.querySelector(".sparkline-dialog-message").textContent, "History could not be loaded.");
  errorCard._closeDialog();
  errorCard.remove();
});

test("closed dialogs and superseded ranges ignore late history responses", async () => {
  SHARED_SPARKLINE_CACHE.clear();
  SHARED_SPARKLINE_PENDING.clear();
  const entity = "sensor.delayed";
  const resolvers = [];
  const hass = createHass({
    states: { [entity]: { state: "4", attributes: { unit_of_measurement: "W" } } },
    callWS: () => new Promise((resolve) => resolvers.push(resolve))
  });
  const card = createRenderedCard({ controls: [] }, hass);
  const trigger = document.createElement("button");
  card.shadowRoot.appendChild(trigger);
  trigger.focus();
  card._showSparklineDialog(entity, 24, trigger);
  assert.equal(card.shadowRoot.querySelector(".sparkline-dialog").getAttribute("aria-busy"), "true");
  card.shadowRoot.querySelector('.sparkline-ranges button[data-hours="6"]').click();
  resolvers[1](history(entity, [6, 8]));
  await wait(5);
  assert.equal(card.shadowRoot.querySelector('[data-stat="average"]').textContent, "7 W");
  resolvers[0](history(entity, [1, 1]));
  await wait(5);
  assert.equal(card.shadowRoot.querySelector('[data-stat="average"]').textContent, "7 W");

  card.shadowRoot.querySelector('.sparkline-ranges button[data-hours="168"]').click();
  card.shadowRoot.querySelector(".sparkline-dialog-close").click();
  resolvers[2](history(entity, [100, 200]));
  await wait(5);
  assert.equal(card.shadowRoot.activeElement, trigger);
  assert.equal(card.shadowRoot.querySelector(".sparkline-dialog-container"), null);
  card.remove();
});

test("sparkline detail uses the shared modal focus trap and Escape lifecycle", async () => {
  SHARED_SPARKLINE_CACHE.clear();
  SHARED_SPARKLINE_PENDING.clear();
  const entity = "sensor.focus";
  const card = createRenderedCard({ controls: [] }, createHass({
    states: { [entity]: { state: "1", attributes: {} } },
    callWS: async () => history(entity, [1, 2])
  }));
  const trigger = document.createElement("button");
  card.shadowRoot.appendChild(trigger);
  trigger.focus();
  card._showSparklineDialog(entity, 24, trigger);
  const close = card.shadowRoot.querySelector(".sparkline-dialog-close");
  const firstRange = card.shadowRoot.querySelector(".sparkline-ranges button");
  assert.equal(card.shadowRoot.activeElement, close);
  close.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, composed: true }));
  assert.equal(card.shadowRoot.activeElement, firstRange);
  firstRange.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
  await wait(5);
  assert.equal(card.shadowRoot.querySelector(".sparkline-dialog-container"), null);
  assert.equal(card.shadowRoot.activeElement, trigger);
  card.remove();
});
