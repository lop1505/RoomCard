import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";

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

test("numeric groups sum unitless template states and use a configured display unit", () => {
  const hass = createHass({ states: {
    "sensor.position": { state: "65", attributes: {} },
    "sensor.other": { state: "15", attributes: {} },
    "sensor.invalid": { state: "not a number", attributes: {} },
    "sensor.offline": { state: "unavailable", attributes: {} }
  } });
  const group = {
    entities: ["sensor.position", "sensor.invalid", "sensor.offline", "sensor.missing"],
    display: "value", aggregate: "sum", unit: "%", precision: 1,
    hide_when_zero: false
  };
  const result = getStatusGroupResult(group, hass);
  assert.equal(result.value, "65 %");
  assert.equal(result.numericValue, 65);
  assert.equal(result.error, "");
  assert.deepEqual(result.contributors.map(item => item.entity_id), ["sensor.position"]);
  assert.equal(getStatusGroupResult({ ...group, entities: ["sensor.position", "sensor.other"] }, hass).value, "80 %");
  assert.equal(getStatusGroupResult({ ...group, unit: "" }, hass).value, "65");
  assert.equal(getStatusGroupResult({ ...group, entities: [], hide_when_zero: true }, hass).visible, false);

  const card = renderCard({ controls: [], status_groups: [group] }, hass);
  assert.equal(card.shadowRoot.querySelector(".status-group-chip").textContent.trim(), "65 %");
  card.hass = createHass({ states: { ...hass.states, "sensor.position": { state: "70", attributes: {} } } });
  assert.equal(card.shadowRoot.querySelector(".status-group-chip").textContent.trim(), "70 %");
  card.remove();
});

test("switching from a count preset to numeric sum ignores the hidden active-state filter", () => {
  const hass = createHass({ states: { "sensor.position": { state: "65", attributes: {} } } });
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = hass;
  editor.setConfig({ controls: [], status_groups: [{ entities: ["sensor.position"], display: "count", active_states: ["on"] }] });
  const display = editor.shadowRoot.querySelector(".status-group-editor select");
  display.value = "value";
  display.dispatchEvent(new Event("change", { bubbles: true }));
  const group = editor._config.status_groups[0];
  assert.equal(getStatusGroupResult(group, hass).numericValue, 65);
  assert.deepEqual(group.active_states, ["on"], "count filter stays available when switching back");
  assert.equal(getStatusGroupResult({ ...group, display: "count", aggregate: undefined }, hass).value, "0");
  editor.remove();
});

test("numeric groups distinguish missing numbers from a real zero", () => {
  const group = { entities: ["cover.shutter"], aggregate: "sum", display: "value", unit: "%", hide_when_zero: true };
  for (const state of ["open", "closed", "unknown", "unavailable", "", " ", null, false, [], {}]) {
    const result = getStatusGroupResult(group, createHass({ states: { "cover.shutter": { state, attributes: { current_position: 94 } } } }));
    assert.equal(result.value, "—", `invalid numeric state ${JSON.stringify(state)}`);
    assert.equal(result.visible, true);
    assert.equal(result.error, "status_group_no_numeric_values");
    assert.ok(Number.isNaN(result.numericValue));
  }
  assert.equal(getStatusGroupResult(group, createHass()).value, "—");
  const zeroHass = createHass({ states: { "cover.shutter": { state: "0", attributes: {} } } });
  assert.equal(getStatusGroupResult({ ...group, hide_when_zero: false }, zeroHass).value, "0 %");
  assert.equal(getStatusGroupResult(group, zeroHass).visible, false);
});

