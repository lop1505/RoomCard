import assert from "node:assert/strict";
import test from "node:test";
import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";
import { getControlPlacement, isControlInContext } from "../src/lib/control-placement.js";
import { deepActiveElement } from "../src/shared/dialog-coordinator.js";

installDomEnvironment();
await importRoomCard();
const state = (value, attributes = {}) => ({ state: value, attributes });
const createCard = (config, hass = createHass(), parent = document.body) => {
  const card = document.createElement("oneline-room-card");
  card.setConfig({ name: "Test room", controls: [], detail_drawer: { enabled: true }, ...config });
  card.hass = hass; parent.append(card); return card;
};
const open = card => card.shadowRoot.getElementById("details-btn").click();
const entities = controls => Array.from(controls.children, node => node.dataset.entity);
const drawer = card => card._detailDrawer.surface;
const change = (node, value) => node.dispatchEvent(new CustomEvent("value-changed", { detail: { value }, bubbles: true }));

test("placement validates values and disabled drawer falls back to card", () => {
  for (const value of [undefined, null, "", "unknown", false]) assert.equal(getControlPlacement({ display_in: value }), "card");
  for (const placement of ["card", "drawer", "both"]) {
    assert.equal(isControlInContext({ display_in: placement }, {}, "card"), true);
    assert.equal(isControlInContext({ display_in: placement }, {}, "drawer"), false);
  }
  assert.equal(isControlInContext({ display_in: "drawer" }, { detail_drawer: { enabled: "true" } }, "card"), true);
});

test("independent render contexts retain order, visibility, hide and disabled fallback", () => {
  const hass = createHass({ states: { "input_boolean.visible": state("off") } });
  const config = { controls: [
    { entity: "light.card" }, { entity: "light.drawer", display_in: "drawer" },
    { entity: "light.both", display_in: "both" }, { entity: "light.invalid", display_in: "invalid" },
    { entity: "light.hidden", display_in: "both", hide: true },
    { entity: "light.conditional", display_in: "both", visibility: [{ condition: "state", entity: "input_boolean.visible", state: "on" }] }
  ] };
  const card = createCard(config, hass);
  assert.deepEqual(entities(card.controls), ["light.card", "light.both", "light.invalid"]);
  const original = card.controls.children[1]; open(card);
  assert.equal(card.controls.children[1], original, "opening never moves or rebuilds card controls");
  assert.deepEqual(entities(drawer(card).controls), ["light.drawer", "light.both"]);
  assert.notEqual(drawer(card).controls.children[1], original);
  card.hass = { ...hass, states: { "input_boolean.visible": state("on") } };
  assert.equal(entities(drawer(card).controls).at(-1), "light.conditional");
  card.setConfig({ ...card.config, detail_drawer: { enabled: false } });
  assert.equal(card._detailDrawer, null);
  assert.deepEqual(entities(card.controls), ["light.card", "light.drawer", "light.both", "light.invalid", "light.conditional"]);
  card.remove();
});

test("both contexts emit one action/service, update together and suppress unavailable controls", () => {
  const hass = createHass({ states: { "input_select.mode": state("Day", { options: ["Day", "Night"] }) } });
  const card = createCard({ controls: [{ entity: "input_select.mode", display_in: "both" }] }, hass);
  const events = []; card.addEventListener("hass-action", event => events.push(event.detail));
  open(card);
  for (const surface of [card._cardSurface, drawer(card)]) {
    const control = surface.controls.firstElementChild;
    control.click(); assert.equal(events.length, 1); events.length = 0;
    const select = control.querySelector("select");
    select.value = "Night";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    assert.deepEqual(hass.__serviceCalls.pop(), { domain: "input_select", service: "select_option", data: { entity_id: "input_select.mode", option: "Night" } });
    assert.equal(hass.__serviceCalls.length, 0);
    assert.equal(events.length, 0);
  }
  card.hass = { ...hass, states: { "input_select.mode": state("Night", { options: ["Day", "Night"] }) } };
  for (const surface of [card._cardSurface, drawer(card)]) assert.equal(surface.controls.querySelector("select").value, "Night");
  card.hass = { ...hass, states: { "input_select.mode": state("unavailable") } };
  for (const surface of [card._cardSurface, drawer(card)]) {
    assert.equal(surface.controls.firstElementChild.getAttribute("aria-disabled"), "true");
    surface.controls.firstElementChild.click();
  }
  assert.equal(events.length, 0);
  card.remove();
});

