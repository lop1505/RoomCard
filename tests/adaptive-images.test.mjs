import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();
const {
  evaluateAdaptiveImageConditions,
  getConditionEntityDependencies,
  resolveAdaptiveRoomImage
} = await importRoomCard();

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

test("legacy header images initialize when configured before attachment", () => {
  const configs = [
    { image_preset: "kitchen" },
    { image: "/local/custom.jpg" },
    { image: "/api/image/serve/upload-id/original", image_preset: "kitchen" },
    {}
  ];
  for (const config of configs) {
    for (const hassFirst of [false, true]) {
      const card = document.createElement("oneline-room-card");
      try {
        const hass = createHass();
        if (hassFirst) card.hass = hass;
        card.setConfig({ ...config, controls: [] });
        if (!hassFirst) card.hass = hass;
        document.body.appendChild(card);
        const image = card.shadowRoot.getElementById("bg");
        const expected = resolveAdaptiveRoomImage(config, hass).url || "/static/images/card_media/cover.png";
        assert.equal(image.getAttribute("src"), expected, JSON.stringify({ config, hassFirst }));
        assert.equal(image.dataset.roomImageUrl, expected);
        card.hass = hass;
        assert.equal(image.getAttribute("src"), expected, "unchanged HA state retains the image");
      } finally {
        card.remove();
      }
    }
  }
});

test("header images resume after reconnect and reject loads from the previous connection", (t) => {
  const originalImage = globalThis.Image;
  const pending = [];
  globalThis.Image = class {
    set src(value) { this.value = value; pending.push(this); }
  };
  const card = document.createElement("oneline-room-card");
  t.after(() => { card.remove(); globalThis.Image = originalImage; });
  document.body.appendChild(card);
  card.setConfig({ image: "/local/default.jpg" });
  card.hass = createHass();
  const image = card.shadowRoot.getElementById("bg");
  card.setConfig({ image: "/local/next.jpg" });
  assert.equal(pending.length, 1);
  card.remove();
  pending[0].onload();
  assert.equal(image.getAttribute("src"), "/local/default.jpg");
  document.body.appendChild(card);
  assert.equal(pending.length, 2, "reconnection retries the current selection without a HA state change");
  pending[0].onload();
  assert.equal(image.getAttribute("src"), "/local/default.jpg", "old load remains invalid after reconnect");
  pending[1].onload();
  assert.equal(image.getAttribute("src"), "/local/next.jpg");
});

test("loaded adaptive image returns to the default when inactive or its last rule is removed", (t) => {
  const originalImage = globalThis.Image;
  const pending = [];
  globalThis.Image = class {
    set src(value) { this.value = value; pending.push(this); }
  };
  const card = document.createElement("oneline-room-card");
  t.after(() => { card.remove(); globalThis.Image = originalImage; });
  const config = {
    image_preset: "kitchen",
    image_position: "30% 40%",
    adaptive_images: [{
      image_preset: "bedroom",
      image_position: "70% 20%",
      conditions: [{ condition: "state", entity: "light.floor", state: "on" }]
    }]
  };
  const on = createHass({ states: { "light.floor": { state: "on", attributes: {} } } });
  const off = createHass({ states: { "light.floor": { state: "off", attributes: {} } } });
  document.body.appendChild(card);
  card.setConfig(config);
  card.hass = on;
  const image = card.shadowRoot.getElementById("bg");
  const activeUrl = resolveAdaptiveRoomImage(config, on).url;
  const defaultUrl = resolveAdaptiveRoomImage(config, off).url;
  assert.equal(image.getAttribute("src"), activeUrl);
  card.hass = off;
  assert.equal(pending.at(-1).value, defaultUrl);
  pending.at(-1).onload();
  assert.equal(image.getAttribute("src"), defaultUrl);
  assert.equal(image.style.objectPosition, "30% 40%");
  card.hass = on;
  pending.at(-1).onload();
  assert.equal(image.getAttribute("src"), activeUrl);
  const { adaptive_images, ...withoutRules } = config;
  card.setConfig(withoutRules);
  assert.equal(pending.at(-1).value, defaultUrl);
  pending.at(-1).onload();
  assert.equal(image.getAttribute("src"), defaultUrl);
  assert.equal(image.style.objectPosition, "30% 40%");
});

test("removing a rule while detached restores the fallback upon attachment", () => {
  const card = document.createElement("oneline-room-card");
  try {
    card.setConfig({
      image: "/local/default.jpg",
      adaptive_images: [{
        image: "/local/active.jpg",
        conditions: [{ condition: "state", entity: "light.floor", state: "on" }]
      }]
    });
    card.hass = createHass({ states: { "light.floor": { state: "on", attributes: {} } } });
    card.setConfig({ image: "/local/default.jpg" });
    document.body.appendChild(card);
    assert.equal(card.shadowRoot.getElementById("bg").getAttribute("src"), "/local/default.jpg");
  } finally {
    card.remove();
  }
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
