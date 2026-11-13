import assert from "node:assert/strict";
import test from "node:test";
import { createHass, installDomEnvironment, importRoomCard, wait } from "./support/dom-env.mjs";
import { roomFixture } from "./support/room-fixture.mjs";
import { deepActiveElement, getDialogCoordinator } from "../src/shared/dialog-coordinator.js";

installDomEnvironment();
await importRoomCard();
const Strategy = customElements.get("ll-strategy-section-oneline-room");
const hass = () => createHass(roomFixture());
const createAdapter = (config = {}, home = hass()) => {
  const adapter = document.createElement("oneline-room-auto-card");
  adapter.setConfig({ strategy: { area: "living", ...config } });
  adapter.hass = home;
  document.body.append(adapter); return adapter;
};
const createEditor = (config = {}, home = hass()) => {
  const editor = Strategy.getConfigElement(); editor.hass = home;
  editor.setConfig({ type: "custom:oneline-room", area: "living", ...config });
  document.body.append(editor); return editor;
};
const click = (editor, action, id) => Array.from(editor.shadowRoot.querySelectorAll("button")).find(node => node.dataset.action === action && node.dataset.entity === id).click();

test("the section strategy is discoverable, duplicate safe, previewable and produces immutable opt-in config", async () => {
  assert.ok(Strategy);
  assert.equal(window.customStrategies.filter(entry => entry.type === "oneline-room").length, 1);
  assert.deepEqual(Strategy.registryDependencies, [], "the stable adapter owns discovery without native section recreation");
  const stub = Strategy.getStubConfig(hass());
  assert.equal(stub.type, "custom:oneline-room"); assert.equal(stub.area, "living");
  const saved = JSON.stringify(stub);
  const generated = await Strategy.generate(stub, hass());
  assert.equal(generated.type, "grid");
  assert.equal(generated.cards[0].type, "custom:oneline-room-auto-card");
  assert.deepEqual(generated, await Strategy.generate(stub, hass()));
  generated.cards[0].strategy.domains.push("extra");
  assert.equal(JSON.stringify(stub), saved);
  assert.doesNotThrow(() => Strategy.getStubConfig({}));
});

test("automatic updates reuse the existing RoomCard and ignore unrelated registry and ordinary state changes", () => {
  const home = hass(); const adapter = createAdapter({}, home);
  try {
    const card = adapter._card;
    let configured = 0; const original = card.setConfig.bind(card);
    card.setConfig = config => { configured++; original(config); };
    const updated = { ...home, states: { ...home.states, "light.a": { ...home.states["light.a"], state: "on" } } };
    adapter.hass = updated;
    assert.equal(adapter._card, card); assert.equal(configured, 0);
    adapter.hass = { ...updated, areas: { ...home.areas, bedroom: { name: "Renamed elsewhere" } } };
    assert.equal(configured, 0);
    adapter.hass = { ...updated, entities: { ...home.entities, "light.new": { entity_id: "light.new", area_id: "living" } } };
    assert.equal(adapter._card, card); assert.equal(configured, 1);
    assert.ok(card.config.controls.some(control => control.entity === "light.new"));
    assert.deepEqual(home.__serviceCalls, []);
  } finally { adapter.remove(); }
});

test("device membership and room renames retain the drawer, focus, scroll and collapse state", () => {
  const home = hass();
  const adapter = createAdapter({ card: { collapsible: true, default_state: "expanded", detail_drawer: { enabled: true }, controls: [{ entity: "light.a", display_in: "both", name: "Pinned" }] } }, home);
  try {
    const card = adapter._card;
    card._toggleCollapse();
    card.shadowRoot.getElementById("details-btn").click();
    const drawer = card._detailDrawer;
    drawer.content.scrollTop = 88;
    const close = drawer.root.querySelector(".close"); close.focus();
    const next = { ...home, areas: { ...home.areas, living: { ...home.areas.living, name: "Renamed living room" } }, entities: { ...home.entities, "light.new": { entity_id: "light.new", area_id: "living" } } };
    adapter.hass = next;
    assert.equal(adapter._card, card); assert.equal(card._detailDrawer, drawer);
    assert.equal(card._collapsed, true); assert.equal(drawer.content.scrollTop, 88);
    assert.equal(deepActiveElement(), close);
    assert.equal(card.config.name, "Renamed living room");
    assert.equal(card.config.controls[0].display_in, "both");
    assert.equal(card.config.controls[0].name, "Pinned");
    const removedClimate = { ...next.entities }; delete removedClimate["climate.heating"];
    adapter.hass = { ...next, entities: removedClimate };
    assert.equal(card.config.entity, undefined);
    assert.equal(card._collapsed, true, "automatic climate selection cannot change the room's collapse key");
    assert.equal(card._detailDrawer, drawer);
  } finally { adapter.remove(); localStorage.clear(); }
  assert.equal(document.querySelector("[data-room-card-drawer]"), null);
  assert.equal(getDialogCoordinator().size, 0);
});

