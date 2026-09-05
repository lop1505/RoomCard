const STATE_DEFINITIONS = Object.freeze({
  OFFLINE_STATES: new Set(["unavailable", "unknown"]),
  ACTIVE_STATES: {
    default: new Set(["on", "open", "playing", "heat", "cool", "auto", "drying", "fan_only", "cleaning", "manual", "boost", "unlocked", "home"]),
    climate: new Set(["heat", "cool", "auto", "drying", "fan_only"]),
    media_player: new Set(["playing"])
  },
  INACTIVE_STATES: Object.freeze({
    off: "off",
    closed: "closed"
  }),
  ON_STATE: "on"
});

// Built-in state-dependent icon maps per domain — used when no static icon is configured
const DOMAIN_STATE_ICON_MAPS = Object.freeze({
  light: { on: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
  switch: { on: "mdi:toggle-switch", off: "mdi:toggle-switch-off-outline" },
  input_boolean: { on: "mdi:toggle-switch", off: "mdi:toggle-switch-off-outline" },
  fan: { on: "mdi:fan", off: "mdi:fan-off" },
  lock: { locked: "mdi:lock", unlocked: "mdi:lock-open-outline" },
  cover: {
    open: "mdi:window-shutter-open", closed: "mdi:window-shutter",
    opening: "mdi:window-shutter-open", closing: "mdi:window-shutter"
  },
  media_player: { playing: "mdi:cast-connected", paused: "mdi:cast-connected", idle: "mdi:cast", off: "mdi:cast-off" },
});

const getEntityDomain = (entityId) => (typeof entityId === "string" && entityId.includes(".") ? entityId.split(".")[0] : "");

const getEntityStateValue = (stateObj) => stateObj?.state;

const isOfflineStateValue = (stateValue) => STATE_DEFINITIONS.OFFLINE_STATES.has(stateValue);

const isEntityOffline = (stateObj) => isOfflineStateValue(getEntityStateValue(stateObj));

const isEntityOn = (stateObj) => getEntityStateValue(stateObj) === STATE_DEFINITIONS.ON_STATE;

const isEntityOff = (stateObj) => getEntityStateValue(stateObj) === STATE_DEFINITIONS.INACTIVE_STATES.off;

const isEntityActive = (stateObj, entityId) => {
  const stateValue = getEntityStateValue(stateObj);
  if (stateValue === undefined || stateValue === null) return false;
  const domain = getEntityDomain(entityId);
  const domainActive = STATE_DEFINITIONS.ACTIVE_STATES[domain];
  if (domainActive?.has(stateValue)) return true;
  if (STATE_DEFINITIONS.ACTIVE_STATES.default.has(stateValue)) return true;
  if (domain === "cover") return stateValue !== STATE_DEFINITIONS.INACTIVE_STATES.closed;
  if (domain === "climate") return stateValue !== STATE_DEFINITIONS.INACTIVE_STATES.off && !isOfflineStateValue(stateValue);
  return false;
};

export { STATE_DEFINITIONS, DOMAIN_STATE_ICON_MAPS, getEntityDomain, getEntityStateValue, isOfflineStateValue, isEntityOffline, isEntityOn, isEntityOff, isEntityActive };
