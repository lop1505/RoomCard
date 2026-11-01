import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";

installDomEnvironment();
await importRoomCard();

const createEditor = () => {
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = createHass();
  editor._badgesSectionOpen = true;
  editor.setConfig({
    controls: ["light.test", "sensor.test", "climate.test", "cover.test"].map(entity => ({ entity })),
    header_badges: [{ entity: "sensor.test" }],
    status_groups: [{ entities: ["sensor.test"] }]
  });
  return editor;
};

test("static and dynamic switch labels use the default slot and follow language changes", () => {
  const editor = createEditor();
  for (const [language, preview, image, hideZero, badge] of [
    ["en", "Live preview", "Show background image", "Hide when zero", "Show Title"],
    ["de", "Live-Vorschau", "Hintergrundbild anzeigen", "Bei null ausblenden", "Titel anzeigen"],
    ["fr", "Aperçu en direct", "Afficher l'image de fond", "Masquer à zéro", "Afficher le titre"]
  ]) {
    editor.hass = createHass({ language });
    const root = editor.shadowRoot;
    assert.equal(root.querySelector("#live-preview-toggle").textContent, preview);
    assert.equal(root.querySelector("#show-image-toggle").textContent, image);
    assert.equal(root.querySelector(".status-group-editor ha-switch").textContent, hideZero);
    assert.equal(root.querySelector("#badges-list ha-switch").textContent, badge);
    for (const toggle of root.querySelectorAll("ha-switch")) {
      assert.ok(toggle.textContent.trim() || toggle.getAttribute("aria-label"), `unlabeled switch ${toggle.id || toggle.className}`);
      assert.equal(toggle.querySelector("[slot]"), null, "label belongs in the default slot");
    }
    assert.ok(root.querySelector("#window-always-show-field #window-always-show"));
    assert.ok(root.querySelector(".spd-wrap .spd"), "conditional sparkline layout hook is preserved");
  }
  editor.remove();
});

test("labeled static, button and dynamic toggles still save config and support deferred preview", async () => {
  const editor = createEditor();
  const received = [];
  editor.addEventListener("config-changed", event => received.push(event.detail.config));
  const change = (selector, value) => {
    const toggle = editor.shadowRoot.querySelector(selector);
    assert.ok(toggle, selector);
    toggle.checked = value;
    toggle.dispatchEvent(new Event("change", { bubbles: true }));
  };
  change("#show-image-toggle", false);
  change("#drawer-enabled", true);
  change(".box .ss", false);
  change("#badges-list ha-switch", false);
  change(".status-group-editor ha-switch", true);
  await wait(120);
  assert.equal(received.length, 1);
  assert.equal(received[0].show_image, false);
  assert.equal(received[0].detail_drawer.enabled, true);
  assert.equal(received[0].controls[0].show_state, false);
  assert.equal(received[0].header_badges[0].show_name, false);
  assert.equal(received[0].status_groups[0].hide_when_zero, true);

  change("#live-preview-toggle", false);
  change("#show-image-toggle", true);
  await wait(120);
  assert.equal(received.length, 1);
  assert.equal("show_image" in editor._pendingConfig, false, "default true is stored without an override");
  editor._flushPendingConfig();
  assert.equal("show_image" in received.at(-1), false);
  editor.remove();
});

test("source and shipped editor no longer reference the removed form-field component", async () => {
  for (const path of ["../src/editor/room-card-editor.js", "../dist/room-card.js"]) {
    assert.equal((await readFile(new URL(path, import.meta.url), "utf8")).includes("ha-formfield"), false);
  }
});