test("drawer has independent header/image/info/status/modes and remains expanded", () => {
  const hass = createHass({ states: { "sensor.temperature": state("20", { unit_of_measurement: "°C" }), "light.reading": state("on"), "scene.movie": state("scening") } });
  const card = createCard({ name: "Room", image: "/local/room.jpg", temp_sensor: "sensor.temperature", collapsible: true, default_state: "collapsed", remember_state: false,
    status_groups: [{ name: "Lights", type: "count", entities: ["light.reading"], active_states: ["on"], details: true }],
    room_modes: [{ entity: "scene.movie", name: "Movie" }], controls: [{ entity: "light.reading", display_in: "both" }]
  }, hass);
  open(card);
  const root = drawer(card).root;
  assert.equal(root.getElementById("bg").getAttribute("src"), "/local/room.jpg");
  assert.equal(root.getElementById("name").innerText, "Room");
  assert.ok(root.getElementById("info").textContent.includes("20"));
  assert.ok(root.getElementById("chips").querySelector("button.status-group-chip"));
  root.querySelector(".room-mode").click();
  assert.deepEqual(hass.__serviceCalls, [{ domain: "scene", service: "turn_on", data: { entity_id: "scene.movie" } }]);
  assert.equal(card.controls.hasAttribute("inert"), true);
  assert.equal(drawer(card).controls.hasAttribute("inert"), false);
  assert.equal(root.getElementById("details-btn").hidden, true, "no recursive drawer button");
  const host = card._detailDrawer.host;
  card.setConfig({ ...card.config, name: "Renamed", image: "/local/new.jpg" });
  assert.equal(card._detailDrawer.host, host);
  assert.equal(root.getElementById("name").innerText, "Renamed");
  assert.equal(root.getElementById("bg").getAttribute("src"), "/local/new.jpg");
  card.remove();
});

test("drawer-only sparklines fetch only while open; both contexts share pending data and one timer", async () => {
  let calls = 0, resolveRequest;
  const entity = "sensor.drawer_only_history";
  const hass = createHass({ states: { [entity]: state("4", { unit_of_measurement: "W" }) }, callWS: () => { calls++; return new Promise(resolve => { resolveRequest = resolve; }); } });
  const card = createCard({ controls: [{ entity, display_in: "drawer", show_sparkline: true, sparkline_detail: true }] }, hass);
  await wait(); assert.equal(calls, 0); assert.equal(card._sparklineInterval, null);
  open(card); await wait(); assert.equal(calls, 1); assert.ok(card._sparklineInterval);
  card.setConfig({ ...card.config, controls: [{ ...card.config.controls[0], display_in: "both" }] });
  await wait(); assert.equal(calls, 1);
  resolveRequest({ [entity]: [{ s: "2", lu: Date.now() / 1000 - 60 }, { s: "4", lu: Date.now() / 1000 }] });
  await wait();
  for (const surface of [card._cardSurface, drawer(card)]) assert.ok(surface.controls.querySelector(".btn-sparkline svg polyline"));
  card._detailDrawer.close();
  assert.ok(card._sparklineInterval, "card's shared control retains polling");
  card.setConfig({ ...card.config, controls: [{ ...card.config.controls[0], display_in: "drawer" }] });
  assert.equal(card._sparklineInterval, null);
  await card._refreshSparklineData(); assert.equal(calls, 1);
  card.remove();
});

test("hidden drawer controls do not request history and queued holds are disposed on close", async () => {
  let calls = 0;
  const hass = createHass({ states: { "sensor.hidden_drawer": state("1"), "light.hold": state("on") }, callWS: async () => { calls++; return {}; } });
  const card = createCard({ controls: [
    { entity: "sensor.hidden_drawer", display_in: "drawer", show_sparkline: true, hide: true },
    { entity: "light.hold", display_in: "drawer" }
  ] }, hass);
  const actions = []; card.addEventListener("hass-action", event => actions.push(event.detail));
  open(card); await wait(); assert.equal(calls, 0);
  drawer(card).controls.firstElementChild.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  assert.ok(card._activeTimers.size);
  card._detailDrawer.close(); assert.equal(card._activeTimers.size, 0);
  await wait(520); assert.equal(actions.length, 0); card.remove();
});

test("drawer native control keyboard focus survives state rendering while card stays collapsed", () => {
  const hass = createHass({ states: { "light.focus": state("on", { brightness: 100, supported_color_modes: ["brightness"] }) } });
  const card = createCard({ collapsible: true, default_state: "collapsed", remember_state: false,
    controls: [{ entity: "light.focus", display_in: "both", show_brightness_presets: true, brightness_presets: [25, 100] }]
  }, hass);
  open(card);
  const button = drawer(card).controls.querySelector(".preset-btn");
  assert.ok(button); assert.ok(button.dataset.rcFocusKey); button.focus();
  card.hass = { ...hass, states: { "light.focus": state("on", { brightness: 255, supported_color_modes: ["brightness"] }) } };
  assert.equal(deepActiveElement().dataset.rcFocusKey, button.dataset.rcFocusKey);
  assert.ok(drawer(card).controls.contains(deepActiveElement()));
  card.remove();
});

