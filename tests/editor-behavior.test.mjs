import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";

installDomEnvironment();
const { parseImagePosition, validateImageUpload } = await importRoomCard(["parseImagePosition", "validateImageUpload"]);

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

test("sparkline refresh editor loads, clamps, validates, and removes the card-level value", () => {
  const editor = createEditor();
  editor.setConfig({ controls: [], sparkline_refresh: 120 });
  const field = editor.shadowRoot.getElementById("sparkline-refresh");
  const error = editor.shadowRoot.getElementById("sparkline-refresh-error");

  assert.equal(String(field.value), "120");
  field.value = "10";
  field.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(editor._config.sparkline_refresh, 60);
  assert.match(error.textContent, /60/);
  assert.equal(error.style.display, "block");

  field.value = "600";
  field.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(editor._config.sparkline_refresh, 600);
  assert.equal(error.textContent, "");

  field.value = "";
  field.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal("sparkline_refresh" in editor._config, false);
  editor.remove();
});

test("status border editor switch defaults on and stores only the disabled override", () => {
  const editor = createEditor();
  editor.setConfig({ controls: [] });
  const toggle = editor.shadowRoot.getElementById("status-border-toggle");

  assert.equal(toggle.checked, true);
  toggle.checked = false;
  toggle.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(editor._config.show_status_border, false);

  toggle.checked = true;
  toggle.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal("show_status_border" in editor._config, false);
  editor.remove();
});

test("image focal positions validate, clamp, update the preview, and clean centered config", () => {
  assert.deepEqual(parseImagePosition("40% 65%"), { x: 40, y: 65, value: "40% 65%", isDefault: false });
  assert.deepEqual(parseImagePosition("-10% 140%"), { x: 0, y: 100, value: "0% 100%", isDefault: false });
  assert.deepEqual(parseImagePosition("invalid"), { x: 50, y: 50, value: "50% 50%", isDefault: true });

  const editor = createEditor();
  editor.setConfig({ image: "/local/room.jpg", controls: [] });
  editor._setImagePosition(40, 65);
  assert.equal(editor._config.image_position, "40% 65%");
  assert.equal(editor.shadowRoot.getElementById("prev-img").style.objectPosition, "40% 65%");
  assert.equal(editor.shadowRoot.getElementById("focal-marker").style.left, "40%");
  editor._setImagePosition(50, 50);
  assert.equal("image_position" in editor._config, false);
  editor.remove();
});

test("image upload validation rejects unsupported, empty, and oversized sources", () => {
  assert.equal(validateImageUpload({ type: "image/gif", size: 1024 }), "upload_unsupported");
  assert.equal(validateImageUpload({ type: "image/png", size: 0 }), "upload_decode_error");
  assert.equal(validateImageUpload({ type: "image/jpeg", size: 21 * 1024 * 1024 }), "upload_too_large");
  assert.equal(validateImageUpload({ type: "image/webp", size: 1024 }), "");
});

test("oversized uploads are downscaled proportionally before upload", async () => {
  const editor = createEditor();
  editor.setConfig({ controls: [] });
  const source = new File([new Uint8Array([1, 2, 3])], "wide.png", { type: "image/png" });
  let decodedClosed = false;
  editor._decodeImageFile = async () => ({
    source: {}, width: 5000, height: 2500, close: () => { decodedClosed = true; }
  });
  let encodedDimensions;
  editor._canvasToBlob = async (canvas, type) => {
    encodedDimensions = { width: canvas.width, height: canvas.height, type };
    return new Blob([new Uint8Array([1, 2])], { type });
  };
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = (tagName, options) => tagName === "canvas"
    ? { width: 0, height: 0, getContext: () => ({ drawImage() {} }) }
    : originalCreateElement(tagName, options);
  try {
    const result = await editor._prepareImageUpload(source);
    assert.deepEqual(encodedDimensions, { width: 2560, height: 1280, type: "image/png" });
    assert.equal(result.optimized, true);
    assert.equal(result.file.type, "image/png");
    assert.equal(decodedClosed, true);
  } finally {
    document.createElement = originalCreateElement;
    editor.remove();
  }
});

test("small suitable uploads are decoded but not re-encoded", async () => {
  const editor = createEditor();
  editor.setConfig({ controls: [] });
  const source = new File([new Uint8Array([1, 2, 3])], "small.webp", { type: "image/webp" });
  let decodedClosed = false;
  editor._decodeImageFile = async () => ({
    source: {}, width: 1200, height: 800, close: () => { decodedClosed = true; }
  });
  editor._canvasToBlob = async () => { throw new Error("small images must not be encoded"); };
  const result = await editor._prepareImageUpload(source);
  assert.equal(result.file, source);
  assert.equal(result.optimized, false);
  assert.equal(decodedClosed, true);
  editor.remove();
});

test("the upload flow prevents repeats, reports success, and restores controls", async () => {
  const editor = createEditor();
  editor.setConfig({ image: "/old-room.jpg", image_preset: "kitchen", controls: [] });
  const source = new File([new Uint8Array([1, 2, 3])], "room.jpg", { type: "image/jpeg" });
  const optimized = new File([new Uint8Array([1, 2])], "room.jpg", { type: "image/jpeg" });
  let prepareCalls = 0;
  let releasePreparation;
  const preparationGate = new Promise((resolve) => { releasePreparation = resolve; });
  editor._prepareImageUpload = async () => {
    prepareCalls += 1;
    await preparationGate;
    return { file: optimized, optimized: true };
  };
  editor._renderImagePresetPicker = () => {};

  const firstUpload = editor._handleUpload({ target: { files: [source] } });
  const repeatedUpload = editor._handleUpload({ target: { files: [source] } });
  assert.equal(editor.shadowRoot.getElementById("upload-btn").disabled, true);
  assert.equal(prepareCalls, 1);
  releasePreparation();
  await Promise.all([firstUpload, repeatedUpload]);

  assert.equal(prepareCalls, 1);
  assert.equal(editor._config.image, "/api/image/serve/image-id/original");
  assert.equal("image_preset" in editor._config, false);
  assert.equal(editor.shadowRoot.getElementById("upload-btn").disabled, false);
  assert.equal(editor.shadowRoot.getElementById("file-upload").disabled, false);
  assert.equal(editor.shadowRoot.getElementById("upload-status").textContent, "Image optimized and uploaded");
  editor.remove();
});
