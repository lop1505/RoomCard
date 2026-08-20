import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment, wait } from "./support/dom-env.mjs";

installDomEnvironment();
await importRoomCard(["MEDIA_PLAYER_FEATURES"]);

const createRenderedCard = (config, hass) => {
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig(config);
  card.hass = hass;
  return card;
};

test("primary controls expose accessible state and activate from the keyboard", () => {
  const hass = createHass({
    states: {
      "light.ceiling": { state: "on", attributes: { friendly_name: "Ceiling" } },
      "light.offline": { state: "unavailable", attributes: { friendly_name: "Offline" } }
    }
  });
  const card = createRenderedCard({
    name: "Room",
    controls: [
      { entity: "light.ceiling", name: "Ceiling", tap_action: { action: "toggle" } },
      { entity: "light.offline", name: "Offline", tap_action: { action: "toggle" } }
    ]
  }, hass);
  const actions = [];
  card.addEventListener("hass-action", (event) => actions.push(event.detail));

  const [available, unavailable] = card.shadowRoot.querySelectorAll(".btn");
  assert.equal(available.getAttribute("role"), "button");
  assert.equal(available.tabIndex, 0);
  assert.match(available.getAttribute("aria-label"), /Ceiling/);
  assert.equal(unavailable.getAttribute("aria-disabled"), "true");
  assert.equal(unavailable.tabIndex, -1);

  available.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  available.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
  assert.equal(actions.length, 1);
  assert.equal(actions[0].config.entity, "light.ceiling");

  unavailable.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
  unavailable.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
  assert.equal(actions.length, 1);
  card.remove();
});

test("full media controls split transport and volume, including previous track", () => {
  const hass = createHass({
    states: {
      "media_player.living_room": {
        state: "playing",
        attributes: {
          friendly_name: "Living room",
          media_title: "Test track",
          entity_picture: "/api/media/test.jpg",
          volume_level: 0.42,
          is_volume_muted: false,
          supported_features: 16445
        }
      }
    }
  });
  const card = createRenderedCard({
    name: "Room",
    controls: [{ entity: "media_player.living_room", name: "Music", control_mode: "full" }]
  }, hass);

  const transport = card.shadowRoot.querySelector(".media-transport-row");
  const volume = card.shadowRoot.querySelector(".media-volume-row");
  assert.ok(transport);
  assert.ok(volume);
  assert.equal(transport.querySelectorAll("button").length, 3);
  assert.equal(transport.querySelector(".media-previous").getAttribute("aria-label"), "Previous track");
  assert.equal(card.shadowRoot.querySelector(".media-thumb").getAttribute("src"), "/api/media/test.jpg");

  transport.querySelector(".media-previous").click();
  assert.deepEqual(hass.__serviceCalls.at(-1), {
    domain: "media_player",
    service: "media_previous_track",
    data: { entity_id: "media_player.living_room" }
  });

  const slider = volume.querySelector('input[type="range"]');
  assert.equal(slider.getAttribute("aria-label"), "Volume");
  slider.value = "65";
  slider.dispatchEvent(new Event("change", { bubbles: true }));
  assert.deepEqual(hass.__serviceCalls.at(-1), {
    domain: "media_player",
    service: "volume_set",
    data: { entity_id: "media_player.living_room", volume_level: 0.65 }
  });
  card.remove();
});

test("media controls hide actions not advertised by supported_features", () => {
  const hass = createHass({
    states: {
      "media_player.speaker": {
        state: "idle",
        attributes: { friendly_name: "Speaker", volume_level: 0.3, supported_features: 4 }
      }
    }
  });
  const card = createRenderedCard({
    controls: [{ entity: "media_player.speaker", name: "Speaker", control_mode: "full" }]
  }, hass);

  assert.equal(card.shadowRoot.querySelector(".media-transport-row"), null);
  assert.ok(card.shadowRoot.querySelector('.media-volume-row input[type="range"]'));
  assert.equal(card.shadowRoot.querySelector(".media-volume-row button"), null);
  card.remove();
});