test("editor roundtrip retains placements through order, duplicate, reopen and deferred save", async () => {
  const editor = document.createElement("oneline-room-card-editor"); document.body.append(editor);
  editor.hass = createHass(); editor.setConfig({ name: "Room", controls: [{ entity: "light.one" }, { entity: "light.two", display_in: "drawer" }] });
  let root = editor.shadowRoot;
  const enabled = root.getElementById("drawer-enabled"); enabled.checked = true; enabled.dispatchEvent(new Event("change", { bubbles: true }));
  const title = root.getElementById("drawer-title"); title.value = "Details"; title.dispatchEvent(new Event("input", { bubbles: true }));
  change(root.querySelector(".display-in"), "both");
  root.querySelector(".d").click();
  assert.deepEqual(editor._config.controls.map(getControlPlacement), ["drawer", "both"]);
  root.querySelector(".dup").click();
  assert.deepEqual(editor._config.controls.map(getControlPlacement), ["drawer", "drawer", "both"]);
  const config = structuredClone(editor._config); editor.setConfig(config);
  assert.equal(root.getElementById("drawer-title").value, "Details");
  assert.ok(root.getElementById("tap-action").selector.select.options.some(option => option.value === "room-details"));
  assert.ok(root.querySelector(".tap").selector.select.options.some(option => option.value === "room-details"));
  await wait(120);
  const events = []; editor.addEventListener("config-changed", event => events.push(event.detail.config));
  const live = root.getElementById("live-preview-toggle"); live.checked = false; live.dispatchEvent(new Event("change", { bubbles: true }));
  change(root.querySelector(".display-in"), "card");
  await wait(120); assert.equal(events.length, 0);
  assert.equal(root.getElementById("drawer-preview").disabled, true);
  editor._flushPendingConfig(); assert.equal(events.length, 1); assert.equal(events[0].controls[0].display_in, "card");
  editor.remove();
});

test("editor preview targets only its existing card, preserves save boundary and cleans its bridge", async () => {
  const dialog = document.createElement("hui-dialog-edit-card"); document.body.append(dialog);
  const config = { name: "Preview", controls: [], detail_drawer: { enabled: true } };
  const card = createCard(config, createHass(), dialog);
  const editor = document.createElement("oneline-room-card-editor"); dialog.append(editor);
  editor.hass = createHass(); editor.setConfig(config);
  editor.addEventListener("config-changed", event => card.setConfig(event.detail.config));
  const preview = editor.shadowRoot.getElementById("drawer-preview"); preview.click();
  assert.ok(card._detailDrawer); assert.equal(dialog.querySelectorAll("oneline-room-card").length, 1);
  const title = editor.shadowRoot.getElementById("drawer-title"); title.value = "Live"; title.dispatchEvent(new Event("input", { bubbles: true }));
  await wait(120); assert.equal(card._detailDrawer.root.querySelector("h2").textContent, "Live");
  const live = editor.shadowRoot.getElementById("live-preview-toggle"); live.checked = false; live.dispatchEvent(new Event("change", { bubbles: true }));
  title.value = "Saved"; title.dispatchEvent(new Event("input", { bubbles: true }));
  await wait(120); assert.equal(card._detailDrawer.root.querySelector("h2").textContent, "Live");
  editor._flushPendingConfig(); assert.equal(card._detailDrawer.root.querySelector("h2").textContent, "Saved");
  card.remove(); assert.equal(document.querySelector("[data-room-card-drawer]"), null);
  live.checked = true; live.dispatchEvent(new Event("change", { bubbles: true })); preview.click();
  assert.ok(editor.shadowRoot.getElementById("drawer-preview-status").textContent);
  dialog.remove();
});

test("area setup preserves existing placements and new controls start on the card", async () => {
  const editor = document.createElement("oneline-room-card-editor"); document.body.append(editor);
  editor.hass = createHass({ states: { "light.new": state("on", { friendly_name: "New" }) } });
  editor.setConfig({ controls: [{ entity: "light.existing", display_in: "drawer" }], detail_drawer: { enabled: true } });
  editor._getAreaEntities = async () => [{ entity_id: "light.new" }];
  await editor._generateFromArea("living_room");
  assert.equal(editor._config.controls[0].display_in, "drawer");
  assert.ok(editor._config.controls.length > 1);
  for (const ctrl of editor._config.controls.slice(1)) assert.equal(getControlPlacement(ctrl), "card");
  editor.remove();
});