test("deleting and restoring an area shows a message, cleans dialogs and never widens discovery", () => {
  const home = hass(); const adapter = createAdapter({ card: { detail_drawer: { enabled: true } } }, home);
  try {
    const card = adapter._card; card.shadowRoot.getElementById("details-btn").click();
    adapter.hass = { ...home, areas: { bedroom: home.areas.bedroom } };
    assert.equal(card.isConnected, false);
    assert.match(adapter.shadowRoot.textContent, /no longer exists/);
    assert.equal(document.querySelector("[data-room-card-drawer]"), null);
    adapter.hass = home;
    assert.equal(adapter._card, card); assert.equal(card.isConnected, true);
  } finally { adapter.remove(); }
});

test("native drawer control focus survives structural discovery changes", () => {
  const home = hass();
  home.states["media_player.radio"] = { entity_id: "media_player.radio", state: "playing", attributes: { supported_features: 65535, volume_level: 0.3 } };
  const adapter = createAdapter({ card: { detail_drawer: { enabled: true }, controls: [{ entity: "media_player.radio", display_in: "both", control_mode: "full" }] } }, home);
  try {
    const card = adapter._card; card.shadowRoot.getElementById("details-btn").click();
    const range = card._detailDrawer.surface.controls.querySelector('input[type="range"]');
    assert.ok(range); range.focus();
    adapter.hass = { ...home, entities: { ...home.entities, "light.new": { entity_id: "light.new", area_id: "living" } } };
    const replacement = card._detailDrawer.surface.controls.querySelector('input[type="range"]');
    assert.equal(deepActiveElement(), replacement);
    assert.equal(replacement.value, range.value);
  } finally { adapter.remove(); }
});

test("late device-class information updates header discovery without replacing the card", () => {
  const home = hass(); home.states["sensor.temp"].attributes.device_class = undefined;
  const adapter = createAdapter({}, home);
  try {
    const card = adapter._card; assert.equal(card.config.temp_sensor, undefined);
    adapter.hass = { ...home, states: { ...home.states, "sensor.temp": { ...home.states["sensor.temp"], attributes: { device_class: "temperature" } } } };
    assert.equal(adapter._card, card); assert.equal(card.config.temp_sensor, "sensor.temp");
  } finally { adapter.remove(); }
});

test("the strategy editor customizes and excludes entities without saving the generated entity list", () => {
  const editor = createEditor(); const received = [];
  editor.addEventListener("config-changed", event => received.push(event.detail.config));
  try {
    click(editor, "customize", "light.a");
    assert.equal(received.length, 1);
    assert.deepEqual(editor._config.card.controls.map(control => control.entity), ["light.a"]);
    click(editor, "exclude", "light.z");
    assert.deepEqual(editor._config.exclude_entities, ["light.z"]);
    click(editor, "restore", "light.z");
    assert.deepEqual(editor._config.exclude_entities, []);
    const checkbox = editor.shadowRoot.querySelector('[data-domain="switch"]');
    checkbox.checked = false; checkbox.dispatchEvent(new Event("change"));
    assert.ok(!editor._config.domains.includes("switch"));
    assert.equal(editor._config.type, "custom:oneline-room");
    assert.equal(editor._config.card.type, undefined);
    assert.equal(editor._config.card.entity, undefined, "derived climate is not saved");
    assert.equal(editor._config.card.name, undefined, "derived room name is not saved");
  } finally { editor.remove(); }
});

test("nested card edits emit a single strategy event and retain appearance, actions and drawer settings on reopen", async () => {
  const editor = createEditor({ card: { image_preset: "kitchen", detail_drawer: { enabled: true }, controls: [{ entity: "light.a", display_in: "drawer" }] } });
  const received = []; editor.addEventListener("config-changed", event => received.push(event.detail.config));
  try {
    editor._cardEditor._fire({ ...editor._cardEditor._config, controls: [{ entity: "light.a", display_in: "both", tap_action: { action: "none" } }] });
    await wait(120);
    assert.equal(received.length, 1);
    assert.equal(received[0].type, "custom:oneline-room");
    assert.equal(received[0].card.image_preset, "kitchen");
    assert.equal(received[0].card.controls[0].display_in, "both");
    const reopened = createEditor(received[0]);
    assert.deepEqual(reopened._config, received[0]); reopened.remove();
  } finally { editor.remove(); }
});

