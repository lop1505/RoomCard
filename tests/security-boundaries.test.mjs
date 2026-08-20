import assert from "node:assert/strict";
import test from "node:test";

import { createHass, importRoomCard, installDomEnvironment } from "./support/dom-env.mjs";

installDomEnvironment();
await importRoomCard();

const payload = '<img class="injection-payload" src="x" onerror="window.__roomCardInjected = true">';

const createRenderedCard = (config, hass) => {
  const card = document.createElement("oneline-room-card");
  document.body.appendChild(card);
  card.setConfig(config);
  card.hass = hass;
  return card;
};

test("entity labels, states, sub-chips, alerts, and modes render payloads as text", () => {
  const hass = createHass({
    states: {
      "sensor.payload": {
        entity_id: "sensor.payload",
        state: payload,
        attributes: { friendly_name: payload }
      },
      "sensor.sub_chip": {
        entity_id: "sensor.sub_chip",
        state: payload,
        attributes: {}
      },
      "binary_sensor.alert": {
        entity_id: "binary_sensor.alert",
        state: "on",
        attributes: { friendly_name: payload, icon: 'mdi:alert" onload="window.__roomCardInjected = true' }
      },
      "climate.payload": {
        entity_id: "climate.payload",
        state: "heat",
        attributes: {
          friendly_name: "Climate",
          current_temperature: 20,
          temperature: 21,
          hvac_modes: [payload],
          fan_modes: [payload],
          fan_mode: payload
        }
      }
    }
  });
  const card = createRenderedCard({
    controls: [
      {
        entity: "sensor.payload",
        name: payload,
        sub_chips: [{ entity: "sensor.sub_chip", label: "Reading {state}" }]
      },
      {
        entity: "climate.payload",
        control_mode: "full",
        show_hvac_modes: true,
        show_fan_modes: true
      }
    ],
    alert_sensors: [{ entity: "binary_sensor.alert", state: "on" }]
  }, hass);

  assert.equal(card.shadowRoot.querySelector(".btn-name").textContent, payload);
  assert.match(card.shadowRoot.querySelector(".btn-chip").textContent, /injection-payload/);
  assert.match(card.shadowRoot.querySelector(".chip.alert").textContent, /injection-payload/);
  assert.equal(card.shadowRoot.querySelectorAll(".preset-btn")[0].textContent.trim(), payload);
  assert.equal(card.shadowRoot.querySelector(".injection-payload"), null);
  assert.equal(window.__roomCardInjected, undefined);
  card.remove();
});

test("template content is text-only unless trusted HTML is explicitly enabled", () => {
  const plainCard = createRenderedCard({
    controls: [{ type: "template", content: payload }]
  }, createHass());
  assert.equal(plainCard.shadowRoot.querySelector(".btn-name").textContent, payload);
  assert.equal(plainCard.shadowRoot.querySelector(".injection-payload"), null);
  plainCard.remove();

  const trustedCard = createRenderedCard({
    controls: [{ type: "template", trusted_html: true, content: "<strong>Trusted markup</strong>" }]
  }, createHass());
  assert.equal(trustedCard.shadowRoot.querySelector(".btn-name strong").textContent, "Trusted markup");
  trustedCard.remove();
});

test("sparkline SVG attributes are created without parsing attribute-breaking values", () => {
  const card = createRenderedCard({ controls: [] }, createHass());
  const wrapper = document.createElement("div");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  wrapper.appendChild(svg);
  const strokePayload = 'red" onload="window.__roomCardInjected = true';

  card._drawSparkline(wrapper, [{ x: 0, y: 1 }, { x: 1, y: 2 }], strokePayload);

  assert.equal(svg.children.length, 2);
  assert.equal(svg.querySelector("polyline").getAttribute("stroke"), strokePayload);
  assert.equal(svg.querySelector("[onload]"), null);
  assert.equal(window.__roomCardInjected, undefined);
  card.remove();
});

test("the editor summary treats configuration text as text", () => {
  const editor = document.createElement("oneline-room-card-editor");
  document.body.appendChild(editor);
  editor.hass = createHass();
  editor.setConfig({ controls: [{ entity: "sensor.payload", name: payload }] });

  const summary = editor.shadowRoot.querySelector(".summary-text");
  assert.match(summary.textContent, /injection-payload/);
  assert.equal(summary.querySelector(".injection-payload"), null);
  assert.equal(window.__roomCardInjected, undefined);
  editor.remove();
});
