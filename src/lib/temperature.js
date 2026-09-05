import { formatEntityStateForDisplay, formatEntityAttributeForDisplay } from "./formatting.js";

const normalizeTemperatureUnit = (unit) => {
  const normalized = String(unit || "").trim().replace(/\s+/g, "").replace("º", "°").toUpperCase();
  if (normalized === "C" || normalized === "°C") return "°C";
  if (normalized === "F" || normalized === "°F") return "°F";
  return "";
};

const convertTemperatureValue = (value, sourceUnit, targetUnit) => {
  const numeric = Number(value);
  const source = normalizeTemperatureUnit(sourceUnit);
  const target = normalizeTemperatureUnit(targetUnit);
  if (!Number.isFinite(numeric) || !source || !target) return null;
  if (source === target) return numeric;
  return source === "°C"
    ? (numeric * 9 / 5) + 32
    : (numeric - 32) * 5 / 9;
};

const temperatureNumberLocale = (hass) => {
  switch (hass?.locale?.number_format) {
    case "comma_decimal": return ["en-US", "en"];
    case "decimal_comma": return ["de", "es", "it"];
    case "space_comma": return ["fr", "sv", "cs"];
    case "quote_decimal": return ["de-CH"];
    case "system": return undefined;
    default: return hass?.locale?.language || hass?.language || undefined;
  }
};

const formatConvertedTemperature = (hass, stateObj, value, sourceUnit, targetUnit, fallbackPrecision = 1) => {
  const target = normalizeTemperatureUnit(targetUnit);
  const converted = convertTemperatureValue(value, sourceUnit, target);
  if (converted == null) return "";
  const configuredPrecision = hass?.entities?.[stateObj?.entity_id]?.display_precision;
  const registryPrecision = configuredPrecision == null ? NaN : Number(configuredPrecision);
  const precision = Number.isInteger(registryPrecision) && registryPrecision >= 0
    ? Math.min(registryPrecision, 6)
    : fallbackPrecision;
  const fixedValue = converted.toFixed(precision);
  const syntheticState = {
    ...(stateObj || {}),
    entity_id: "sensor.room_card_temperature",
    state: fixedValue,
    attributes: {
      ...(stateObj?.attributes || {}),
      device_class: "temperature",
      unit_of_measurement: target
    }
  };
  try {
    if (typeof hass?.formatEntityState === "function") return hass.formatEntityState(syntheticState);
  } catch (_e) { }
  const noGrouping = hass?.locale?.number_format === "none";
  const formatted = new Intl.NumberFormat(noGrouping ? "en-US" : temperatureNumberLocale(hass), {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    useGrouping: !noGrouping
  }).format(converted);
  return `${formatted}\u00a0${target}`;
};

const formatTemperatureStateForDisplay = (hass, stateObj, targetUnit, fallbackSourceUnit = "°C") => {
  if (!stateObj) return "";
  const target = normalizeTemperatureUnit(targetUnit);
  const source = normalizeTemperatureUnit(stateObj.attributes?.unit_of_measurement)
    || normalizeTemperatureUnit(fallbackSourceUnit);
  if (!target || !source || target === source) {
    return formatEntityStateForDisplay(hass, stateObj, source || fallbackSourceUnit);
  }
  return formatConvertedTemperature(hass, stateObj, stateObj.state, source, target, 1)
    || formatEntityStateForDisplay(hass, stateObj, source || fallbackSourceUnit);
};

const formatTemperatureAttributeForDisplay = (hass, stateObj, attribute, value, targetUnit, fallbackSourceUnit = "°C") => {
  const source = normalizeTemperatureUnit(hass?.config?.unit_system?.temperature)
    || normalizeTemperatureUnit(fallbackSourceUnit);
  const target = normalizeTemperatureUnit(targetUnit);
  if (!target || !source || target === source) {
    return formatEntityAttributeForDisplay(hass, stateObj, attribute, value, source || fallbackSourceUnit);
  }
  return formatConvertedTemperature(hass, stateObj, value, source, target, 1)
    || formatEntityAttributeForDisplay(hass, stateObj, attribute, value, source || fallbackSourceUnit);
};

export { normalizeTemperatureUnit, convertTemperatureValue, temperatureNumberLocale, formatConvertedTemperature, formatTemperatureStateForDisplay, formatTemperatureAttributeForDisplay };
