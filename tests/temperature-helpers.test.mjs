import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTemperatureUnit, convertTemperatureValue, temperatureNumberLocale,
  formatConvertedTemperature, formatTemperatureStateForDisplay, formatTemperatureAttributeForDisplay
} from "../src/lib/temperature.js";

test("temperature helpers normalize supported units and reject unsupported conversions", () => {
  assert.equal(normalizeTemperatureUnit(" º f "), "°F");
  assert.equal(normalizeTemperatureUnit("kelvin"), "");
  assert.equal(convertTemperatureValue(0, "C", "F"), 32);
  assert.equal(convertTemperatureValue(212, "F", "C"), 100);
  assert.equal(convertTemperatureValue("bad", "C", "F"), null);
  assert.equal(convertTemperatureValue(21, "K", "C"), null);
  assert.deepEqual(temperatureNumberLocale({ locale: { number_format: "space_comma" } }), ["fr", "sv", "cs"]);
});

test("converted temperature delegates synthetic state and registry precision to HA", () => {
  const sensor = { entity_id: "sensor.temp", state: "0", attributes: { unit_of_measurement: "°C" } };
  const hass = { entities: { "sensor.temp": { display_precision: 2 } }, formatEntityState(state) {
    assert.equal(state.entity_id, "sensor.room_card_temperature");
    assert.equal(state.state, "32.00");
    assert.equal(state.attributes.unit_of_measurement, "°F");
    return "HA 32.00 °F";
  } };
  assert.equal(formatConvertedTemperature(hass, sensor, 0, "C", "F"), "HA 32.00 °F");
  assert.equal(sensor.state, "0");
  assert.equal(formatConvertedTemperature({ locale: { number_format: "none" } }, sensor, 0, "C", "F"), "32.0\u00a0°F");
});

test("temperature state and attribute fallbacks keep the previous behavior", () => {
  const sensor = { state: "invalid", attributes: { unit_of_measurement: "°C" } };
  assert.equal(formatTemperatureStateForDisplay({}, sensor, "F"), "invalid°C");
  assert.equal(formatTemperatureStateForDisplay({}, null, "F"), "");
  assert.equal(formatTemperatureAttributeForDisplay({ config: { unit_system: { temperature: "°F" } } }, sensor, "temperature", 32, "C"), "0.0\u00a0°C");
  assert.equal(formatTemperatureAttributeForDisplay({}, sensor, "temperature", 21, "C"), "21°C");
});
