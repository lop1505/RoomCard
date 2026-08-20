import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

class HTMLElementStub {
  attachShadow() {
    this.shadowRoot = {};
    return this.shadowRoot;
  }
}

const registeredElements = new Map();
globalThis.HTMLElement = HTMLElementStub;
globalThis.window = {};
globalThis.customElements = {
  define: (name, constructor) => registeredElements.set(name, constructor),
  get: (name) => registeredElements.get(name),
  whenDefined: () => Promise.resolve()
};

const sourceUrl = new URL("../dist/room-card.js", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
await import(moduleUrl);

const RoomCard = registeredElements.get("oneline-room-card");
assert.ok(RoomCard, "RoomCard custom element should be registered");

const entityId = "sensor.room_temperature";
const createHass = () => ({
  language: "en",
  locale: { language: "en-US", number_format: "comma_decimal" },
  config: {
    unit_system: {
      temperature: "°C",
      length: "km",
      pressure: "Pa"
    }
  },
  entities: {
    [entityId]: {
      display_precision: 2,
      unit_of_measurement: "°C",
      device_class: "temperature"
    }
  },
  states: {
    [entityId]: {
      entity_id: entityId,
      state: "21.1234",
      attributes: {
        friendly_name: "Room temperature",
        unit_of_measurement: "°C",
        device_class: "temperature"
      }
    }
  }
});

const shouldUpdateAfter = (mutate) => {
  const initialHass = createHass();
  const card = new RoomCard();
  card.config = { controls: [{ type: "sensor", entity: entityId }] };
  card.content = {};
  card._captureStateSnapshot(initialHass);

  const nextHass = structuredClone(initialHass);
  mutate(nextHass);
  return card._shouldUpdateFromHass(nextHass);
};

assert.equal(shouldUpdateAfter(() => {}), false, "unchanged formatting metadata should stay cached");
assert.equal(shouldUpdateAfter((hass) => { hass.entities[entityId].display_precision = 1; }), true, "display precision should invalidate the snapshot");
assert.equal(shouldUpdateAfter((hass) => { hass.states[entityId].attributes.unit_of_measurement = "°F"; }), true, "state unit should invalidate the snapshot");
assert.equal(shouldUpdateAfter((hass) => { hass.states[entityId].attributes.device_class = "humidity"; }), true, "state device class should invalidate the snapshot");
assert.equal(shouldUpdateAfter((hass) => { hass.entities[entityId].unit_of_measurement = "°F"; }), true, "registry unit override should invalidate the snapshot");
assert.equal(shouldUpdateAfter((hass) => { hass.locale.number_format = "decimal_comma"; }), true, "number format should invalidate the snapshot");
assert.equal(shouldUpdateAfter((hass) => { hass.locale.language = "de-DE"; }), true, "locale language should invalidate the snapshot");
assert.equal(shouldUpdateAfter((hass) => { hass.config.unit_system.pressure = "bar"; }), true, "unit-system metadata should invalidate the snapshot");
assert.equal(shouldUpdateAfter((hass) => { hass.states["sensor.unrelated"] = { state: "on", attributes: {} }; }), false, "unrelated entity updates should stay filtered");

const initialHass = createHass();
const card = new RoomCard();
card.config = { controls: [{ type: "sensor", entity: entityId }] };
card.content = {};
card._captureStateSnapshot(initialHass);
let updateCount = 0;
card._updateContentState = () => { updateCount += 1; };

const precisionChangedHass = structuredClone(initialHass);
precisionChangedHass.entities[entityId].display_precision = 1;
card.hass = precisionChangedHass;
assert.equal(updateCount, 1, "the hass setter should rerender after a formatting metadata change");
card.hass = structuredClone(precisionChangedHass);
assert.equal(updateCount, 1, "the updated snapshot should suppress an identical follow-up update");

console.log("Render signature regression tests passed.");
