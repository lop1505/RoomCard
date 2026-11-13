// Selection policy shared by the automatic section, its preview and editor.
// Discovery never saves configuration, calls HA services or filters by state.
export const ROOM_CONTROL_DOMAINS = Object.freeze(["light", "switch", "cover", "fan", "media_player", "lock"]);
export const roomRecord = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
export const cloneRoomConfig = value => JSON.parse(JSON.stringify(value));
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const compareIds = (a, b) => a.entity_id < b.entity_id ? -1 : a.entity_id > b.entity_id ? 1 : 0;

export const getRoomEntities = (hass, area) => {
  if (!area) return [];
  return Object.entries(roomRecord(hass?.entities)).flatMap(([id, raw]) => {
    const entry = roomRecord(raw);
    const entity_id = entry.entity_id || id;
    if (typeof entity_id !== "string" || !entity_id.includes(".")) return [];
    const device = hass?.devices?.[entry.device_id];
    if (entry.disabled_by || entry.hidden || entry.hidden_by || entry.entity_category || device?.disabled_by) return [];
    if ((entry.area_id || device?.area_id) !== area) return [];
    return [{ ...entry, entity_id }];
  }).sort(compareIds);
};

export const createRoomControl = entityId => ({
  entity: entityId,
  width: entityId.startsWith("media_player.") ? 30 : entityId.startsWith("cover.") ? 20 : 15,
  height: 60,
  align: entityId.startsWith("media_player.") ? "left" : "center",
  tap_action: { action: /^(light|switch|cover|fan)\./.test(entityId) ? "toggle" : "more-info" },
  hold_action: { action: "more-info" },
  double_tap_action: { action: "none" },
  show_state: true,
  show_label: true,
  show_icon: true
});

export const getRoomDomains = config => Array.isArray(config?.domains)
  ? ROOM_CONTROL_DOMAINS.filter(domain => config.domains.includes(domain))
  : [...ROOM_CONTROL_DOMAINS];

export const resolveAutomaticRoom = (rawConfig, hass) => {
  const config = roomRecord(rawConfig);
  const areaId = typeof config.area === "string" ? config.area : "";
  if (!areaId) return { error: "room_section_choose_area", entities: [] };
  if (!hass?.areas || !hass?.entities || !hass?.devices) return { error: "room_section_loading", entities: [] };
  const area = own(hass.areas, areaId) ? hass.areas[areaId] : null;
  if (!area) return { error: "room_section_missing_area", entities: [] };
  const entities = getRoomEntities(hass, areaId);
  const excluded = new Set(Array.isArray(config.exclude_entities) ? config.exclude_entities : []);
  const included = entities.filter(entry => !excluded.has(entry.entity_id));
  const domains = getRoomDomains(config);
  const card = cloneRoomConfig(roomRecord(config.card));
  const manual = Array.isArray(card.controls) ? card.controls.filter(control => control && typeof control === "object" && !Array.isArray(control)) : [];
  const manualIds = new Set(manual.map(control => control.entity));
  const controls = ROOM_CONTROL_DOMAINS.flatMap(domain => !domains.includes(domain) ? [] : included
    .filter(entry => entry.entity_id.startsWith(`${domain}.`) && !manualIds.has(entry.entity_id))
    .map(entry => createRoomControl(entry.entity_id)));
  const automatic = {};
  if (config.auto_sensors !== false) {
    const first = predicate => included.find(predicate)?.entity_id;
    const deviceClass = entry => hass.states?.[entry.entity_id]?.attributes?.device_class || entry.device_class || entry.original_device_class;
    const main = first(entry => entry.entity_id.startsWith("climate."));
    if (main) automatic.entity = main;
    for (const [key, wanted] of [["temp_sensor", "temperature"], ["humid_sensor", "humidity"]]) {
      const sensor = first(entry => /^(sensor|input_number)\./.test(entry.entity_id) && deviceClass(entry) === wanted);
      if (sensor) automatic[key] = sensor;
    }
    automatic.window_sensors = included.filter(entry => /^(binary_sensor|sensor)\./.test(entry.entity_id)
      && ["window", "door", "garage_door"].includes(deviceClass(entry))).map(entry => entry.entity_id);
    automatic.battery_sensors = included.filter(entry => /^(sensor|binary_sensor)\./.test(entry.entity_id)
      && deviceClass(entry) === "battery").map(entry => entry.entity_id);
  }
  return {
    error: "",
    entities,
    config: {
      name: area.name || areaId,
      ...(area.icon ? { icon: area.icon } : {}),
      ...automatic,
      ...card,
      type: "custom:oneline-room-card",
      collapse_key: own(card, "collapse_key") ? card.collapse_key : `room-section:${areaId}`,
      controls: [...manual, ...controls]
    }
  };
};
