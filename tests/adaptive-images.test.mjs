import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();
const {
  evaluateAdaptiveImageConditions,
  getConditionEntityDependencies,
  resolveAdaptiveRoomImage
} = await importRoomCard([
  "evaluateAdaptiveImageConditions",
  "getConditionEntityDependencies",
  "resolveAdaptiveRoomImage"
]);

test("adaptive image rules are strict, ordered, and fall back safely", () => {
  const hass = createHass({
    states: {
      "binary_sensor.occupied": { state: "on", attributes: {} },
      "sensor.lux": { state: "12", attributes: {} }
    }
  });
  const config = {
    image: "/local/default.jpg",
    image_position: "30% 40%",
    adaptive_images: [
      {
        name: "Invalid first rule",
        image: "/local/invalid.jpg",
        conditions: [{ condition: "state", entity: "binary_sensor.missing", state: "on" }]
      },
      {
        name: "Occupied",
        image: "/local/occupied.jpg",
        image_position: "70% 20%",
        conditions: [{
          condition: "and",
          conditions: [
            { condition: "state", entity: "binary_sensor.occupied", state: "on" },
            { condition: "numeric_state", entity: "sensor.lux", below: 20 }
          ]
        }]
      },
      {
        name: "Later match",
        image: "/local/later.jpg",
        conditions: [{ condition: "state", entity: "binary_sensor.occupied", state: "on" }]
      }
    ]
  };
  assert.deepEqual(resolveAdaptiveRoomImage(config, hass), {
    url: "/local/occupied.jpg",
    position: "70% 20%",
    ruleIndex: 1
  });
  assert.deepEqual(
    getConditionEntityDependencies(config.adaptive_images.flatMap((rule) => rule.conditions)).sort(),
    ["binary_sensor.missing", "binary_sensor.occupied", "sensor.lux"]
  );

  const inactive = createHass({ states: { ...hass.states, "binary_sensor.occupied": { state: "off", attributes: {} } } });
  assert.deepEqual(resolveAdaptiveRoomImage(config, inactive), {
    url: "/local/default.jpg",
    position: "30% 40%",
    ruleIndex: -1
  });
  assert.deepEqual(evaluateAdaptiveImageConditions([], hass), { valid: false, active: false });
});

test("time conditions support normal and overnight windows", () => {
  const hass = createHass();
  const at1900 = new Date(2026, 0, 1, 19, 0, 0);
  const at0100 = new Date(2026, 0, 2, 1, 0, 0);
  const at1200 = new Date(2026, 0, 2, 12, 0, 0);
  const evening = [{ condition: "time", after: "18:00:00", before: "23:00:00" }];
  const overnight = [{ condition: "time", after: "22:00:00", before: "06:00:00" }];
  assert.deepEqual(evaluateAdaptiveImageConditions(evening, hass, at1900), { valid: true, active: true });
  assert.deepEqual(evaluateAdaptiveImageConditions([{ condition: "time", weekday: ["thu"] }], hass, at1900), { valid: true, active: true });
  assert.deepEqual(evaluateAdaptiveImageConditions([{ condition: "time", weekday: ["fri"] }], hass, at1900), { valid: true, active: false });
  assert.deepEqual(evaluateAdaptiveImageConditions(overnight, hass, at0100), { valid: true, active: true });
  assert.deepEqual(evaluateAdaptiveImageConditions(overnight, hass, at1200), { valid: true, active: false });
  assert.deepEqual(evaluateAdaptiveImageConditions([{ condition: "time", after: "99:00" }], hass, at1900), { valid: false, active: false });
});

test("numeric thresholds may reference entities and are tracked as dependencies", () => {
  const hass = createHass({ states: {
    "sensor.room_temperature": { state: "24", attributes: {} },
    "input_number.warm_limit": { state: "22", attributes: {} }
  } });
  const conditions = [{ condition: "numeric_state", entity: "sensor.room_temperature", above: "input_number.warm_limit" }];
  assert.deepEqual(evaluateAdaptiveImageConditions(conditions, hass), { valid: true, active: true });
  assert.deepEqual(getConditionEntityDependencies(conditions).sort(), ["input_number.warm_limit", "sensor.room_temperature"]);
});

test("runtime tracks dependencies and ignores stale image loads", () => {
  const originalImage = globalThis.Image;
  const pending = [];
  class FakeImage {
    set src(value) { this.value = value; pending.push(this); }
  }
  const config = {
    image: "/local/default.jpg",
    adaptive_images: [{
      image: "/local/active.jpg",
      conditions: [{ condition: "state", entity: "input_boolean.mode", state: "on" }]
    }]
  };
  const initialHass = createHass({ states: { "input_boolean.mode": { state: "off", attributes: {} } } });
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig(config);
  card.hass = initialHass;
  const image = card.shadowRoot.getElementById("bg");
  assert.equal(image.dataset.roomImageUrl, "/local/default.jpg");
  assert.ok(card._getRelevantEntityIds().includes("input_boolean.mode"));

  globalThis.Image = FakeImage;
  card.hass = createHass({ states: { "input_boolean.mode": { state: "on", attributes: {} } } });
  assert.equal(pending.length, 1);
  assert.equal(pending[0].value, "/local/active.jpg");
  card.hass = createHass({ states: { "input_boolean.mode": { state: "off", attributes: {} } } });
  pending[0].onload();
  assert.equal(image.dataset.roomImageUrl, "/local/default.jpg");

  globalThis.Image = originalImage;
  card.remove();
});

test("adaptive image editor round-trips conditions, ordering, duplication, and removal", () => {
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = createHass();
  editor.setConfig({
    controls: [],
    image: "/local/default.jpg",
    adaptive_images: [
      { name: "Evening", image: "/local/evening.jpg", conditions: [{ condition: "time", after: "18:00:00" }] },
      { name: "Occupied", image_preset: "living-room", conditions: [{ condition: "state", entity: "binary_sensor.occupied", state: "on" }] }
    ]
  });
  editor._imageSectionOpen = true;
  editor._updateImageSectionUI();
  let rows = editor.shadowRoot.querySelectorAll(".adaptive-image-rule");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].querySelector("oneline-room-card-textfield").value, "Evening");
  assert.deepEqual(rows[0].querySelector("ha-card-conditions-editor").conditions, [{ condition: "time", after: "18:00:00" }]);

  rows[0].querySelector('.adaptive-image-actions button[aria-label="Duplicate image rule"]').click();
  assert.equal(editor._config.adaptive_images.length, 3);
  rows = editor.shadowRoot.querySelectorAll(".adaptive-image-rule");
  rows[0].querySelector('.adaptive-image-actions button[aria-label="Move image rule down"]').click();
  assert.equal(editor._config.adaptive_images[1].name, "Evening");
  rows = editor.shadowRoot.querySelectorAll(".adaptive-image-rule");
  rows[0].querySelector('.adaptive-image-actions button[aria-label="Remove image rule"]').click();
  assert.equal(editor._config.adaptive_images.length, 2);
  editor.remove();
});
