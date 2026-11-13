import { cloneRoomConfig, resolveAutomaticRoom, roomRecord } from "../lib/room-discovery.js";
import { getTranslation } from "../i18n/translations.js";

// Keep the ordinary RoomCard instance alive across automatic membership changes.
// HA recreates all cards when a native section strategy regenerates its output.
export class RoomAutoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = ":host{display:block}p{padding:16px;color:var(--primary-text-color);white-space:pre-wrap}";
    this._content = document.createElement("div");
    this.shadowRoot.append(style, this._content);
  }

  setConfig(config) {
    this._strategy = cloneRoomConfig(roomRecord(config?.strategy));
    this._registryRefs = null;
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  get hass() { return this._hass; }
  getCardSize() { return this._card?.getCardSize() || 1; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  _classSignature() {
    return JSON.stringify((this._roomEntities || []).map(entry =>
      this._hass?.states?.[entry.entity_id]?.attributes?.device_class || entry.device_class || entry.original_device_class || ""));
  }

  _update() {
    if (!this._strategy || !this._hass) return;
    const refs = [this._hass.entities, this._hass.devices, this._hass.areas, this._hass.language];
    const changed = !this._registryRefs || refs.some((value, index) => value !== this._registryRefs[index])
      || this._classSignature() !== this._deviceClasses;
    if (changed) {
      const result = resolveAutomaticRoom(this._strategy, this._hass);
      this._registryRefs = refs;
      this._roomEntities = result.entities;
      this._deviceClasses = this._classSignature();
      this._error = result.error;
      if (result.error) {
        const message = document.createElement("ha-card");
        const text = document.createElement("p");
        text.setAttribute("role", "status");
        text.textContent = getTranslation(this._hass, result.error);
        message.append(text);
        this._content.replaceChildren(message);
      } else {
        const signature = JSON.stringify(result.config);
        this._card ||= document.createElement("oneline-room-card");
        if (signature !== this._cardSignature) {
          this._card.setConfig(result.config);
          this._cardSignature = signature;
          this.dispatchEvent(new Event("card-size-changed", { bubbles: true, composed: true }));
        }
        if (this._card.parentNode !== this._content) this._content.replaceChildren(this._card);
      }
    }
    if (!this._error && this._card) this._card.hass = this._hass;
  }
}
