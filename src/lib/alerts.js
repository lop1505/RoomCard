const normalizeAlertSensorConfig = (cfg) => {
  if (!cfg) return null;
  if (typeof cfg === "string") return { entity: cfg };
  if (typeof cfg === "object") {
    const normalized = { ...cfg };
    if (normalized.state && typeof normalized.state === "string") {
      normalized.state = normalized.state.split(",").map(s => String(s).toLowerCase().trim()).filter(Boolean);
    } else if (Array.isArray(normalized.state)) {
      normalized.state = normalized.state.map(s => String(s).toLowerCase().trim()).filter(Boolean);
    }
    return normalized;
  }
  return null;
};

const isAlertSensorActive = (alertCfg, stateObj, normalize = normalizeAlertSensorConfig) => {
  if (!alertCfg || !stateObj) return false;
  const current = String(stateObj.state).toLowerCase().trim();
  const normalized = normalize(alertCfg);
  if (!normalized || !normalized.entity) return false;
  if (Array.isArray(normalized.state) && normalized.state.length > 0) {
    return normalized.state.includes(current);
  }
  const numeric = Number(stateObj.state);
  const hasNumeric = Number.isFinite(numeric);
  const compareNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : NaN;
  const above = compareNumber(normalized.above ?? normalized.min);
  const below = compareNumber(normalized.below ?? normalized.max);
  if (!Number.isNaN(above) && hasNumeric && numeric > above) return true;
  if (!Number.isNaN(below) && hasNumeric && numeric < below) return true;
  const activeStates = ["on", "open", "true", "active", "alarm", "warning", "detected", "triggered", "problem", "motion", "error"];
  return activeStates.includes(current);
};

export { normalizeAlertSensorConfig, isAlertSensorActive };
