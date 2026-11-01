import assert from "node:assert/strict";
import test from "node:test";
import { createHass, importRoomCard, installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();
await importRoomCard();

const renderWindow = (attributes, state = "off", config = {}) => {
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig({ controls: [], window_sensors: ["binary_sensor.contact"], window_always_show: true, ...config });
  card.hass = createHass({ states: { "binary_sensor.contact": { state, attributes } } });
  return card;
};

test("window chips choose open/closed icons by device class and prefer custom entity icons", () => {
  for (const [deviceClass, closed, open] of [
    ["window", "mdi:window-closed-variant", "mdi:window-open-variant"],
    ["door", "mdi:door-closed", "mdi:door-open"],
    ["garage_door", "mdi:garage", "mdi:garage-open"],
    [undefined, "mdi:window-closed-variant", "mdi:window-open-variant"],
    ["opening", "mdi:window-closed-variant", "mdi:window-open-variant"]
  ]) {
    for (const [state, expectedIcon] of [["off", closed], ["on", open]]) {
      for (const customIcon of [undefined, "mdi:star"]) {
        const card = renderWindow({ device_class: deviceClass, icon: customIcon }, state);
        assert.equal(card.shadowRoot.querySelector(".chip ha-icon").icon, customIcon || expectedIcon);
        card.remove();
      }
    }
  }
});

test("window icons update live and retain configured open states, labels, colors and visibility", () => {
  const card = renderWindow({ device_class: "door" }, "closed", {
    window_open_states: ["tilted"], window_labels: { "binary_sensor.contact": "My door" },
    window_open_color: "#123456", window_closed_color: "#654321"
  });
  const chip = () => card.shadowRoot.querySelector(".chip");
  assert.equal(chip().textContent.trim(), "My door");
  assert.equal(chip().querySelector("ha-icon").icon, "mdi:door-closed");
  assert.equal(chip().style.color, "#654321");
  card.hass = createHass({ states: { "binary_sensor.contact": { state: "tilted", attributes: { device_class: "door" } } } });
  assert.equal(chip().querySelector("ha-icon").icon, "mdi:door-open");
  assert.equal(chip().style.color, "#123456");
  card.hass = createHass({ states: { "binary_sensor.contact": { state: "tilted", attributes: { device_class: "door", icon: "mdi:star" } } } });
  assert.equal(chip().querySelector("ha-icon").icon, "mdi:star");
  card.setConfig({ controls: [], window_sensors: ["binary_sensor.contact"] });
  card.hass = createHass({ states: { "binary_sensor.contact": { state: "off", attributes: {} } } });
  assert.equal(chip(), null);
  card.remove();
});
