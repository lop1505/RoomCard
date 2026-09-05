import assert from "node:assert/strict";
import test from "node:test";
import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";
import { getDialogCoordinator, deepActiveElement } from "../src/shared/dialog-coordinator.js";

installDomEnvironment();
await importRoomCard();
const createCard = (config = {}, hass = createHass()) => {
  const card = document.createElement("oneline-room-card");
  card.setConfig({ name: "Living room", controls: [], ...config });
  card.hass = hass;
  document.body.append(card);
  return card;
};
const open = card => card.shadowRoot.querySelector("#details-btn").click();
const host = () => document.querySelector("[data-room-card-drawer]");
const escape = () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));

test("drawer is strictly opt-in, outside clipped ancestors, isolated from header actions, and restores focus", () => {
  const card = createCard({ collapsible: true, tap_action: { action: "toggle" } });
  assert.equal(card.shadowRoot.querySelector("#details-btn").hidden, true);
  card._fireAction("tap", { tap_action: { action: "room-details" } });
  assert.equal(host(), null);
  card.setConfig({ ...card.config, detail_drawer: { enabled: true }, remember_state: false });
  const actions = [];
  card.addEventListener("hass-action", event => actions.push(event.detail));
  card.style.transform = "translateX(0)";
  card.style.overflow = "hidden";
  const trigger = card.shadowRoot.querySelector("#details-btn");
  trigger.focus();
  const collapsed = card._collapsed;
  open(card);
  assert.equal(host().parentElement, document.body);
  assert.equal(host().shadowRoot.querySelector("h2").textContent, "Living room");
  assert.equal(host().shadowRoot.activeElement, host().shadowRoot.querySelector(".close"));
  assert.equal(card._collapsed, collapsed);
  assert.equal(actions.length, 0);
  escape();
  assert.equal(host(), null);
  assert.equal(deepActiveElement(), trigger);
  assert.equal(getDialogCoordinator().size, 0);
  card.remove();
});

test("drawer traps forward/reverse Tab, skips disabled entries, and restores focus after backdrop", () => {
  const card = createCard({ detail_drawer: { enabled: true }, entity: "light.test" }, createHass({ states: { "light.test": { state: "off", attributes: {} } } }));
  open(card);
  const root = host().shadowRoot;
  const close = root.querySelector(".close");
  const more = root.querySelector('[data-drawer-action="more"]');
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
  assert.equal(root.activeElement, more);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  assert.equal(root.activeElement, close);
  const outside = document.createElement("button");
  document.body.append(outside);
  outside.focus();
  assert.equal(root.activeElement, close);
  root.querySelector(".backdrop").click();
  assert.equal(host(), null);
  outside.remove(); card.remove();
});

test("opening and updating a drawer never requests history; nested history returns focus and preserves scroll", async () => {
  let requests = 0;
  const entity = "sensor.drawer_temperature";
  const card = createCard({ detail_drawer: { enabled: true }, temp_sensor: entity }, createHass({
    states: { [entity]: { state: "21", attributes: { unit_of_measurement: "°C" } } },
    callWS: async () => { requests++; return {}; }
  }));
  open(card);
  const root = host().shadowRoot;
  const content = root.querySelector(".content");
  content.scrollTop = 65;
  assert.equal(requests, 0);
  card.setConfig({ ...card.config, detail_drawer: { enabled: true, title: "Changed" } });
  assert.equal(root.querySelector("h2").textContent, "Changed");
  assert.equal(content.scrollTop, 65);
  const button = root.querySelector('[data-drawer-action="history"]');
  button.focus(); button.click();
  await wait();
  assert.equal(requests, 1);
  assert.ok(root.querySelector(".sparkline-dialog"));
  assert.equal(root.querySelector(".panel").inert, true);
  root.querySelector(".backdrop").click();
  assert.ok(host(), "lower backdrop cannot close a child");
  escape();
  assert.equal(root.querySelector(".sparkline-dialog"), null);
  assert.equal(root.activeElement, button);
  assert.equal(root.querySelector(".panel").inert, false);
  assert.equal(content.scrollTop, 65);
  escape();
  assert.equal(host(), null);
  card.remove();
});

