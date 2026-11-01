import { trimStr } from "./values.js";

const getEntityDisplayName = (hass, entityId, explicitName) => {
  // An explicit empty control name is intentional, too.
  if (typeof explicitName === "string") return explicitName;
  const stateObj = hass?.states?.[entityId];
  try {
    if (stateObj && typeof hass?.formatEntityName === "function") {
      const name = hass.formatEntityName(stateObj);
      if (typeof name === "string" && name.trim()) return name;
    }
  } catch (_error) { }
  return stateObj?.attributes?.friendly_name || entityId || "";
};

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

export { getEntityDisplayName, formatEntityStateForDisplay, formatEntityAttributeForDisplay };
