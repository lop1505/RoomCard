import { cloneRoomConfig, getRoomEntities, ROOM_CONTROL_DOMAINS } from "../lib/room-discovery.js";

export class RoomSectionStrategy extends HTMLElement {
  // The stable adapter card updates its existing RoomCard from registry changes.
  // Regenerating the native section would destroy that card and any open drawer.
  static registryDependencies = [];

  static getStubConfig(hass) {
    const areas = Object.keys(hass?.areas || {}).sort();
    let area = areas[0];
    let mostControls = 0;
    for (const id of areas) {
      const count = getRoomEntities(hass, id).filter(entry =>
        ROOM_CONTROL_DOMAINS.some(domain => entry.entity_id.startsWith(`${domain}.`))).length;
      if (count > mostControls) { area = id; mostControls = count; }
    }
    return { type: "custom:oneline-room", ...(area ? { area } : {}), domains: [...ROOM_CONTROL_DOMAINS] };
  }

  static getConfigElement() {
    return document.createElement("oneline-room-section-editor");
  }

  static async generate(config) {
    return {
      type: "grid",
      cards: [{ type: "custom:oneline-room-auto-card", strategy: cloneRoomConfig(config), grid_options: { columns: "full", rows: "auto" } }]
    };
  }
}