test("runtime header images apply a validated focal point", () => {
  const card = createRenderedCard({
    name: "Room",
    image: "/local/room.jpg",
    image_position: "40% 65%",
    controls: []
  }, createHass());
  assert.equal(card.shadowRoot.getElementById("bg").style.objectPosition, "40% 65%");

  card.setConfig({ name: "Room", image: "/local/room.jpg", image_position: "invalid", controls: [] });
  card.hass = createHass();
  assert.equal(card.shadowRoot.getElementById("bg").style.objectPosition, "50% 50%");
  card.remove();
});

test("status borders can be disabled without hiding warning chips and can be restored", () => {
  const hass = createHass({
    states: {
      "binary_sensor.battery_warning": {
        entity_id: "binary_sensor.battery_warning",
        state: "on",
        attributes: { friendly_name: "Battery warning" }
      }
    }
  });
  const baseConfig = { controls: [], battery_sensors: ["binary_sensor.battery_warning"] };
  const card = createRenderedCard(baseConfig, hass);
  const cardElement = card.shadowRoot.querySelector("ha-card");

  assert.equal(cardElement.classList.contains("warning-battery"), true);
  assert.ok(card.shadowRoot.querySelector(".chip.alert"));

  card.setConfig({ ...baseConfig, show_status_border: false });
  card.hass = hass;
  assert.equal(cardElement.classList.contains("warning-battery"), false);
  assert.ok(card.shadowRoot.querySelector(".chip.alert"));

  card.setConfig(baseConfig);
  card.hass = hass;
  assert.equal(cardElement.classList.contains("warning-battery"), true);
  card.remove();
});

test("sensor-chip icons inherit the resolved chip text color", () => {
  const hass = createHass({
    states: {
      "person.patrick": {
        entity_id: "person.patrick",
        state: "home",
        attributes: { friendly_name: "Patrick" }
      },
      "binary_sensor.window": {
        entity_id: "binary_sensor.window",
        state: "on",
        attributes: { friendly_name: "Window" }
      }
    }
  });
  const card = createRenderedCard({
    controls: [],
    presence_sensor: "person.patrick",
    presence_chip_color: "#ffffff",
    presence_solid_background: true,
    window_sensors: ["binary_sensor.window"],
    window_solid_background: true,
    window_open_color: "#000000"
  }, hass);
  const chips = card.shadowRoot.querySelectorAll(".chip");
  const style = card.shadowRoot.querySelector("style").textContent;

  assert.match(style, /\.chip ha-icon \{ color: currentColor; \}/);
  assert.equal(chips[0].style.color, "#000000");
  assert.equal(chips[0].querySelector("ha-icon").style.color, "");
  assert.equal(chips[1].style.color, "#ffffff");
  assert.equal(chips[1].querySelector("ha-icon").style.color, "");
  card.remove();
});

test("alert dialog is modal, traps focus, closes with Escape, and restores focus", async () => {
  const hass = createHass();
  const card = createRenderedCard({
    controls: [{ entity: "light.ceiling", name: "Ceiling" }]
  }, createHass({ states: { "light.ceiling": { state: "on", attributes: {} } } }));
  card._hass = hass;
  const trigger = card.shadowRoot.querySelector(".btn");
  trigger.focus();

  card._showAlertDialog([{ entity_id: "sensor.leak", friendly_name: "Leak", icon: "mdi:water-alert", state: "on" }]);
  const panel = card.shadowRoot.querySelector(".alert-dialog");
  const close = card.shadowRoot.querySelector(".alert-dialog-close");
  const row = card.shadowRoot.querySelector(".alert-entity-row");
  assert.equal(panel.getAttribute("role"), "dialog");
  assert.equal(panel.getAttribute("aria-modal"), "true");
  assert.equal(row.tagName, "BUTTON");
  assert.equal(card.shadowRoot.activeElement, close);

  close.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, composed: true }));
  assert.equal(card.shadowRoot.activeElement, row);
  row.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
  await wait(20);
  assert.equal(card.shadowRoot.querySelector(".alert-dialog-container"), null);
  assert.equal(card.shadowRoot.activeElement, trigger);
  card.remove();
});
