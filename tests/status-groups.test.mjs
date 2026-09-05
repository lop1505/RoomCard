import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();
const { getConditionEntityDependencies, getStatusGroupResult } = await importRoomCard();

const renderCard = (config, hass) => {
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig(config);
  card.hass = hass;
  return card;
};

test("state groups count configured active entities and honor zero visibility", () => {
  const hass = createHass({ states: {
    "light.ceiling": { state: "on", attributes: { friendly_name: "Ceiling" } },
    "light.floor": { state: "off", attributes: { friendly_name: "Floor" } },
    "light.missing": { state: "unavailable", attributes: {} }
  } });
  const group = {
    entities: ["light.ceiling", "light.floor", "light.missing"],
    active_states: ["on"],
    display: "count",
    hide_when_zero: true
  };
  const result = getStatusGroupResult(group, hass);
  assert.equal(result.visible, true);
  assert.equal(result.value, "1");
  assert.deepEqual(result.contributors.map((item) => item.entity_id), ["light.ceiling"]);
  assert.equal(getStatusGroupResult({ ...group, active_states: ["playing"] }, hass).visible, false);
});

test("numeric groups normalize power units and reject incompatible measurements", () => {
  const hass = createHass({
    locale: { language: "en-US", number_format: "comma_decimal" },
    states: {
      "sensor.tv": { state: "250", attributes: { friendly_name: "TV", unit_of_measurement: "W" } },
      "sensor.pc": { state: "0.5", attributes: { friendly_name: "PC", unit_of_measurement: "kW" } },
      "sensor.temperature": { state: "21", attributes: { unit_of_measurement: "°C" } },
      "sensor.no_unit": { state: "5", attributes: {} },
      "sensor.unknown": { state: "unknown", attributes: { unit_of_measurement: "W" } }
    }
  });
  const result = getStatusGroupResult({
    entities: ["sensor.tv", "sensor.pc", "sensor.unknown"],
    aggregate: "sum",
    display: "value",
    unit: "W",
    precision: 0
  }, hass);
  assert.equal(result.numericValue, 750);
  assert.equal(result.value, "750 W");
  assert.equal(result.error, "");

  const incompatible = getStatusGroupResult({
    entities: ["sensor.tv", "sensor.temperature"],
    aggregate: "sum",
    display: "value",
    unit: "W"
  }, hass);
  assert.equal(incompatible.value, "—");
  assert.equal(incompatible.error, "status_group_incompatible_units");
  assert.equal(getStatusGroupResult({
    entities: ["sensor.tv", "sensor.no_unit"], aggregate: "sum", display: "value", unit: "W"
  }, hass).error, "status_group_incompatible_units");
});

test("status groups support conditions and expose all explicit dependencies", () => {
  const conditions = [{ condition: "state", entity: "input_boolean.dashboard", state: "on" }];
  const group = {
    entities: [{
      entity: "light.ceiling",
      conditions: [{ condition: "numeric_state", entity: "sensor.lux", below: "input_number.dark_limit" }]
    }],
    active_states: ["on"],
    conditions
  };
  const hass = createHass({ states: {
    "input_boolean.dashboard": { state: "on", attributes: {} },
    "light.ceiling": { state: "on", attributes: {} },
    "sensor.lux": { state: "10", attributes: {} },
    "input_number.dark_limit": { state: "20", attributes: {} }
  } });
  assert.equal(getStatusGroupResult(group, hass).value, "1");
  assert.deepEqual(getConditionEntityDependencies([...conditions, ...group.entities[0].conditions]).sort(), [
    "input_boolean.dashboard", "input_number.dark_limit", "sensor.lux"
  ]);
  const hidden = createHass({ states: { ...hass.states, "input_boolean.dashboard": { state: "off", attributes: {} } } });
  assert.equal(getStatusGroupResult(group, hidden).visible, false);
});

test("runtime renders neutral detail chips, isolates parent actions, and opens more-info", () => {
  const hass = createHass({ states: {
    "light.ceiling": { entity_id: "light.ceiling", state: "on", attributes: { friendly_name: "Ceiling", icon: "mdi:ceiling-light" } },
    "light.floor": { entity_id: "light.floor", state: "off", attributes: { friendly_name: "Floor" } }
  } });
  const card = renderCard({
    tap_action: { action: "toggle" },
    controls: [],
    status_groups: [{
      name: "Lights",
      icon: "mdi:lightbulb-group",
      entities: ["light.ceiling", "light.floor"],
      active_states: ["on"],
      display: "count",
      details: true
    }]
  }, hass);
  const chip = card.shadowRoot.querySelector("button.status-group-chip");
  assert.ok(chip);
  assert.equal(chip.textContent.trim(), "1");
  assert.equal(chip.getAttribute("aria-label"), "Lights: 1");
  assert.equal(card.shadowRoot.querySelector("ha-card").classList.contains("alert-sensor"), false);
  assert.ok(card._getRelevantEntityIds().includes("light.ceiling"));

  let parentClicks = 0;
  let actionDetail = null;
  card.shadowRoot.querySelector(".img-box").addEventListener("click", () => { parentClicks += 1; });
  card.addEventListener("hass-action", (event) => { actionDetail = event.detail; });
  chip.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  chip.click();
  assert.equal(parentClicks, 0);
  const dialog = card.shadowRoot.querySelector(".alert-dialog");
  assert.ok(dialog);
  assert.equal(dialog.querySelector("h2").textContent, "Lights");
  dialog.querySelector(".alert-entity-row").click();
  assert.equal(actionDetail.config.entity, "light.ceiling");
  assert.equal(card.shadowRoot.querySelector(".alert-dialog"), null);
  card.remove();
});

test("status group editor round-trips presets, fields, ordering, duplication, and removal", () => {
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = createHass({ states: {
    "light.ceiling": { state: "on", attributes: { friendly_name: "Ceiling" } },
    "sensor.power": { state: "20", attributes: { unit_of_measurement: "W" } }
  } });
  editor.setConfig({ controls: [] });
  editor._statusGroupsSectionOpen = true;
  editor._updateStatusGroupsUI();
  editor.shadowRoot.querySelector('[data-status-preset="lights"]').click();
  assert.equal(editor._config.status_groups[0].icon, "mdi:lightbulb-group");

  let rows = editor.shadowRoot.querySelectorAll(".status-group-editor");
  const entitySelector = rows[0].querySelector("ha-selector");
  entitySelector.dispatchEvent(new CustomEvent("value-changed", { detail: { value: ["light.ceiling"] }, bubbles: true }));
  assert.deepEqual(editor._config.status_groups[0].entities, ["light.ceiling"]);
  rows[0].querySelector('.room-mode-editor-actions button[aria-label="Duplicate status group"]').click();
  assert.equal(editor._config.status_groups.length, 2);
  rows = editor.shadowRoot.querySelectorAll(".status-group-editor");
  rows[0].querySelector('.room-mode-editor-actions button[aria-label="Move status group down"]').click();
  assert.equal(editor._config.status_groups[1].name, "Lights on");
  rows = editor.shadowRoot.querySelectorAll(".status-group-editor");
  rows[0].querySelector('.room-mode-editor-actions button[aria-label="Remove status group"]').click();
  assert.equal(editor._config.status_groups.length, 1);
  editor.remove();
});