test("HA handoff requires a confirmed opening; only its matching closed event resumes RoomCard focus", async () => {
  const card = createCard({ detail_drawer: { enabled: true }, entity: "light.test" }, createHass({ states: { "light.test": { state: "off", attributes: {} } } }));
  const actions = [];
  card.addEventListener("hass-action", event => actions.push(event.detail));
  open(card);
  const root = host().shadowRoot;
  const more = root.querySelector('[data-drawer-action="more"]');
  more.focus(); more.click();
  assert.equal(actions.length, 1);
  assert.equal(root.querySelector(".panel").inert, false, "request alone must not pause the drawer");
  const ha = document.createElement("ha-more-info-dialog");
  ha.closeDialog = () => {};
  const haRoot = ha.attachShadow({ mode: "open" });
  const primitive = document.createElement("ha-dialog");
  const input = document.createElement("button");
  primitive.append(input); haRoot.append(primitive); document.body.append(ha);
  primitive.dispatchEvent(new CustomEvent("opened", { bubbles: true, composed: true }));
  input.focus();
  assert.equal(deepActiveElement(), input);
  assert.equal(root.querySelector(".panel").inert, true);
  escape();
  assert.ok(host(), "RoomCard must not handle HA's Escape");
  document.dispatchEvent(new CustomEvent("dialog-closed", { detail: { dialog: "ha-more-info-dialog" } }));
  await wait();
  assert.equal(root.querySelector(".panel").inert, true, "unrelated target cannot dismiss the handoff");
  ha.dispatchEvent(new CustomEvent("dialog-closed", { bubbles: true, composed: true, detail: { dialog: "ha-more-info-dialog" } }));
  await wait();
  assert.equal(root.querySelector(".panel").inert, false);
  assert.equal(deepActiveElement(), more);
  ha.remove(); card.remove();
  assert.equal(getDialogCoordinator().size, 0);
});

test("one drawer across cards; disable, removal and real navigation clean up while HA history leaves it open", () => {
  const one = createCard({ detail_drawer: { enabled: true } });
  const two = createCard({ detail_drawer: { enabled: true } });
  open(one);
  const old = host();
  open(two);
  assert.equal(old.isConnected, false);
  assert.equal(one._detailDrawer, null);
  assert.equal(document.querySelectorAll("[data-room-card-drawer]").length, 1);
  window.dispatchEvent(new Event("popstate"));
  assert.ok(host());
  history.pushState(null, "", "/lovelace/1");
  window.dispatchEvent(new Event("location-changed"));
  assert.equal(host(), null);
  history.replaceState(null, "", "/lovelace/0");
  open(one);
  one.setConfig({ ...one.config, detail_drawer: { enabled: false } });
  assert.equal(host(), null);
  open(two); two.remove(); one.remove();
  assert.equal(host(), null);
  assert.equal(getDialogCoordinator().size, 0);
});

test("repeated opening adds no timers or retained modal listeners", () => {
  const originalAdd = document.addEventListener.bind(document);
  const originalRemove = document.removeEventListener.bind(document);
  const tracked = new Map();
  const names = ["keydown", "focusin", "opened", "dialog-closed"];
  document.addEventListener = (type, fn, options) => { if (names.includes(type)) tracked.set(fn, type); originalAdd(type, fn, options); };
  document.removeEventListener = (type, fn, options) => { if (tracked.get(fn) === type) tracked.delete(fn); originalRemove(type, fn, options); };
  const card = createCard({ detail_drawer: { enabled: true } });
  try {
    for (let i = 0; i < 20; i++) {
      open(card); escape();
      assert.equal(host(), null);
      assert.equal(getDialogCoordinator().size, 0);
      assert.equal(tracked.size, 0);
      assert.equal(card._activeTimers.size, 0);
    }
  } finally {
    card.remove(); document.addEventListener = originalAdd; document.removeEventListener = originalRemove;
  }
});

test("removing a drawer during a pending history request cannot restore it", async () => {
  let resolveHistory;
  const entity = "sensor.pending_drawer";
  const card = createCard({ detail_drawer: { enabled: true }, temp_sensor: entity }, createHass({
    states: { [entity]: { state: "12", attributes: {} } },
    callWS: () => new Promise(resolve => { resolveHistory = resolve; })
  }));
  open(card);
  const old = host();
  old.shadowRoot.querySelector('[data-drawer-action="history"]').click();
  card.remove();
  resolveHistory({});
  await wait();
  assert.equal(host(), null);
  assert.equal(old.shadowRoot.querySelector(".sparkline-dialog"), null);
  assert.equal(getDialogCoordinator().size, 0);
});

test("tap, hold and double-tap room-details actions stay local and theme updates preserve drawer nodes", () => {
  const card = createCard({ detail_drawer: { enabled: true } });
  const actions = [];
  card.addEventListener("hass-action", event => actions.push(event.detail));
  for (const type of ["tap", "hold", "double_tap"]) {
    card._fireAction(type, { [`${type}_action`]: { action: "room-details" } });
    assert.ok(host());
    escape();
  }
  assert.equal(actions.length, 0);
  open(card);
  const old = host();
  card.style.setProperty("--primary-text-color", "rgb(240, 240, 240)");
  card.hass = card._hass;
  assert.equal(host(), old);
  assert.equal(old.style.getPropertyValue("--primary-text-color"), "rgb(240, 240, 240)");
  card.remove();
});
