import { replaceTemplateExpressions, trimStr } from "../lib/values.js";
import { isEntityOffline } from "../lib/states.js";
import { evaluateAdaptiveImageConditions as evaluateAdaptiveConditions } from "../lib/conditions.js";
import { getTranslation } from "../i18n/translations.js";
import { VERSION } from "../version.js";

// Shared presentation support for runtime and editor. Environment/DOM helpers
// stay here, separate from browser-independent lib functions. No registration.
const IMAGE_UPLOAD_LIMITS = Object.freeze({
  maxSourceBytes: 20 * 1024 * 1024,
  maxDimension: 2560,
  quality: 0.86,
  supportedTypes: ["image/jpeg", "image/png", "image/webp"]
});

const parseImagePosition = (value) => {
  const match = typeof value === "string"
    ? value.trim().match(/^(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/)
    : null;
  if (!match) return { x: 50, y: 50, value: "50% 50%", isDefault: true };
  const x = Math.max(0, Math.min(100, Number(match[1])));
  const y = Math.max(0, Math.min(100, Number(match[2])));
  return { x, y, value: `${x}% ${y}%`, isDefault: x === 50 && y === 50 };
};

const validateImageUpload = (file) => {
  if (!file || !IMAGE_UPLOAD_LIMITS.supportedTypes.includes(String(file.type || "").toLowerCase())) return "upload_unsupported";
  if (!Number.isFinite(file.size) || file.size <= 0) return "upload_decode_error";
  if (file.size > IMAGE_UPLOAD_LIMITS.maxSourceBytes) return "upload_too_large";
  return "";
};

const ROOM_IMAGE_PRESETS = Object.freeze([
  { id: "living-room", file: "living-room.jpg", labelKey: "image_preset_living_room" },
  { id: "kitchen", file: "kitchen.jpg", labelKey: "image_preset_kitchen" },
  { id: "bedroom", file: "bedroom.jpg", labelKey: "image_preset_bedroom" },
  { id: "bathroom", file: "bathroom.jpg", labelKey: "image_preset_bathroom" },
  { id: "dining-room", file: "dining-room.jpg", labelKey: "image_preset_dining_room" },
  { id: "home-office", file: "home-office.jpg", labelKey: "image_preset_home_office" },
  { id: "childrens-room", file: "childrens-room.jpg", labelKey: "image_preset_childrens_room" },
  { id: "hallway", file: "hallway.jpg", labelKey: "image_preset_hallway" },
  { id: "guest-room", file: "guest-room.jpg", labelKey: "image_preset_guest_room" },
  { id: "garage", file: "garage.jpg", labelKey: "image_preset_garage" },
  { id: "garden-patio", file: "garden-patio.jpg", labelKey: "image_preset_garden_patio" },
  { id: "balcony", file: "balcony.jpg", labelKey: "image_preset_balcony" },
  { id: "basement", file: "basement.jpg", labelKey: "image_preset_basement" },
  { id: "laundry-room", file: "laundry-room.jpg", labelKey: "image_preset_laundry_room" },
  { id: "attic", file: "attic.jpg", labelKey: "image_preset_attic" },
  { id: "workshop", file: "workshop.jpg", labelKey: "image_preset_workshop" }
]);
const ROOM_IMAGE_PRESET_MAP = new Map(ROOM_IMAGE_PRESETS.map((preset) => [preset.id, preset]));

const getRoomImagePresetUrl = (presetId) => {
  const preset = ROOM_IMAGE_PRESET_MAP.get(String(presetId || ""));
  if (!preset) return "";
  let url;
  try {
    url = new URL(`./rooms/${preset.file}`, import.meta.url);
  } catch (_error) {
    url = new URL(`./rooms/${preset.file}`, globalThis.location?.href || "http://localhost/");
  }
  url.searchParams.set("v", VERSION);
  return url.href;
};

const resolveRoomImageUrl = (config) => {
  const customImage = typeof config?.image === "string" ? config.image.trim() : "";
  if (customImage) return customImage;
  return getRoomImagePresetUrl(config?.image_preset);
};

const evaluateAdaptiveImageConditions = (conditions, hass, now = new Date()) =>
  evaluateAdaptiveConditions(conditions, hass, now, typeof window.matchMedia === "function" ? window.matchMedia.bind(window) : undefined);

const resolveAdaptiveRoomImage = (config, hass, now = new Date()) => {
  const fallback = {
    url: resolveRoomImageUrl(config),
    position: parseImagePosition(config?.image_position).value,
    ruleIndex: -1
  };
  const rules = Array.isArray(config?.adaptive_images) ? config.adaptive_images : [];
  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];
    if (!rule || typeof rule !== "object") continue;
    const condition = evaluateAdaptiveImageConditions(rule.conditions, hass, now);
    if (!condition.valid || !condition.active) continue;
    const url = resolveRoomImageUrl(rule);
    if (!url) continue;
    return {
      url,
      position: parseImagePosition(rule.image_position || config?.image_position).value,
      ruleIndex: index
    };
  }
  return fallback;
};