test("numeric groups can explicitly sum cover attributes without borrowing the entity-state unit", () => {
  const group = { entities: ["cover.shutter", "cover.other"], aggregate: "sum", display: "value", attribute: "current_position", unit: "%", active_states: ["on"] };
  const hass = createHass({ states: {
    "cover.shutter": { state: "open", attributes: { current_position: 94 } },
    "cover.other": { state: "closed", attributes: { current_position: 0, unit_of_measurement: "W" } }
  } });
  const result = getStatusGroupResult(group, hass);
  assert.equal(result.value, "94 %");
  assert.equal(result.contributors.length, 2);
  assert.equal(result.contributors[0].number, 94);
  assert.equal(result.contributors[0].state, "94");
  assert.equal(getStatusGroupResult({ ...group, attribute: "missing" }, hass).value, "—");
  assert.equal(getStatusGroupResult({ ...group, attribute: undefined }, hass).value, "—");
  for (const value of [null, false, "", " ", [], {}, Infinity]) {
    const invalid = createHass({ states: { "cover.shutter": { state: "open", attributes: { current_position: value } } } });
    assert.equal(getStatusGroupResult(group, invalid).value, "—");
  }
});

test("attribute-based status chips update when only the selected attribute changes", () => {
  for (const attribute of ["current_position", "custom_reading"]) {
    const group = { entities: ["cover.shutter"], display: "value", attribute, unit: "%", details: true };
    const hass = createHass({ states: { "cover.shutter": { state: "open", attributes: { [attribute]: 94 } } } });
    const card = renderCard({ controls: [], status_groups: [group] }, hass);
    assert.equal(card.shadowRoot.querySelector(".status-group-chip").textContent.trim(), "94 %");
    card.hass = createHass({ states: { "cover.shutter": { state: "open", attributes: { [attribute]: 42 } } } });
    assert.equal(card.shadowRoot.querySelector(".status-group-chip").textContent.trim(), "42 %");
    card.setConfig({ controls: [], status_groups: [{ ...group, attribute: undefined }] });
    const chip = card.shadowRoot.querySelector(".status-group-chip");
    assert.equal(chip.textContent.trim(), "—");
    assert.equal(chip.title, "No numeric values. Select a numeric entity or attribute.");
    card.remove();
  }
});

