import { clampNum, replaceTemplateExpressions, trimStr } from "./lib/values.js";

import { formatEntityStateForDisplay, formatEntityAttributeForDisplay } from "./lib/formatting.js";

import { normalizeTemperatureUnit, convertTemperatureValue, temperatureNumberLocale, formatConvertedTemperature, formatTemperatureStateForDisplay, formatTemperatureAttributeForDisplay } from "./lib/temperature.js";

import { hexToRgba, readableTextForHex, parseColorToPickerHex } from "./lib/colors.js";

import { STATE_DEFINITIONS, DOMAIN_STATE_ICON_MAPS, getEntityDomain, getEntityStateValue, isOfflineStateValue, isEntityOffline, isEntityOn, isEntityOff, isEntityActive } from "./lib/states.js";

import { evaluateAdaptiveImageConditions as evaluateAdaptiveConditions, getConditionEntityDependencies, evaluateRoomModeActiveWhen, evaluateVisibilityCondition } from "./lib/conditions.js";

import { normalizeAlertSensorConfig, isAlertSensorActive } from "./lib/alerts.js";

import { TRANSLATIONS, getTranslation } from "./i18n/translations.js";

import { buildHassActionDetail } from "./lib/actions.js";

import { SHARED_SPARKLINE_CACHE, SHARED_SPARKLINE_PENDING, SHARED_SPARKLINE_CACHE_LIMIT, SHARED_SPARKLINE_MAX_AGE_MS, normalizeSparklineSamples, getSparklineStats, pruneSharedSparklineCache, fetchHistorySamples } from "./lib/history.js";

import { MEDIA_PLAYER_FEATURES, getSliderCapabilities, getInlineButtons, supportsMediaFeature } from "./lib/capabilities.js";

import { VERSION, EDITOR_DOM_REVISION } from "./version.js";
import { OneLineRoomCard } from "./card/room-card.js";
import { OneLineRoomCardEditor } from "./editor/room-card-editor.js";
import { OneLineRoomCardTextField } from "./editor/text-field-compat.js";
import { IMAGE_UPLOAD_LIMITS, parseImagePosition, validateImageUpload, ROOM_IMAGE_PRESETS, ROOM_IMAGE_PRESET_MAP, getRoomImagePresetUrl, resolveRoomImageUrl, evaluateAdaptiveImageConditions, resolveAdaptiveRoomImage, POWER_UNIT_FACTORS, getStatusGroupResult, isHeaderManualColorEnabled, resolveLabelPosition, setAlignmentClass, applyLabelPosition, evalTemplateString, resolveTemplateCtrl, resolveSubChipPresentations, TEMPLATE_VALUE_KEYS, getTemplateEntityDependencies, templateNeedsEveryHassUpdate, formatLastChanged } from "./shared/presentation.js";
const LOG_FLAG = `customCards_RoomCard_Logged_${VERSION}`;



if (!window[LOG_FLAG]) {
  console.info(
    `%c ONELINE-ROOM-CARD %c ${VERSION} `,
    "color: white; background: #2c3e50; font-weight: 700;",
    "color: white; background: #c0392b; font-weight: 700;"
  );
  window[LOG_FLAG] = true;
}

// Home Assistant no longer guarantees that its internal text field component is
// registered before a custom card editor is opened. Keep the editor usable on a
// cold dashboard load, then adopt HA's current/legacy input as soon as it exists.
if (!customElements.get("oneline-room-card-textfield")) {
  customElements.define("oneline-room-card-textfield", OneLineRoomCardTextField);
}

// TRANSLATIONS







// =============================================================================
// REGISTRATION (SAFE & ROBUST)
// =============================================================================

const findElementsAcrossShadowRoots = (root, selector) => {
  if (!root?.querySelectorAll) return [];
  const matches = [];
  const pendingRoots = [root];
  const visitedRoots = new Set();
  while (pendingRoots.length > 0) {
    const currentRoot = pendingRoots.pop();
    if (!currentRoot || visitedRoots.has(currentRoot)) continue;
    visitedRoots.add(currentRoot);
    currentRoot.querySelectorAll(selector).forEach((element) => matches.push(element));
    currentRoot.querySelectorAll("*").forEach((element) => {
      if (element.shadowRoot) pendingRoots.push(element.shadowRoot);
    });
  }
  return matches;
};

const patchExistingEditor = (ExistingEditor, NewEditor) => {
  Object.getOwnPropertyNames(NewEditor.prototype).forEach((name) => {
    if (name === "constructor") return;
    const descriptor = Object.getOwnPropertyDescriptor(NewEditor.prototype, name);
    if (descriptor) Object.defineProperty(ExistingEditor.prototype, name, descriptor);
  });
  if (typeof document === "undefined") return;
  findElementsAcrossShadowRoots(document, "oneline-room-card-editor").forEach((editor) => {
    if (!(editor instanceof ExistingEditor) || !editor._config) return;
    editor.render();
  });
};

const patchExistingCard = (ExistingCard, NewCard) => {
  Object.getOwnPropertyNames(NewCard.prototype).forEach((name) => {
    if (name === "constructor") return;
    const desc = Object.getOwnPropertyDescriptor(NewCard.prototype, name);
    if (desc) Object.defineProperty(ExistingCard.prototype, name, desc);
  });
  ["getStubConfig", "getConfigElement"].forEach((name) => {
    const desc = Object.getOwnPropertyDescriptor(NewCard, name);
    if (desc) Object.defineProperty(ExistingCard, name, desc);
  });
};

const existingEditor = customElements.get("oneline-room-card-editor");
if (!existingEditor) {
  customElements.define("oneline-room-card-editor", OneLineRoomCardEditor);
} else if (existingEditor !== OneLineRoomCardEditor) {
  patchExistingEditor(existingEditor, OneLineRoomCardEditor);
}

const existingCard = customElements.get("oneline-room-card");
if (!existingCard) {
  customElements.define("oneline-room-card", OneLineRoomCard);
} else if (existingCard !== OneLineRoomCard) {
  patchExistingCard(existingCard, OneLineRoomCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card?.type === "oneline-room-card")) {
  window.customCards.push({
    type: "oneline-room-card",
    name: "OneLine Room Card",
    preview: true,
    description: "Minimalist Room Card for Home Assistant"
  });
}

// Internal test seams: named ESM exports survive bundling without instrumenting
// the shipped artifact. These are not a supported consumer configuration API.
export {
  EDITOR_DOM_REVISION,
  OneLineRoomCardEditor,
  ROOM_IMAGE_PRESETS,
  SHARED_SPARKLINE_CACHE,
  SHARED_SPARKLINE_PENDING,
  TRANSLATIONS,
  clampNum,
  convertTemperatureValue,
  evalTemplateString,
  evaluateAdaptiveImageConditions,
  evaluateRoomModeActiveWhen,
  formatConvertedTemperature,
  formatEntityStateForDisplay,
  getConditionEntityDependencies,
  getRoomImagePresetUrl,
  getSparklineStats,
  getStatusGroupResult,
  getTemplateEntityDependencies,
  getTranslation,
  hexToRgba,
  normalizeSparklineSamples,
  normalizeTemperatureUnit,
  parseImagePosition,
  patchExistingEditor,
  pruneSharedSparklineCache,
  readableTextForHex,
  replaceTemplateExpressions,
  resolveAdaptiveRoomImage,
  templateNeedsEveryHassUpdate,
  validateImageUpload
};
