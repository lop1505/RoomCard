import { cloneRoomConfig, createRoomControl, getRoomDomains, resolveAutomaticRoom, ROOM_CONTROL_DOMAINS, roomRecord } from "../lib/room-discovery.js";
import { getEntityDisplayName } from "../lib/formatting.js";
import { getTranslation } from "../i18n/translations.js";
const asList = value => Array.isArray(value) ? value : [];

export class RoomSectionEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._livePreview = true;
    this._save = event => this._handleSave(event);
    this._liveToggleChanged = () => {
      this._livePreview = this._cardEditor._livePreview !== false;
      if (this._livePreview && this._pending) this._emit();
    };
  }

  connectedCallback() { document.addEventListener("click", this._save, true); }
  disconnectedCallback() { document.removeEventListener("click", this._save, true); }

  setConfig(config) {
    this._config = { ...cloneRoomConfig(roomRecord(config)), type: "custom:oneline-room" };
    this._render();
    this._sync();
  }

  set hass(hass) {
    const languageChanged = this._hass?.language !== hass?.language;
    const registriesChanged = ["entities", "devices", "areas"].some(key => this._hass?.[key] !== hass?.[key]);
    this._hass = hass;
    if (languageChanged && this._config) {
      if (this._cardEditor?._pendingConfig) this._pending = true;
      this._config.card = this._collectCard();
      this._render(true);
    }
    if (this._cardEditor) {
      this._cardEditor.hass = hass;
      this._connectLiveToggle();
    }
    if ((registriesChanged || languageChanged) && this._config) this._sync();
  }

  get hass() { return this._hass; }
  _t(key) { return getTranslation(this._hass, key); }

  _collectCard() {
    const card = cloneRoomConfig(roomRecord(this._cardEditor?._config || this._config?.card));
    delete card.type;
    return card;
  }

  _change(patch) {
    // Fold the nested editor's deferred values into the same strategy Save.
    this._cardEditor?._flushPendingConfig();
    this._config = { ...this._config, card: this._collectCard(), ...patch, type: "custom:oneline-room" };
    this._sync();
    if (this._livePreview) this._emit();
    else this._pending = true;
  }

  _emit() {
    this._pending = false;
    const config = cloneRoomConfig(this._config);
    const signature = JSON.stringify(config);
    if (signature === this._lastEmitted) return;
    this._lastEmitted = signature;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  _handleSave(event) {
    const path = event.composedPath();
    let scope = this;
    while (scope && !scope.localName?.startsWith("hui-dialog-edit-")) {
      scope = scope.parentNode || scope.host;
    }
    if (scope && !path.includes(scope)) return;
    if (!path.some(node => node?.getAttribute?.("slot") === "primaryAction" && !node.disabled)) return;
    this._cardEditor?._flushPendingConfig();
    if (this._pending) this._emit();
  }

  _connectLiveToggle() {
    const toggle = this._cardEditor?.shadowRoot?.getElementById("live-preview-toggle");
    if (toggle === this._liveToggle) return;
    this._liveToggle?.removeEventListener("change", this._liveToggleChanged);
    this._liveToggle = toggle;
    toggle?.addEventListener("change", this._liveToggleChanged);
  }

  _render(force = false) {
    if (!this._config || (this._cardEditor && !force)) return;
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block;color:var(--primary-text-color);font:inherit}
      *{box-sizing:border-box}h3{margin:16px 0 8px;font-size:16px}p{line-height:1.5}
      select{display:block;width:100%;min-height:44px;margin:8px 0 16px;padding:8px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);color:inherit;font:inherit}
      fieldset{border:1px solid var(--divider-color);border-radius:8px;padding:12px;margin:12px 0}legend{padding:0 4px}
      .domains{display:flex;flex-wrap:wrap;gap:12px}label{display:flex;align-items:center;gap:8px;min-height:36px}
      input{accent-color:var(--primary-color)}button{min-height:36px;padding:6px 10px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);color:inherit;font:inherit;cursor:pointer}
      button:disabled{opacity:.6;cursor:default}button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .entity{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 0;border-bottom:1px solid var(--divider-color)}
      .entity-name{flex:1;min-width:140px;overflow-wrap:anywhere}.entity-id{display:block;font-size:12px;color:var(--secondary-text-color)}
      .hint{color:var(--secondary-text-color);font-size:13px}.message{padding:12px;border:1px solid var(--divider-color);border-radius:6px}
    `;
    const help = document.createElement("p");
    help.textContent = this._t("room_section_help");
    const label = document.createElement("label");
    label.htmlFor = "room-area";
    label.textContent = this._t("area_picker");
    const area = document.createElement("select");
    area.id = "room-area";
    area.addEventListener("change", () => this._change({ area: area.value }));
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = this._t("room_section_domains");
    const domains = document.createElement("div");
    domains.className = "domains";
    for (const domain of ROOM_CONTROL_DOMAINS) {
      const row = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.domain = domain;
      input.addEventListener("change", () => {
        const selected = this.shadowRoot.querySelectorAll("[data-domain]");
        this._change({ domains: Array.from(selected).filter(node => node.checked).map(node => node.dataset.domain) });
      });
      row.append(input, this._t(`room_section_domain_${domain}`));
      domains.append(row);
    }
    fieldset.append(legend, domains);
    const sensorsLabel = document.createElement("label");
    const sensors = document.createElement("input");
    sensors.type = "checkbox";
    sensors.id = "auto-sensors";
    sensors.addEventListener("change", () => this._change({ auto_sensors: sensors.checked }));
    sensorsLabel.append(sensors, this._t("room_section_auto_sensors"));
    const listTitle = document.createElement("h3");
    listTitle.textContent = this._t("room_section_discovered");
    const list = document.createElement("div");
    list.id = "discovered";
    const exclusions = document.createElement("div");
    exclusions.id = "exclusions";
    const details = document.createElement("details");
    details.id = "card-settings";
    const summary = document.createElement("summary");
    summary.textContent = this._t("room_section_card_settings");
    const cardHelp = document.createElement("p");
    cardHelp.className = "hint";
    cardHelp.textContent = this._t("room_section_card_help");
    const editor = document.createElement("oneline-room-card-editor");
    editor.hass = this._hass;
    editor._livePreview = this._livePreview;
    editor.addEventListener("config-changed", event => {
      event.stopPropagation();
      const card = cloneRoomConfig(event.detail.config);
      delete card.type;
      this._change({ card });
    });
    details.append(summary, cardHelp, editor);
    const open = this.shadowRoot.getElementById("card-settings")?.open;
    this.shadowRoot.replaceChildren(style, help, label, area, fieldset, sensorsLabel, listTitle, list, exclusions, details);
    details.open = open || false;
    this._cardEditor = editor;
  }

  _sync() {
    if (!this._cardEditor) return;
    const focused = this.shadowRoot.activeElement;
    const focusEntity = focused?.dataset.entity;
    const focusAction = focused?.dataset.action;
    const area = this.shadowRoot.getElementById("room-area");
    const options = [["", this._t("room_section_choose_area")], ...Object.entries(this._hass?.areas || {})
      .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([id, entry]) => [id, entry.name || id])];
    if (this._config.area && !options.some(([id]) => id === this._config.area)) options.push([this._config.area, this._config.area]);
    area.replaceChildren(...options.map(([id, name]) => {
      const option = document.createElement("option"); option.value = id; option.textContent = name; return option;
    }));
    area.value = this._config.area || "";
    const domains = getRoomDomains(this._config);
    this.shadowRoot.querySelectorAll("[data-domain]").forEach(node => { node.checked = domains.includes(node.dataset.domain); });
    this.shadowRoot.getElementById("auto-sensors").checked = this._config.auto_sensors !== false;
    this._cardEditor.setConfig({ ...cloneRoomConfig(roomRecord(this._config.card)), type: "custom:oneline-room-card" });
    this._connectLiveToggle();
    const result = resolveAutomaticRoom(this._config, this._hass);
    const list = this.shadowRoot.getElementById("discovered");
    list.replaceChildren();
    const excluded = new Set(Array.isArray(this._config.exclude_entities) ? this._config.exclude_entities : []);
    const manual = new Set(asList(this._config.card?.controls).map(control => control?.entity));
    const header = new Set([result.config?.entity, result.config?.temp_sensor, result.config?.humid_sensor,
      ...asList(result.config?.window_sensors), ...asList(result.config?.battery_sensors)]);
    const entries = result.entities.filter(entry => !excluded.has(entry.entity_id)
      && (domains.includes(entry.entity_id.split(".")[0]) || header.has(entry.entity_id)));
    if (result.error || !entries.length) {
      const message = document.createElement("p");
      message.className = "message";
      message.setAttribute("role", "status");
      message.textContent = this._t(result.error || "area_no_entities");
      list.append(message);
    }
    for (const entry of entries) {
      const id = entry.entity_id;
      const row = this._entityRow(id);
      if (domains.includes(id.split(".")[0])) {
        const customize = this._button(manual.has(id) ? "room_section_customized" : "room_section_customize", id, "customize", () => {
          const card = this._collectCard();
          card.controls = [...(Array.isArray(card.controls) ? card.controls : []), createRoomControl(id)];
          this._change({ card });
          this.shadowRoot.getElementById("card-settings").open = true;
          this._cardEditor._activeTab = "buttons";
          this._cardEditor._updateTabUI();
          this.shadowRoot.getElementById("card-settings").querySelector("summary").focus();
        });
        customize.disabled = manual.has(id);
        row.append(customize);
      }
      const exclude = this._button("room_section_exclude", id, "exclude", () => this._change({ exclude_entities: [...excluded, id] }));
      exclude.disabled = manual.has(id) || ["entity", "temp_sensor", "humid_sensor"].some(key => this._config.card?.[key] === id)
        || ["window_sensors", "battery_sensors"].some(key => this._config.card?.[key]?.includes?.(id));
      row.append(exclude);
      list.append(row);
    }
    const exclusions = this.shadowRoot.getElementById("exclusions");
    exclusions.replaceChildren();
    for (const id of excluded) {
      if (typeof id !== "string") continue;
      const row = this._entityRow(id);
      row.append(this._button("room_section_restore", id, "restore", () => this._change({ exclude_entities: [...excluded].filter(item => item !== id) })));
      exclusions.append(row);
    }
    if (focusEntity) {
      const buttons = Array.from(this.shadowRoot.querySelectorAll("button"));
      const same = buttons.find(node => node.dataset.entity === focusEntity && node.dataset.action === focusAction && !node.disabled);
      const replacement = buttons.find(node => node.dataset.entity === focusEntity && !node.disabled);
      (same || replacement)?.focus();
    }
  }

  _entityRow(id) {
    const row = document.createElement("div"); row.className = "entity";
    const label = document.createElement("span"); label.className = "entity-name";
    label.textContent = getEntityDisplayName(this._hass, id);
    const identifier = document.createElement("span"); identifier.className = "entity-id"; identifier.textContent = id;
    label.append(identifier); row.append(label); return row;
  }

  _button(key, id, action, callback) {
    const button = document.createElement("button"); button.type = "button";
    button.textContent = this._t(key); button.dataset.entity = id; button.dataset.action = action;
    button.setAttribute("aria-label", `${this._t(key)}: ${getEntityDisplayName(this._hass, id)}`);
    button.addEventListener("click", callback); return button;
  }
}
