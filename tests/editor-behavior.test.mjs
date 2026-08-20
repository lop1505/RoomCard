import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";

installDomEnvironment();
await importRoomCard();

const createEditor = () => {
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = createHass();
  return editor;
};

test("the text-field compatibility wrapper supports native, legacy, and current inputs", () => {
  const NativeWrapper = customElements.get("oneline-room-card-textfield");
  assert.ok(NativeWrapper);

  const nativeWrapper = document.createElement("oneline-room-card-textfield");
  document.body.appendChild(nativeWrapper);
  assert.equal(nativeWrapper.shadowRoot.querySelector("input")?.tagName, "INPUT");

  customElements.define("ha-textfield", class extends HTMLElement {});
  const legacyWrapper = document.createElement("oneline-room-card-textfield");
  document.body.appendChild(legacyWrapper);
  assert.equal(legacyWrapper.shadowRoot.querySelector("ha-textfield")?.tagName, "HA-TEXTFIELD");

  customElements.define("ha-input", class extends HTMLElement {});
  const currentWrapper = document.createElement("oneline-room-card-textfield");
  document.body.appendChild(currentWrapper);
  assert.equal(currentWrapper.shadowRoot.querySelector("ha-input")?.tagName, "HA-INPUT");
});

test("the visual editor renders from a cold configuration", () => {
  const editor = createEditor();
  editor.setConfig({ name: "Kitchen" });

  assert.deepEqual(editor._config.controls, []);
  assert.ok(editor.shadowRoot.querySelector("[data-rc-version]"));
  assert.ok(editor.shadowRoot.getElementById("show-name-toggle"));
  assert.ok(editor.shadowRoot.getElementById("tab-config-btn"));
  assert.ok(editor.shadowRoot.getElementById("tab-buttons-btn"));

  editor.remove();
});

test("live editor changes emit the expected config-changed event", async () => {
  const editor = createEditor();
  editor.setConfig({ name: "Kitchen", controls: [] });
  const received = [];
  editor.addEventListener("config-changed", (event) => received.push(event.detail.config));

  editor._fire({ name: "Living Room", controls: [] });
  await wait(120);

  assert.deepEqual(received, [{ name: "Living Room", controls: [] }]);
  editor.remove();
});

test("disabled live preview defers changes until the primary save flow flushes them", () => {
  const editor = createEditor();
  editor.setConfig({ name: "Kitchen", controls: [] });
  editor._livePreview = false;
  const received = [];
  editor.addEventListener("config-changed", (event) => received.push(event.detail.config));

  editor._fire({ name: "Office", controls: [] });
  assert.equal(received.length, 0);
  assert.deepEqual(editor._pendingConfig, { name: "Office", controls: [] });

  editor._flushPendingConfig();
  assert.deepEqual(received, [{ name: "Office", controls: [] }]);
  assert.equal(editor._pendingConfig, null);
  editor.remove();
});

test("disconnecting the editor clears its pending event timer", async () => {
  const editor = createEditor();
  editor.setConfig({ controls: [] });
  let emitted = false;
  editor.addEventListener("config-changed", () => { emitted = true; });
  editor._fire({ name: "Should not emit", controls: [] });

  editor.remove();
  await wait(120);

  assert.equal(emitted, false);
});