test("live preview off defers area and nested card edits and flushes both on the same Save", () => {
  const editor = createEditor(); const received = [];
  editor.addEventListener("config-changed", event => received.push(event.detail.config));
  try {
    const toggle = editor._cardEditor.shadowRoot.getElementById("live-preview-toggle");
    toggle.checked = false; toggle.dispatchEvent(new Event("change"));
    assert.equal(editor._livePreview, false);
    editor._cardEditor._fire({ ...editor._cardEditor._config, name: "My room" });
    const area = editor.shadowRoot.getElementById("room-area"); area.value = "bedroom"; area.dispatchEvent(new Event("change"));
    assert.equal(received.length, 0);
    assert.equal(editor._config.card.name, "My room");
    const save = document.createElement("button"); save.setAttribute("slot", "primaryAction");
    editor._handleSave({ composedPath: () => [save] });
    assert.equal(received.length, 1); assert.equal(received[0].area, "bedroom");
    assert.equal(received[0].card.name, "My room");
    assert.equal(editor._pending, false);
  } finally { editor.remove(); }
});

test("enabling live preview flushes pending section changes once, registry updates never emit config writes", () => {
  const editor = createEditor(); const received = [];
  editor.addEventListener("config-changed", event => received.push(event.detail.config));
  try {
    const toggle = editor._cardEditor.shadowRoot.getElementById("live-preview-toggle");
    toggle.checked = false; toggle.dispatchEvent(new Event("change"));
    editor._change({ auto_sensors: false });
    assert.equal(received.length, 0);
    toggle.checked = true; toggle.dispatchEvent(new Event("change"));
    assert.equal(received.length, 1); assert.equal(received[0].auto_sensors, false);
    editor.hass = { ...editor.hass, entities: { ...editor.hass.entities, "light.new": { entity_id: "light.new", area_id: "living" } } };
    assert.equal(received.length, 1);
    assert.ok(editor.shadowRoot.querySelector('[data-entity="light.new"]'));
  } finally { editor.remove(); }
});

test("localization and untrusted registry text use text nodes, missing areas and malformed lists stay editable", () => {
  const home = hass(); home.language = "de-DE"; home.areas.living.name = '<img src=x onerror="bad()">';
  home.states["light.a"].attributes.friendly_name = '<script>bad()</script>';
  const editor = createEditor({ card: { controls: {} } }, home);
  try {
    assert.ok(editor.shadowRoot.textContent.includes("Automatische Bedienelemente"));
    assert.equal(editor.shadowRoot.querySelector("script,img"), null);
    assert.ok(editor.shadowRoot.textContent.includes("<script>bad()</script>"));
    editor.setConfig({ type: "custom:oneline-room", area: "deleted" });
    assert.match(editor.shadowRoot.textContent, /existiert nicht mehr/);
    assert.equal(editor.shadowRoot.getElementById("room-area").value, "deleted");
  } finally { editor.remove(); }
});

test("drawer preview connects the nested editor to its existing automatic section preview", () => {
  const dialog = document.createElement("hui-dialog-edit-section"); document.body.append(dialog);
  const root = dialog.attachShadow({ mode: "open" });
  const adapter = document.createElement("oneline-room-auto-card");
  adapter.setConfig({ strategy: { area: "living", card: { detail_drawer: { enabled: true } } } });
  adapter.hass = hass(); root.append(adapter);
  const editor = createEditor({ card: { detail_drawer: { enabled: true } } }); root.append(editor);
  try {
    editor._cardEditor.shadowRoot.getElementById("drawer-preview").click();
    assert.ok(adapter._card._detailDrawer);
    assert.equal(root.querySelectorAll("oneline-room-auto-card").length, 1);
  } finally { dialog.remove(); }
  assert.equal(document.querySelector("[data-room-card-drawer]"), null);
});

test("language changes preserve unsaved manual settings, and another dialog's Save cannot flush them", () => {
  const dialog = document.createElement("hui-dialog-edit-section"); document.body.append(dialog);
  const root = dialog.attachShadow({ mode: "open" });
  const editor = createEditor(); root.append(editor);
  const received = []; editor.addEventListener("config-changed", event => received.push(event.detail.config));
  try {
    const toggle = editor._cardEditor.shadowRoot.getElementById("live-preview-toggle");
    toggle.checked = false; toggle.dispatchEvent(new Event("change"));
    editor._cardEditor._fire({ ...editor._cardEditor._config, name: "Not saved yet" });
    editor.hass = { ...editor.hass, language: "fr" };
    assert.equal(received.length, 0);
    const save = document.createElement("button"); save.setAttribute("slot", "primaryAction");
    editor._handleSave({ composedPath: () => [save] });
    assert.equal(received.length, 0);
    editor._handleSave({ composedPath: () => [save, dialog] });
    assert.equal(received.length, 1);
    assert.equal(received[0].card.name, "Not saved yet");
    assert.equal(received[0].type, "custom:oneline-room");
  } finally { dialog.remove(); }
});