const POWER_UNIT_FACTORS = Object.freeze({ mW: 0.001, W: 1, kW: 1000, MW: 1000000 });

const getStatusGroupResult = (group, hass) => {
  const empty = { visible: false, value: "", numericValue: 0, contributors: [], error: "" };
  if (!group || typeof group !== "object") return empty;
  if (Array.isArray(group.conditions) && group.conditions.length > 0) {
    const gate = evaluateAdaptiveImageConditions(group.conditions, hass);
    if (!gate.valid || !gate.active) return empty;
  }
  const entries = (Array.isArray(group.entities) ? group.entities : [])
    .map((item) => typeof item === "string" ? { entity: item } : item)
    .filter((item) => item && typeof item.entity === "string" && item.entity.trim());
  const numericMode = group.aggregate === "sum" || group.display === "value";
  const contributors = [];
  entries.forEach((entry) => {
    const entityId = entry.entity.trim();
    const stateObj = hass?.states?.[entityId];
    if (!stateObj || isEntityOffline(stateObj)) return;
    if (Array.isArray(entry.conditions) && entry.conditions.length > 0) {
      const condition = evaluateAdaptiveImageConditions(entry.conditions, hass);
      if (!condition.valid || !condition.active) return;
    }
    const configuredStates = Array.isArray(entry.active_states)
      ? entry.active_states
      : (Array.isArray(group.active_states) ? group.active_states : (numericMode ? [] : ["on"]));
    const activeStates = configuredStates.map((state) => String(state).toLowerCase().trim()).filter(Boolean);
    if (activeStates.length > 0 && !activeStates.includes(String(stateObj.state).toLowerCase().trim())) return;
    const number = Number(stateObj.state);
    if (numericMode && !Number.isFinite(number)) return;
    contributors.push({
      entity_id: entityId,
      friendly_name: stateObj.attributes?.friendly_name || entityId,
      icon: stateObj.attributes?.icon || "mdi:information-outline",
      state: hass?.formatEntityState ? hass.formatEntityState(stateObj) : String(stateObj.state ?? ""),
      number,
      unit: trimStr(stateObj.attributes?.unit_of_measurement)
    });
  });

  if (!numericMode) {
    const count = contributors.length;
    return {
      visible: !(group.hide_when_zero === true && count === 0),
      value: String(count),
      numericValue: count,
      contributors,
      error: ""
    };
  }

  const requestedUnit = trimStr(group.unit);
  const units = contributors.map((item) => item.unit).filter(Boolean);
  const targetUnit = requestedUnit || units[0] || "";
  const allPower = units.length > 0 && units.every((unit) => POWER_UNIT_FACTORS[unit] !== undefined);
  const hasMissingUnit = units.length !== contributors.length;
  const compatible = (!targetUnit && units.length === 0)
    || (!hasMissingUnit && (units.every((unit) => unit === targetUnit) || (allPower && POWER_UNIT_FACTORS[targetUnit] !== undefined)));
  if (!compatible) {
    return { visible: true, value: "—", numericValue: NaN, contributors, error: "status_group_incompatible_units" };
  }
  const total = contributors.reduce((sum, item) => {
    if (!item.unit || item.unit === targetUnit) return sum + item.number;
    return sum + ((item.number * POWER_UNIT_FACTORS[item.unit]) / POWER_UNIT_FACTORS[targetUnit]);
  }, 0);
  const precision = Math.max(0, Math.min(4, Number.isFinite(Number(group.precision)) ? Number(group.precision) : 1));
  const locale = hass?.locale?.language || hass?.language || undefined;
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: precision }).format(total);
  return {
    visible: !(group.hide_when_zero === true && total === 0),
    value: targetUnit ? `${formatted} ${targetUnit}` : formatted,
    numericValue: total,
    contributors,
    error: ""
  };
};

