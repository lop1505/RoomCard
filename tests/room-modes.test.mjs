import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();
const { evaluateRoomModeActiveWhen, getConditionEntityDependencies } = await importRoomCard([
  "evaluateRoomModeActiveWhen",
  "getConditionEntityDependencies"
]);

const createRenderedCard = (config, hass) => {
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig(config);
  card.hass = hass;
  return card;
};

test("room mode conditions are strict, nested, and expose their entity dependencies", () => {
  const hass = createHass({
    states: {
      "input_select.mode": { state: "movie", attributes: {} },
      "input_boolean.override": { state: "off", attributes: {} },
      "sensor.lux": { state: "12", attributes: {} }
    }
  });
  const activeWhen = [{
    condition: "and",
    conditions: [
      { condition: "state", entity: "input_select.mode", state: "movie" },
      { condition: "or", conditions: [
        { condition: "numeric_state", entity: "sensor.lux", below: 20 },
        { condition: "not", conditions: [{ condition: "state", entity: "input_boolean.override", state: "on" }] }
      ] }
    ]
  }];
  assert.deepEqual(evaluateRoomModeActiveWhen(activeWhen, hass), { valid: true, active: true });
  assert.deepEqual(
    getConditionEntityDependencies(activeWhen).sort(),
    ["input_boolean.override", "input_select.mode", "sensor.lux"]
  );
  assert.deepEqual(evaluateRoomModeActiveWhen([], hass), { valid: false, active: false });
  assert.deepEqual(evaluateRoomModeActiveWhen([{ condition: "state", entity: "input_select.mode" }], hass), { valid: false, active: false });
  assert.deepEqual(evaluateRoomModeActiveWhen([{ condition: "numeric_state", entity: "sensor.lux", above: "" }], hass), { valid: false, active: false });
  assert.deepEqual(evaluateRoomModeActiveWhen([{ condition: "screen", media_query: "(min-width: 1px)" }], hass), { valid: false, active: false });
  assert.deepEqual(evaluateRoomModeActiveWhen([{ condition: "not", conditions: [{ condition: "state", entity: "binary_sensor.missing", state: "on" }] }], hass), { valid: false, active: false });
});

test("room modes call only scene and script services, track active state, and isolate events", () => {
  const config = {
    collapsible: true,
    default_state: "collapsed",
    remember_state: false,
    controls: [{ entity: "light.ceiling" }],
    room_modes: [
      {
        entity: "script.relax",
        name: "Relax",
        icon: "mdi:sofa",
        color: "#9c6cff",
        active_when: [{ condition: "numeric_state", entity: "sensor.lux", below: 20 }]
      },
      {
        entity: "scene.movie",
        name: "Movie",
        active_when: [{ condition: "state", entity: "input_select.mode", state: "movie" }]
      },
      { entity: "scene.manual", name: "Manual" },
      { entity: "scene.missing", name: "Missing" },
      { entity: "light.unsupported", name: "Ignored" }
    ]
  };
  const hass = createHass({
    states: {
      "light.ceiling": { state: "on", attributes: {} },
      "script.relax": { state: "off", attributes: { friendly_name: "Relax script" } },
      "scene.movie": { state: "scening", attributes: {} },
      "scene.manual": { state: "unavailable", attributes: {} },
      "sensor.lux": { state: "10", attributes: {} },
      "input_select.mode": { state: "normal", attributes: {} }
    }
  });
  const card = createRenderedCard(config, hass);
  const bar = card.shadowRoot.getElementById("room-modes");
  assert.match(card.shadowRoot.querySelector("style").textContent, /\.room-modes \{[^}]*overflow-x: auto/);
  const buttons = bar.querySelectorAll(".room-mode");
  assert.deepEqual(Array.from(buttons, (button) => button.dataset.entity), ["script.relax", "scene.movie", "scene.manual", "scene.missing"]);
  assert.equal(buttons[0].classList.contains("active"), true);
  assert.equal(buttons[0].getAttribute("aria-pressed"), "true");
  assert.equal(buttons[0].style.getPropertyValue("--room-mode-color"), "#9c6cff");
  assert.equal(buttons[1].getAttribute("aria-pressed"), "false");
  assert.equal(buttons[2].hasAttribute("aria-pressed"), false);
  assert.equal(buttons[2].disabled, true);
  assert.equal(buttons[3].disabled, true);
  assert.equal(bar.hasAttribute("inert"), false);
  assert.equal(card.shadowRoot.getElementById("ctrls").hasAttribute("inert"), true);

  let bubbledClicks = 0;
  card.shadowRoot.querySelector(".container").addEventListener("click", () => { bubbledClicks += 1; });
  buttons[0].dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  buttons[0].click();
  buttons[1].click();
  buttons[3].click();
  assert.equal(bubbledClicks, 0);
  assert.deepEqual(hass.__serviceCalls, [
    { domain: "script", service: "turn_on", data: { entity_id: "script.relax" } },
    { domain: "scene", service: "turn_on", data: { entity_id: "scene.movie" } }
  ]);

  const nextHass = createHass({
    states: {
      ...hass.states,
      "sensor.lux": { state: "30", attributes: {} },
      "input_select.mode": { state: "movie", attributes: {} }
    }
  });
  card.hass = nextHass;
  assert.equal(bar.children[0].getAttribute("aria-pressed"), "false");
  assert.equal(bar.children[1].getAttribute("aria-pressed"), "true");
  assert.ok(card._getRelevantEntityIds().includes("input_select.mode"));
  assert.ok(card._getRelevantEntityIds().includes("sensor.lux"));
  card.remove();
});

