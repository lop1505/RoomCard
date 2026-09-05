import assert from "node:assert/strict";
import test from "node:test";
import { MEDIA_PLAYER_FEATURES, getSliderCapabilities, getInlineButtons, supportsMediaFeature } from "../src/lib/capabilities.js";

test("slider capabilities use explicit availability and preserve domain conversions", () => {
  const control = { entity: "light.room" };
  assert.deepEqual(getSliderCapabilities("light", { state: "on", attributes: {} }, control, true), { supported: false });
  assert.deepEqual(getSliderCapabilities("light", null, control, false), { supported: false });
  assert.equal(getSliderCapabilities("light", { attributes: { brightness: 128 } }, control, false).value, 50);
  const colorTemp = getSliderCapabilities("light", { attributes: { supported_color_modes: ["color_temp"], min_color_temp_kelvin: 2000, max_color_temp_kelvin: 6500, color_temp_kelvin: 4000 } }, { ...control, slider_mode: "color_temp" }, false);
  assert.equal(colorTemp.action, "color_temp_kelvin");
  assert.equal(colorTemp.min, 2000);
  assert.equal(getSliderCapabilities("climate", { attributes: { temperature: 21 } }, control, false).step, 0.5);
  assert.equal(getSliderCapabilities("fan", { attributes: { percentage_step: "25", percentage: 50 } }, control, false).step, 25);
  assert.equal(getSliderCapabilities("media_player", { attributes: { volume_level: 0.42 } }, control, false).value, 42);
  assert.equal(getSliderCapabilities("input_number", { state: "0", attributes: { min: 5, max: 10 } }, control, false).value, 5);
});

test("inline buttons and media feature masks retain their existing contracts", () => {
  assert.equal(getInlineButtons("cover")[1].service, "cover.stop_cover");
  assert.equal(getInlineButtons("media_player")[0].service, "media_player.media_previous_track");
  assert.deepEqual(getInlineButtons("unsupported"), []);
  assert.notEqual(getInlineButtons("light"), getInlineButtons("light"));
  assert.equal(supportsMediaFeature({ attributes: {} }, MEDIA_PLAYER_FEATURES.PLAY), true);
  assert.equal(supportsMediaFeature({ attributes: { supported_features: 0 } }, MEDIA_PLAYER_FEATURES.PLAY), false);
  assert.equal(supportsMediaFeature({ attributes: { supported_features: MEDIA_PLAYER_FEATURES.PLAY | MEDIA_PLAYER_FEATURES.PAUSE } }, MEDIA_PLAYER_FEATURES.PAUSE), true);
});