const isHeaderManualColorEnabled = (config) => !!trimStr(config?.color);

const resolveLabelPosition = (btn, config) => {
  const globalPos = config?.global_label_position ?? config?.buttons_label_position ?? "right";
  const per = btn?.label_position;
  if (!per || per === "global") return globalPos;
  return per;
};

const setAlignmentClass = (el, pos) => {
  if (!el) return;
  el.classList.remove("label-right", "label-left", "label-bottom", "label-top");
  el.classList.add(
    pos === "bottom"
      ? "label-bottom"
      : (pos === "left"
        ? "label-left"
        : (pos === "top" ? "label-top" : "label-right"))
  );
};

const applyLabelPosition = (layoutEl, pos) => {
  if (!layoutEl) return;
  // Reset layout element inline styles
  layoutEl.style.flexDirection = "";
  layoutEl.style.alignItems = "";
  layoutEl.style.justifyContent = "";
  layoutEl.style.gap = "";
  layoutEl.style.textAlign = "";
  layoutEl.style.padding = "";
  layoutEl.style.overflow = "";
  layoutEl.style.flexWrap = "";

  // Reset common child inline styles if any
  const txt = layoutEl.querySelector(".btn-txt");
  if (txt) {
    txt.style.textAlign = "";
    txt.style.alignItems = "";
    txt.style.flex = "";
    txt.style.minHeight = "";
    txt.style.maxWidth = "";
    txt.style.overflow = "";
    txt.style.whiteSpace = "";
  }
  const iconBox = layoutEl.querySelector(".icon-box");
  if (iconBox) {
    iconBox.style.flexShrink = "";
  }
  const nameEl = layoutEl.querySelector(".btn-name");
  if (nameEl) {
    nameEl.style.overflow = "";
    nameEl.style.textOverflow = "";
    nameEl.style.whiteSpace = "";
    nameEl.style.maxWidth = "";
    nameEl.style.lineHeight = "";
    nameEl.style.fontSize = "";
  }
  const stateEl = layoutEl.querySelector(".btn-state");
  if (stateEl) {
    stateEl.style.overflow = "";
    stateEl.style.textOverflow = "";
    stateEl.style.whiteSpace = "";
    stateEl.style.maxWidth = "";
    stateEl.style.lineHeight = "";
    stateEl.style.fontSize = "";
  }

  layoutEl.classList.remove("label-right", "label-left", "label-bottom", "label-top");
  setAlignmentClass(layoutEl, pos);
};

const evalTemplateString = (tpl, h, ctrl) => {
  if (tpl === undefined || tpl === null) return "";
  const str = String(tpl);
  if (!str.includes("${")) return str;
  try {
    const states = h?.states || {};
    const entity = (id) => states[id];
    const attr = (id, name) => states[id]?.attributes?.[name];
    return replaceTemplateExpressions(str, (expr) => {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function("hass", "states", "entity", "attr", "ctrl", `return (${expr});`);
        const res = fn(h, states, entity, attr, ctrl);
        return res === undefined || res === null ? "" : String(res);
      } catch (err) {
        return "";
      }
    });
  } catch (err) {
    return "";
  }
};

