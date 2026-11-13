export const roomFixture = () => {
  const states = {};
  const entities = {};
  const add = (id, metadata = {}, attributes = {}, value = "off") => {
    entities[id] = { entity_id: id, device_id: "living_device", labels: [], ...metadata };
    states[id] = { entity_id: id, state: value, attributes: { friendly_name: id, ...attributes } };
  };
  for (const id of ["light.z", "light.a", "switch.plug", "cover.blind", "fan.ceiling", "media_player.radio", "lock.front", "climate.heating"]) add(id);
  add("light.other_room", { area_id: "bedroom" });
  add("light.direct_area", { device_id: "bedroom_device", area_id: "living" });
  add("light.hidden", { hidden: true });
  add("light.disabled", { disabled_by: "user" });
  add("light.diagnostic", { entity_category: "diagnostic" });
  add("light.disabled_device", { device_id: "disabled_device" });
  add("light.offline", {}, {}, "unavailable");
  add("sensor.temp", {}, { device_class: "temperature" }, "21");
  add("sensor.humidity", {}, { device_class: "humidity" }, "45");
  add("binary_sensor.window", {}, { device_class: "window" });
  add("sensor.battery", {}, { device_class: "battery", unit_of_measurement: "%" }, "95");
  return {
    language: "en", locale: { language: "en-US" }, states, entities,
    areas: { living: { area_id: "living", name: "Living room", icon: "mdi:sofa" }, bedroom: { area_id: "bedroom", name: "Bedroom" } },
    devices: { living_device: { id: "living_device", area_id: "living" }, bedroom_device: { id: "bedroom_device", area_id: "bedroom" }, disabled_device: { area_id: "living", disabled_by: "user" } }
  };
};