test("status editor round-trips the numeric attribute through mode changes and removal", () => {
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = createHass({ states: { "cover.shutter": { state: "open", attributes: { current_position: 94, custom_reading: 42 } } } });
  editor.setConfig({ controls: [], status_groups: [{ entities: ["cover.shutter"], display: "value", attribute: "current_position", unit: "%" }] });
  const field = () => editor.shadowRoot.querySelector(".status-group-value-source");
  assert.equal(field().value, "current_position");
  const selectMode = mode => {
    const select = editor.shadowRoot.querySelector(".status-group-editor select");
    select.value = mode;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
  selectMode("count");
  assert.equal(editor._config.status_groups[0].attribute, "current_position");
  assert.equal(field().parentElement.style.display, "none");
  selectMode("value");
  assert.equal(field().value, "current_position");
  field().value = "custom_reading";
  field().dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(editor._config.status_groups[0].attribute, "custom_reading");
  field().value = "";
  field().dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal("attribute" in editor._config.status_groups[0], false);
  editor.remove();
});

test("the editor suggests Position for covers on user actions and shows readable source labels", () => {
  const hass = createHass({ language: "de", states: {
    "cover.shutter": { state: "open", attributes: { current_position: 94, current_tilt_position: 50, supported_features: 15 } }
  } });
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = hass;
  editor.setConfig({ controls: [], status_groups: [{ entities: ["cover.shutter"], display: "count" }] });
  assert.equal("attribute" in editor._config.status_groups[0], false, "opening the editor does not rewrite existing config");
  const display = editor.shadowRoot.querySelector(".status-group-editor select");
  display.value = "value";
  display.dispatchEvent(new Event("change", { bubbles: true }));
  let source = editor.shadowRoot.querySelector(".status-group-value-source");
  assert.equal(source.getAttribute("aria-label"), "Wertequelle");
  assert.equal(source.value, "current_position");
  assert.ok(Array.from(source.options).some(option => option.textContent === "Position (%) (empfohlen)"));
  assert.ok(Array.from(source.options).some(option => option.textContent === "Neigung (%)"));
  assert.equal(source.textContent.includes("current_position"), false);
  assert.equal(source.textContent.includes("supported features"), false);
  assert.equal(editor._config.status_groups[0].unit, "%");
  assert.equal(getStatusGroupResult(editor._config.status_groups[0], hass).value, "94 %");
  assert.match(editor.shadowRoot.querySelector(".status-group-source-help").textContent, /6% geschlossen/);

  editor.setConfig({ controls: [], status_groups: [{ entities: [], display: "value" }] });
  const picker = editor.shadowRoot.querySelector(".status-group-editor ha-selector");
  picker.dispatchEvent(new CustomEvent("value-changed", { detail: { value: ["cover.shutter"] }, bubbles: true }));
  assert.equal(editor.shadowRoot.querySelector(".status-group-editor ha-selector"), picker, "updating source choices preserves the open entity picker");
  source = editor.shadowRoot.querySelector(".status-group-value-source");
  assert.equal(source.value, "current_position");
  assert.equal(editor.shadowRoot.querySelector(".status-group-unit").value, "%");
  editor.remove();
});

test("source choices use HA attribute labels, offer shared numeric attributes and refresh without config edits", () => {
  const makeStates = (extra = {}) => Object.fromEntries(["sensor.a", "sensor.b"].map(entity_id => [entity_id, {
    entity_id, state: "10", attributes: { measurement: 12, zero: 0, supported_features: 15, text: "hello", empty: "", flag: false,
      ...(entity_id === "sensor.a" ? { only_a: 3 } : {}), ...extra }
  }]));
  const hass = createHass({ states: makeStates(), formatEntityAttributeName(state, key) {
    assert.ok(state.entity_id);
    return `${this.language}: ${key}`;
  } });
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = hass;
  editor.setConfig({ controls: [], status_groups: [{ entities: ["sensor.a", "sensor.b"], display: "value" }] });
  const source = editor.shadowRoot.querySelector(".status-group-value-source");
  assert.deepEqual(Array.from(source.options, option => option.value), ["", "measurement", "zero"]);
  assert.equal(source.options[1].textContent, "en: measurement");
  const snapshot = JSON.stringify(editor._config);
  editor.hass = { ...hass, states: makeStates({ added: 42 }) };
  assert.equal(editor.shadowRoot.querySelector(".status-group-value-source"), source);
  assert.ok(Array.from(source.options).some(option => option.value === "added"));
  assert.equal(JSON.stringify(editor._config), snapshot);
  source.value = "added";
  source.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(editor._config.status_groups[0].attribute, "added");
  assert.equal(getStatusGroupResult(editor._config.status_groups[0], editor._hass).numericValue, 84);
  editor.remove();
});

test("unavailable YAML attributes remain selectable and source changes honor deferred saving", async () => {
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = createHass();
  editor.setConfig({ controls: [], status_groups: [{ entities: ["sensor.missing"], display: "value", attribute: "custom_reading" }] });
  let source = editor.shadowRoot.querySelector(".status-group-value-source");
  assert.equal(source.value, "custom_reading");
  assert.match(source.options[1].textContent, /not available for all selected entities/);
  assert.equal(editor._config.status_groups[0].attribute, "custom_reading");
  const received = [];
  editor.addEventListener("config-changed", event => received.push(event.detail.config));
  editor._livePreview = false;
  source.value = "";
  source.dispatchEvent(new Event("change", { bubbles: true }));
  await wait(120);
  assert.equal(received.length, 0);
  assert.equal("attribute" in editor._pendingConfig.status_groups[0], false);
  editor._flushPendingConfig();
  assert.equal(received.length, 1);
  assert.equal("attribute" in received[0].status_groups[0], false);
  source = editor.shadowRoot.querySelector(".status-group-value-source");
  assert.equal(source.value, "");
  editor.remove();
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