const resolveTemplateCtrl = (ctrl, h) => {
  const content = evalTemplateString(ctrl.content, h, ctrl);
  const icon = trimStr(evalTemplateString(ctrl.icon, h, ctrl));
  const color = trimStr(evalTemplateString(ctrl.color, h, ctrl));
  const state = evalTemplateString(ctrl.state, h, ctrl);
  return { content, icon, color, state };
};

const resolveSubChipPresentations = (ctrl, h) => {
  const presentations = [];
  for (const chip of (Array.isArray(ctrl?.sub_chips) ? ctrl.sub_chips : [])) {
    if (!chip?.entity || !h?.states?.[chip.entity]) continue;
    const chipState = h.states[chip.entity];
    const value = chip.attribute
      ? chipState.attributes?.[chip.attribute]
      : (h.formatEntityState ? h.formatEntityState(chipState) : chipState.state);
    const displayValue = value != null ? String(value) : "";
    let label = chip.label || "";
    if (label.includes("{state}")) label = label.replace("{state}", displayValue);
    else if (label && displayValue) label = `${label}: ${displayValue}`;
    else if (!label && displayValue) label = displayValue;
    presentations.push({ icon: chip.icon || "", label });
  }
  return presentations;
};

const TEMPLATE_VALUE_KEYS = Object.freeze(["content", "icon", "color", "state"]);

const getTemplateEntityDependencies = (ctrl) => {
  const dependencies = new Set();
  const add = (entityId) => {
    const value = trimStr(entityId);
    if (/^[a-z0-9_]+\.[a-z0-9_]+$/i.test(value || "")) dependencies.add(value);
  };
  const declared = ctrl?.template_entities ?? ctrl?.dependencies;
  (Array.isArray(declared) ? declared : (typeof declared === "string" ? declared.split(",") : [])).forEach(add);
  const source = TEMPLATE_VALUE_KEYS.map((key) => String(ctrl?.[key] ?? "")).join("\n");
  const patterns = [
    /(?:entity|attr)\(\s*["']([^"']+)["']/g,
    /(?:hass\.)?states\s*\[\s*["']([^"']+)["']\s*\]/g
  ];
  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(source)) !== null) add(match[1]);
  });
  return Array.from(dependencies);
};

const templateNeedsEveryHassUpdate = (ctrl) => {
  const source = TEMPLATE_VALUE_KEYS.map((key) => String(ctrl?.[key] ?? "")).join("\n");
  return source.includes("${") && getTemplateEntityDependencies(ctrl).length === 0;
};



// =============================================================================
// LAST CHANGED HELPER
// =============================================================================
function formatLastChanged(lastChanged, hass) {
  if (!lastChanged) return "";
  const elapsedSec = Math.floor((Date.now() - new Date(lastChanged)) / 1000);
  if (elapsedSec < 60) return getTranslation(hass, "lc_just_now");
  const elapsedMin = Math.floor(elapsedSec / 60);
  if (elapsedMin < 60) return `${elapsedMin} min`;
  const elapsedHours = Math.floor(elapsedMin / 60);
  const remMin = elapsedMin % 60;
  if (elapsedHours < 24) return remMin > 0 ? `${elapsedHours}h ${remMin}min` : `${elapsedHours}h`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays}d`;
}

export { IMAGE_UPLOAD_LIMITS, parseImagePosition, validateImageUpload, ROOM_IMAGE_PRESETS, ROOM_IMAGE_PRESET_MAP, getRoomImagePresetUrl, resolveRoomImageUrl, evaluateAdaptiveImageConditions, resolveAdaptiveRoomImage, POWER_UNIT_FACTORS, getStatusGroupResult, isHeaderManualColorEnabled, resolveLabelPosition, setAlignmentClass, applyLabelPosition, evalTemplateString, resolveTemplateCtrl, resolveSubChipPresentations, TEMPLATE_VALUE_KEYS, getTemplateEntityDependencies, templateNeedsEveryHassUpdate, formatLastChanged };