test("room mode editor round-trips fields, conditions, ordering, and removal", () => {
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = createHass({
    states: {
      "scene.movie": { state: "scening", attributes: { friendly_name: "Movie" } },
      "script.relax": { state: "off", attributes: { friendly_name: "Relax" } }
    }
  });
  editor.setConfig({
    controls: [],
    room_modes: [
      { entity: "scene.movie", name: "Movie", icon: "mdi:movie", color: "#9c6cff", active_when: [{ condition: "state", entity: "input_select.mode", state: "movie" }] },
      { entity: "script.relax", name: "Relax" }
    ]
  });
  editor._roomModesSectionOpen = true;
  editor._updateRoomModesUI();
  let rows = editor.shadowRoot.querySelectorAll(".room-mode-editor");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].querySelector("ha-entity-picker").value, "scene.movie");
  assert.deepEqual(rows[0].querySelector("ha-card-conditions-editor").conditions, [{ condition: "state", entity: "input_select.mode", state: "movie" }]);

  const nameField = rows[0].querySelector("oneline-room-card-textfield");
  nameField.value = "Cinema";
  nameField.dispatchEvent(new Event("change", { bubbles: true }));
  const colorField = rows[0].querySelector(".cl-row oneline-room-card-textfield");
  colorField.value = "#112233";
  colorField.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(editor._config.room_modes[0].name, "Cinema");
  assert.equal(editor._config.room_modes[0].color, "#112233");

  const conditions = [{ condition: "numeric_state", entity: "sensor.lux", below: 30 }];
  rows[0].querySelector("ha-card-conditions-editor").dispatchEvent(new CustomEvent("value-changed", { detail: { value: conditions }, bubbles: true }));
  assert.deepEqual(editor._config.room_modes[0].active_when, conditions);

  rows[0].querySelector('.room-mode-editor-actions button[aria-label="Move mode down"]').click();
  assert.equal(editor._config.room_modes[0].entity, "script.relax");
  rows = editor.shadowRoot.querySelectorAll(".room-mode-editor");
  rows[0].querySelector('.room-mode-editor-actions button[aria-label="Remove mode"]').click();
  assert.deepEqual(editor._config.room_modes.map((mode) => mode.entity), ["scene.movie"]);
  editor.remove();
});
