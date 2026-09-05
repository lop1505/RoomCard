import { isEntityOff, STATE_DEFINITIONS } from "./states.js";

const buildHassActionDetail = (type, config, hass) => {
  const actionKey = `${type}_action`;
  let actionConfig = config[actionKey] || {};
  if (!actionConfig || typeof actionConfig !== 'object') actionConfig = { action: 'none' };
  if (!actionConfig.action) actionConfig.action = "none";
  if (actionConfig.action === "toggle" && config.entity) {
    const targetEntity = actionConfig.target?.entity_id || config.entity;
    const domain = targetEntity.split(".")[0];
    if (domain === "climate" && hass) {
      const state = hass.states[targetEntity];
      if (state) {
        actionConfig = !isEntityOff(state)
          ? { action: "call-service", service: "climate.set_hvac_mode", data: { hvac_mode: STATE_DEFINITIONS.INACTIVE_STATES.off }, target: { entity_id: targetEntity } }
          : { action: "call-service", service: "climate.turn_on", target: { entity_id: targetEntity } };
      }
    }
  }
const eventDetail = {
    config: {
      entity: actionConfig.target?.entity_id || config.entity,
      [actionKey]: actionConfig
    },
    action: type
  };
  return eventDetail;
};

export { buildHassActionDetail };
