import { trimStr } from "./values.js";

const formatEntityStateForDisplay = (hass, stateObj, fallbackUnit = "") => {
  if (!stateObj) return "";
  try {
    if (typeof hass?.formatEntityState === "function") {
      const formatted = hass.formatEntityState(stateObj);
      const entityUnit = trimStr(stateObj.attributes?.unit_of_measurement) || "";
      return !entityUnit && fallbackUnit ? `${formatted}${fallbackUnit}` : formatted;
    }
  } catch (_e) { }
  const raw = stateObj.state ?? "";
  const entityUnit = trimStr(stateObj.attributes?.unit_of_measurement) || fallbackUnit;
  return `${raw}${entityUnit || ""}`;
};

const formatEntityAttributeForDisplay = (hass, stateObj, attribute, value, fallbackUnit = "") => {
  if (!stateObj || value == null) return "";
  try {
    if (typeof hass?.formatEntityAttributeValue === "function") {
      return hass.formatEntityAttributeValue(stateObj, attribute, value);
    }
  } catch (_e) { }
  return `${value}${fallbackUnit || ""}`;
};

export { formatEntityStateForDisplay, formatEntityAttributeForDisplay };
