import assert from "node:assert/strict";
import test from "node:test";

import { installDomEnvironment, importRoomCard } from "./support/dom-env.mjs";
import { TRANSLATIONS, getTranslation } from "../src/i18n/translations.js";

test("all supported languages have the same non-empty translation keys", () => {
  const keys = Object.keys(TRANSLATIONS.en).sort();
  for (const [language, translations] of Object.entries(TRANSLATIONS)) {
    assert.deepEqual(Object.keys(translations).sort(), keys, `${language}: translation keys differ`);
    for (const key of keys) {
      assert.equal(typeof translations[key], "string", `${language}.${key}`);
      assert.ok(translations[key].trim(), `${language}.${key} is empty`);
    }
  }
});

test("translations preserve interpolation placeholders in every language", () => {
  const placeholders = (text) => (text.match(/\{[^}]+\}/g) || []).sort();
  for (const [language, translations] of Object.entries(TRANSLATIONS)) {
    for (const [key, source] of Object.entries(TRANSLATIONS.en)) {
      assert.deepEqual(placeholders(translations[key] || ""), placeholders(source), `${language}.${key}`);
    }
  }
});

test("regional languages resolve localized editor labels and unknown languages fall back to English", () => {
  assert.equal(getTranslation({ language: "de-DE" }, "tmpl_state"), "Status (Template)");
  assert.equal(getTranslation({ language: "fr-FR" }, "chip_add"), "Ajouter une puce");
  assert.equal(getTranslation({ language: "fr-CA" }, "visibility_cond"), "Visibilité conditionnelle");
  assert.equal(getTranslation({ language: "en-GB" }, "sparkline_average"), "Average");
  assert.equal(getTranslation({ language: "es" }, "room_modes"), TRANSLATIONS.en.room_modes);
});

test("the shipped artifact contains the exact source dictionaries and lookup behavior", async () => {
  installDomEnvironment();
  const artifact = await importRoomCard();
  assert.deepEqual(artifact.TRANSLATIONS, TRANSLATIONS);
  for (const language of ["en", "de-DE", "fr-CA", "unknown"]) {
    for (const key of [...Object.keys(TRANSLATIONS.en), "unknown_key"]) {
      assert.equal(artifact.getTranslation({ language }, key), getTranslation({ language }, key));
    }
  }
});
