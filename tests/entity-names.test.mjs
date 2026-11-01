import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { createHass, importRoomCard, installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();
const { getStatusGroupResult } = await importRoomCard();
afterEach(() => document.body.replaceChildren());
const id = "sensor.temperature";
const makeHass = () => createHass({
  states: Object.fromEntries([
    [id, "21"], ["binary_sensor.window", "on"], ["binary_sensor.presence", "on"], ["scene.movie", "scening"]
  ].map(([entity_id, state]) => [entity_id, { entity_id, state, attributes: { friendly_name: "Legacy " + entity_id } }])),
  entities: { [id]: { name: "Temperature", device_id: "thermostat" } },
  devices: { thermostat: { name: "Thermostat", area_id: "living" } },
  areas: { living: { name: "Living room", floor_id: "ground" } },
  floors: { ground: { name: "Ground floor" } },
  formatEntityName(state) {
    const entity = this.entities?.[state.entity_id];
    const device = this.devices?.[entity?.device_id];
    const area = this.areas?.[entity?.area_id || device?.area_id];
    const floor = this.floors?.[area?.floor_id];
    return [floor?.name, area?.name, device?.name, entity?.name || `HA ${state.entity_id}`].filter(Boolean).join(" · ");
  }
});
const renderCard = (config, hass = makeHass()) => {
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig({ controls: [], ...config });
  card.hass = hass;
  return card;
};

test("HA names appear on controls, header chips, modes, summaries and both card surfaces", () => {
  const hass = makeHass();
  const expected = hass.formatEntityName(hass.states[id]);
  const card = renderCard({
    detail_drawer: { enabled: true },
    controls: [{ entity: id, display_in: "both" }, { entity: id, name: "Custom" }, { entity: id, name: "" }],
    header_badges: [{ entity: id }, { entity: id, label: "Custom badge" }],
    window_sensors: ["binary_sensor.window"],
    presence_sensor: "binary_sensor.presence",
    alert_sensors: [{ entity: "binary_sensor.window", state: "on" }],
    room_modes: [{ entity: "scene.movie" }],
    status_groups: [{ entities: [id], display: "value", details: true }]
  }, hass);
  assert.deepEqual(Array.from(card.shadowRoot.querySelectorAll(".btn-name"), node => node.textContent), [expected, "Custom", ""]);
  assert.match(card.shadowRoot.textContent, /Custom badge: 21/);
  assert.ok(card.shadowRoot.textContent.includes(expected + ": 21"));
  assert.ok(card.shadowRoot.textContent.includes("HA binary_sensor.window"));
  assert.ok(card.shadowRoot.textContent.includes("HA binary_sensor.presence"));
  assert.equal(card.shadowRoot.querySelector(".room-mode span").textContent, "HA scene.movie");
  assert.equal(getStatusGroupResult({ entities: [id], display: "value" }, hass).contributors[0].friendly_name, expected);
  card.shadowRoot.querySelector(".status-group-chip").click();
  assert.equal(card.shadowRoot.querySelector(".alert-entity-row .alert-entity-name").textContent, expected);
  card._closeDialog();
  card._showDetailDrawer();
  assert.equal(card._detailDrawer.surface.root.querySelector(".btn-name").textContent, expected);
  card.remove();
});

test("registry-only entity/device/area/floor renames update names and skip unrelated updates", () => {
  for (const [registry, key] of [["entities", id], ["devices", "thermostat"], ["areas", "living"], ["floors", "ground"]]) {
    const hass = makeHass();
    const card = renderCard({ controls: [{ entity: id, display_in: "both" }], detail_drawer: { enabled: true } }, hass);
    card._showDetailDrawer();
    let renders = 0;
    const update = card._updateContentState.bind(card);
    card._updateContentState = () => { renders++; update(); };
    const renamed = { ...hass, [registry]: { ...hass[registry], [key]: { ...hass[registry][key], name: "Renamed" } } };
    card.hass = renamed;
    assert.equal(renders, 1, registry);
    const expected = renamed.formatEntityName(renamed.states[id]);
    assert.equal(card.shadowRoot.querySelector(".btn-name").textContent, expected);
    assert.equal(card._detailDrawer.surface.root.querySelector(".btn-name").textContent, expected);
    card.hass = { ...renamed, states: { ...renamed.states, "sensor.unrelated": { state: "42", attributes: {} } },
      devices: { ...renamed.devices, unrelated: { name: "Unrelated device" } } };
    assert.equal(renders, 1, "unrelated state/registry changes stay filtered");
    card.remove();
  }
});

test("sparkline dialog names follow HA defaults and retain an explicit control name", () => {
  const hass = makeHass();
  const card = renderCard({ controls: [{ entity: id }] }, hass);
  const trigger = card.shadowRoot.querySelector(".btn");
  card._showSparklineDialog(id, 24, trigger);
  assert.ok(card.shadowRoot.querySelector("#sparkline-dialog-title").textContent.startsWith(hass.formatEntityName(hass.states[id])));
  card._closeDialog();
  card._showSparklineDialog(id, 24, trigger, "Custom history");
  assert.ok(card.shadowRoot.querySelector("#sparkline-dialog-title").textContent.startsWith("Custom history"));
  card.remove();
});

test("the editor keeps default names dynamic and preserves user names when selecting an entity", () => {
  const hass = makeHass();
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = hass;
  editor._badgesSectionOpen = true;
  editor.setConfig({ controls: [{ entity: id }, { entity: id, name: "Custom" }],
    window_sensors: [id], header_badges: [{ entity: id }], room_modes: [{ entity: "scene.movie" }],
    alert_sensors: [{ entity: id, above: 1 }] });
  assert.equal("name" in editor._buildControlFromTemplate(editor._getTemplateById("sensor"), id), false);
  assert.equal(editor.shadowRoot.querySelector(".summary-text").textContent, "#1 — " + hass.formatEntityName(hass.states[id]));
  let rebuilds = 0;
  const renBtn = editor.renBtn.bind(editor);
  editor.renBtn = () => { rebuilds++; renBtn(); };
  editor.hass = { ...hass, devices: { ...hass.devices, unrelated: { name: "Unrelated" } } };
  assert.equal(rebuilds, 0);
  const renamed = { ...hass, devices: { thermostat: { ...hass.devices.thermostat, name: "Renamed" } } };
  editor.hass = renamed;
  assert.equal(rebuilds, 1);
  const expected = renamed.formatEntityName(renamed.states[id]);
  assert.equal(editor.shadowRoot.querySelector(".summary-text").textContent, "#1 — " + expected);
  assert.equal(editor.shadowRoot.querySelector(".nm").placeholder, expected);
  assert.equal(editor.shadowRoot.querySelector("#badges-list oneline-room-card-textfield").placeholder, expected);
  assert.equal(editor.shadowRoot.querySelector("#window-labels-list input").placeholder, expected);
  assert.equal(editor.shadowRoot.querySelector("#alert-sensors-list .badge-entity-label").textContent, expected);
  const picker = editor.shadowRoot.querySelectorAll(".box .ep")[1];
  picker.dispatchEvent(new CustomEvent("value-changed", { detail: { value: "binary_sensor.window" }, bubbles: true }));
  assert.equal(editor._config.controls[1].name, "Custom");
  assert.equal("name" in editor._config.controls[0], false);
  editor.remove();
});
