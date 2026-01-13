// UNIQUE LOGGING GUARD
const VERSION = "1.0.4";
const LOG_FLAG = `customCards_RoomCard_Logged_${VERSION}`;

if (!window[LOG_FLAG]) {
  console.info(
    `%c ROOM-CARD %c ${VERSION} `,
    "color: white; background: #2c3e50; font-weight: 700;",
    "color: white; background: #27ae60; font-weight: 700;"
  );
  window[LOG_FLAG] = true;
}

// TRANSLATIONS
const TRANSLATIONS = {
  en: {
    empty: "Empty",
    low: "Low",
    critical: "Critical",
    window: "Window",
    general: "General",
    sensors_manual: "Sensors (Manual)",
    buttons: "Buttons",
    button: "Button",
    add_button: "Add Button",
    main_climate: "Main Climate Device (Optional)",
    climate_info: "Fills Temp/Humidity automatically if empty below.",
    temp_label: "Temperature (overrides climate)",
    humid_label: "Humidity (overrides climate)",
    window_label: "Windows (List)",
    battery_label: "Batteries (List)",
    name: "Name",
    icon: "Icon",
    color: "Color",
    img_url: "Image URL",
    path: "Path (Tap Action)",
    entity: "Entity",
    type: "Type",
    height: "Height",
    width: "Width",
    light: "Light",
    shutter: "Shutter",
    climate: "Climate",
    full: "Full (1 per row)",
    two_thirds: "2 Thirds",
    half: "Half",
    third: "1 Third",
    quarter: "1 Quarter",
    fifth: "1 Fifth",
    sixth: "1 Sixth"
  },
  de: {
    empty: "Leer",
    low: "Niedrig",
    critical: "Kritisch",
    window: "Fenster",
    general: "Allgemein",
    sensors_manual: "Sensoren (Manuell)",
    buttons: "Buttons",
    button: "Button",
    add_button: "Button hinzufügen",
    main_climate: "Haupt-Klima-Gerät (Optional)",
    climate_info: "Füllt Temp/Feuchtigkeit automatisch, wenn unten leer.",
    temp_label: "Temperatur (überschreibt Klima)",
    humid_label: "Luftfeuchtigkeit (überschreibt Klima)",
    window_label: "Fenster (Liste)",
    battery_label: "Batterien (Liste)",
    name: "Name",
    icon: "Icon",
    color: "Farbe",
    img_url: "Bild URL",
    path: "Pfad (Tap Action)",
    entity: "Entität",
    type: "Typ",
    height: "Höhe",
    width: "Breite",
    light: "Licht",
    shutter: "Rollo",
    climate: "Heizung",
    full: "Voll (1 pro Zeile)",
    two_thirds: "2 Drittel",
    half: "Halb",
    third: "1 Drittel",
    quarter: "1 Viertel",
    fifth: "1 Fünftel",
    sixth: "1 Sechstel"
  },
  fr: {
    empty: "Vide",
    low: "Faible",
    critical: "Critique",
    window: "Fenêtre",
    general: "Général",
    sensors_manual: "Capteurs (Manuel)",
    buttons: "Boutons",
    button: "Bouton",
    add_button: "Ajouter un bouton",
    main_climate: "Appareil climatique principal (Optionnel)",
    climate_info: "Remplit automatiquement Temp/Humidité si vide ci-dessous.",
    temp_label: "Température (remplace climat)",
    humid_label: "Humidité (remplace climat)",
    window_label: "Fenêtres (Liste)",
    battery_label: "Batteries (Liste)",
    name: "Nom",
    icon: "Icône",
    color: "Couleur",
    img_url: "URL de l'image",
    path: "Chemin (Tap Action)",
    entity: "Entité",
    type: "Type",
    height: "Hauteur",
    width: "Largeur",
    light: "Lumière",
    shutter: "Volet",
    climate: "Climat",
    full: "Plein (1 par ligne)",
    two_thirds: "2 tiers",
    half: "Moitié",
    third: "1 tiers",
    quarter: "1 quart",
    fifth: "1 cinquième",
    sixth: "1 sixième"
  }
};

// HELPER: TRANSLATION (HARDENED)
const getTranslation = (hass, key) => {
  const lang = hass?.language?.split("-")[0] || "en";
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS["en"]?.[key] ?? key;
};

// HELPER: UTILS
const toList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return v.split(",").map((s) => s.trim()).filter((x) => x);
};

const clampNum = (v, min, max, fallback) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(n, max));
};

// =============================================================================
// CARD
// =============================================================================
class RoomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) this.render();
    this.updateContent();
  }

  setConfig(config) {
    this.config = config;
    if (!this.content) this.render();
    this.updateContent();
  }

  getCardSize() {
    const numButtons = (this.config.controls || []).length;
    return 3 + Math.ceil(numButtons / 2.5);
  }

  static getStubConfig(hass) {
    const entities = Object.keys(hass.states);
    const light = entities.find((e) => e.startsWith("light.")) || "";
    const climate = entities.find((e) => e.startsWith("climate.")) || "";
    return {
      name: "Living Room",
      icon: "mdi:sofa",
      entity: climate,
      color: "orange",
      controls: [
        { entity: light, name: "Light", type: "light", icon: "mdi:lightbulb", width: 20, height: 60 },
      ],
    };
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ha-card { position: relative; overflow: hidden; border-radius: 16px; background: none; border: none; cursor: default; transition: all 0.2s; }
        .container { display: flex; flex-direction: column; background: var(--ha-card-background, rgba(255, 255, 255, 0.1)); border-radius: 16px; }
        .img-box { position: relative; width: 100%; height: 120px; overflow: hidden; border-radius: 16px 16px 0 0; background: #444; cursor: pointer; }
        .img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 12px; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); display: flex; align-items: center; gap: 12px; }
        .text { display: flex; flex-direction: column; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
        .primary { font-weight: bold; font-size: 14px; }
        .secondary { font-size: 12px; opacity: 0.9; }
        .chips { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 2; }
        .chip { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; background: #FFF8E1; color: #FFA000; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .chip.alert { background: #FFEBEE; color: #D32F2F; }
        .controls { --room-card-gap: 6px; display: flex; flex-wrap: wrap; gap: var(--room-card-gap); padding: 10px; }
        .btn { display: flex; align-items: center; justify-content: flex-start; gap: 10px; padding: 0 10px; border-radius: 12px; cursor: pointer; background: var(--card-background-color, rgba(128, 128, 128, 0.05)); border: 1px solid transparent; transition: background 0.2s, border-color 0.2s; flex-grow: 1; flex-shrink: 1; min-width: 105px; overflow: hidden; box-sizing: border-box; }
        .btn:hover { background: rgba(128, 128, 128, 0.1); border-color: rgba(128, 128, 128, 0.2); }
        .icon-box { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; }
        .btn-txt { display: flex; flex-direction: column; text-align: left; overflow: hidden; min-width: 0; flex: 1; }
        .btn-name { font-size: 13px; font-weight: 600; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .btn-state { font-size: 11px; color: var(--secondary-text-color); margin-top: 1px; }
      </style>
      <ha-card>
        <div class="container">
          <div class="img-box"><img id="bg" class="img" src=""><div class="overlay"><ha-icon id="icon"></ha-icon><div class="text"><span id="name" class="primary"></span><span id="info" class="secondary"></span></div></div><div id="chips" class="chips"></div></div>
          <div id="ctrls" class="controls"></div>
        </div>
      </ha-card>
    `;
    this.content = this.shadowRoot.querySelector(".container");
    this.controls = this.shadowRoot.getElementById("ctrls");
    this.shadowRoot.querySelector(".img-box").addEventListener("click", () => this._navigate());
  }

  updateContent() {
    if (!this.config || !this._hass || !this.content) return;
    const h = this._hass;
    const c = this.config;

    this.shadowRoot.getElementById("bg").src = c.image || "/static/images/card_media/cover.png";
    this.shadowRoot.getElementById("name").innerText = c.name || "Room";
    const icon = this.shadowRoot.getElementById("icon");
    icon.icon = c.icon || "mdi:home";
    icon.style.color = c.color || "white";

    let tempVal = null; let humVal = null;
    if (c.temp_sensor && h.states[c.temp_sensor]) { tempVal = h.states[c.temp_sensor].state; }
    else if (c.entity && h.states[c.entity]) {
        const climateState = h.states[c.entity];
        if (climateState.attributes.current_temperature !== undefined) tempVal = climateState.attributes.current_temperature;
    }
    if (c.humid_sensor && h.states[c.humid_sensor]) { humVal = h.states[c.humid_sensor].state; }
    else if (c.entity && h.states[c.entity]) {
        const climateState = h.states[c.entity];
        if (climateState.attributes.current_humidity !== undefined) humVal = climateState.attributes.current_humidity;
    }
    const tDisplay = tempVal !== null && tempVal !== "-" ? `${tempVal}°C` : "–";
    const hDisplay = humVal !== null && humVal !== "-" ? `${humVal}%` : "–";
    this.shadowRoot.getElementById("info").innerText = `${tDisplay} | ${hDisplay}`;

    const chips = this.shadowRoot.getElementById("chips");
    chips.innerHTML = "";
    let alertLabel = null;
    toList(c.battery_sensors).forEach((s) => {
      const st = h.states[s]; if (!st) return;
      if (st.state === "on") alertLabel = getTranslation(h, "empty");
      const pct = parseFloat(st.state);
      if (!isNaN(pct)) {
        if (pct <= 5) alertLabel = getTranslation(h, "critical");
        else if (pct <= 15 && !alertLabel) alertLabel = getTranslation(h, "low");
      }
    });
    if (alertLabel) chips.innerHTML += `<div class="chip alert"><ha-icon icon="mdi:battery-alert" style="--mdc-icon-size:14px"></ha-icon> ${alertLabel}</div>`;
    toList(c.window_sensors).forEach((s) => {
      const st = h.states[s];
      if (st?.state === "on") chips.innerHTML += `<div class="chip"><ha-icon icon="mdi:window-open-variant" style="--mdc-icon-size:14px"></ha-icon> ${st.attributes.friendly_name || getTranslation(h, "window")}</div>`;
    });

    this.controls.innerHTML = "";
    (c.controls || []).forEach((ctrl) => {
      if (!ctrl.entity) return;
      const st = h.states[ctrl.entity];
      const state = st ? st.state : "N/A";
      let type = ctrl.type || "light";
      if (!ctrl.type) {
        if (ctrl.entity.startsWith("cover.")) type = "shutter";
        else if (ctrl.entity.startsWith("climate.")) type = "climate";
      }
      let col = "grey", bg = "rgba(128,128,128,0.1)";
      if (st && (["on", "open"].includes(state) || (type === "shutter" && state !== "closed"))) {
        if (type === "light") { col = "orange"; bg = "rgba(255,165,0,0.2)"; }
        if (type === "shutter") { col = "#2196F3"; bg = "rgba(33,150,243,0.2)"; }
        if (type === "climate") { col = "#FF5722"; bg = "rgba(255,87,34,0.2)"; }
      }
      let stateTxt = state;
      if (type === "climate" && st?.attributes?.current_temperature !== undefined) stateTxt = `${st.attributes.current_temperature}°C`;

      const btn = document.createElement("div");
      btn.className = "btn";
      const percentage = (clampNum(ctrl.width, 1, 60, 15) / 60) * 100;
      btn.style.flexBasis = `calc(${percentage}% - var(--room-card-gap, 6px))`;
      btn.style.height = `${clampNum(ctrl.height, 40, 250, 60)}px`;
      btn.innerHTML = `<div class="icon-box" style="background:${bg}"><ha-icon icon="${ctrl.icon || "mdi:circle"}" style="color:${col}; --mdc-icon-size:20px"></ha-icon></div><div class="btn-txt"><span class="btn-name">${ctrl.name || "Device"}</span><span class="btn-state">${stateTxt}</span></div>`;
      btn.onclick = (e) => {
        e.stopPropagation();
        if (type === "climate") this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: ctrl.entity }, bubbles: true, composed: true }));
        else h.callService("homeassistant", "toggle", { entity_id: ctrl.entity });
      };
      this.controls.appendChild(btn);
    });
  }

  _navigate() {
    if (this.config.tap_action?.action === "navigate" && this.config.tap_action?.navigation_path) {
      history.pushState(null, "", this.config.tap_action.navigation_path);
      window.dispatchEvent(new Event("location-changed", { bubbles: true, composed: true }));
    }
  }

  static getConfigElement() { return document.createElement("room-card-editor"); }
}
customElements.define("room-card", RoomCard);

// =============================================================================
// EDITOR
// =============================================================================
class RoomCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._timer = null;
  }

  // *** IMPROVED SETCONFIG ***
  setConfig(config) {
    this._config = config || {};
    // Schützt vor Abstürzen, wenn controls kein Array ist
    if (!Array.isArray(this._config.controls)) {
      this._config = { ...this._config, controls: [] };
    }
    this.render();
    if (this._hass) this.updateHass();
  }

  // OPTIMIZED SET HASS: Only render if language changed
  set hass(hass) {
      const oldLang = this._hass?.language;
      const newLang = hass?.language;
      this._hass = hass;

      if (oldLang !== newLang) {
          this.render();
      }
      this.updateHass();
  }

  updateHass() {
    if (!this.shadowRoot || !this._hass) return;
    this.shadowRoot.querySelectorAll("ha-selector, ha-entity-picker, ha-icon-picker, ha-select").forEach((el) => {
      if (el.hass !== this._hass) el.hass = this._hass;
    });
  }

  _fireDebounced(config) {
    this._config = config;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => { this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true })); }, 300);
  }

  render() {
    if (this.shadowRoot.innerHTML !== "") { this.updateValues(); this.renderButtons(); return; }
    const h = this._hass;

    this.shadowRoot.innerHTML = `
      <style>
        .section { padding: 12px 0; border-bottom: 1px solid var(--divider-color); }
        .stack { display: flex; flex-direction: column; gap: 12px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        h3 { margin: 0 0 12px 0; color: var(--primary-text-color); font-weight: 500; }
        .control-box { border: 1px solid var(--divider-color); padding: 12px; border-radius: 10px; background: var(--secondary-background-color); display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; position: relative; }
        .box-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .icon-btn { cursor: pointer; color: var(--secondary-text-color); transition: color 0.2s; }
        .delete-btn { color: #D32F2F !important; }
        ha-textfield, ha-selector, ha-entity-picker, ha-icon-picker, ha-select { width: 100%; display: block; }
        mwc-button { width: 100%; margin-top: 8px; }
        .info-text { font-size: 12px; color: var(--secondary-text-color); margin-top: -8px; margin-bottom: 8px; }
      </style>
      <div class="section">
        <h3>${getTranslation(h, "general")}</h3>
        <div class="stack">
          <ha-textfield label="${getTranslation(h, "name")}" config="name" class="base"></ha-textfield>
          <ha-entity-picker label="${getTranslation(h, "main_climate")}" config="entity" class="base"></ha-entity-picker>
          <div class="info-text">${getTranslation(h, "climate_info")}</div>
          <div class="row">
            <ha-icon-picker label="${getTranslation(h, "icon")}" config="icon" class="base"></ha-icon-picker>
            <ha-textfield label="${getTranslation(h, "color")}" config="color" class="base"></ha-textfield>
          </div>
          <ha-textfield label="${getTranslation(h, "img_url")}" config="image" class="base"></ha-textfield>
          <ha-textfield label="${getTranslation(h, "path")}" config="nav_path" class="base"></ha-textfield>
        </div>
      </div>
      <div class="section">
        <h3>${getTranslation(h, "sensors_manual")}</h3>
        <div class="stack">
          <ha-entity-picker label="${getTranslation(h, "temp_label")}" config="temp_sensor" class="base" allow-custom-entity></ha-entity-picker>
          <ha-entity-picker label="${getTranslation(h, "humid_label")}" config="humid_sensor" class="base" allow-custom-entity></ha-entity-picker>
          <ha-selector config="window_sensors" class="base" label="${getTranslation(h, "window_label")}"></ha-selector>
          <ha-selector config="battery_sensors" class="base" label="${getTranslation(h, "battery_label")}"></ha-selector>
        </div>
      </div>
      <div class="section">
        <h3>${getTranslation(h, "buttons")}</h3>
        <div id="buttons"></div>
        <mwc-button id="add" raised label="${getTranslation(h, "add_button")}"><ha-icon icon="mdi:plus" slot="icon"></ha-icon></mwc-button>
      </div>
    `;

    this.shadowRoot.querySelectorAll(".base").forEach((el) => {
      const key = el.getAttribute("config");
      if (key === "window_sensors") el.selector = { entity: { domain: "binary_sensor", multiple: true } };
      if (key === "battery_sensors") el.selector = { entity: { multiple: true } };
      if (key === "entity") el.includeDomains = ["climate"];
      const ev = el.tagName === "HA-TEXTFIELD" ? "input" : "value-changed";
      el.addEventListener(ev, (e) => { e.stopPropagation(); this._changed(e); });
    });

    this.shadowRoot.getElementById("add").addEventListener("click", () => {
      const c = [...(this._config.controls || [])];
      let newE = this._config.entity || "";
      c.push({ entity: newE, name: "", type: newE ? "climate" : "light", width: 15, height: 60 });
      this._fireDebounced({ ...this._config, controls: c });
      this.renderButtons();
    });
    this.updateValues();
    this.renderButtons();
  }

  renderButtons() {
    const div = this.shadowRoot.getElementById("buttons"); if (!div) return;
    const h = this._hass;

    div.replaceChildren();

    const controls = this._config.controls || [];
    controls.forEach((ctrl, i) => {
      const box = document.createElement("div");
      box.className = "control-box";
      box.innerHTML = `
        <div class="box-header"><strong>${getTranslation(h, "button")} ${i + 1}</strong>
          <div>${i > 0 ? '<ha-icon class="icon-btn move-up" icon="mdi:arrow-up"></ha-icon>' : ''}${i < controls.length - 1 ? '<ha-icon class="icon-btn move-down" icon="mdi:arrow-down"></ha-icon>' : ''}
          <ha-icon class="icon-btn delete-btn" icon="mdi:delete"></ha-icon></div>
        </div>
        <ha-entity-picker class="ep" label="${getTranslation(h, "entity")}"></ha-entity-picker>
        <div class="row"><ha-textfield class="nm" label="${getTranslation(h, "name")}"></ha-textfield><ha-icon-picker class="ic" label="${getTranslation(h, "icon")}"></ha-icon-picker></div>
        <div class="row">
          <ha-select class="ty" label="${getTranslation(h, "type")}">
            <mwc-list-item value="light">${getTranslation(h, "light")}</mwc-list-item><mwc-list-item value="shutter">${getTranslation(h, "shutter")}</mwc-list-item><mwc-list-item value="climate">${getTranslation(h, "climate")}</mwc-list-item>
          </ha-select>
          <ha-selector class="ht" label="${getTranslation(h, "height")} (px)"></ha-selector>
        </div>
        <ha-select class="wd" label="${getTranslation(h, "width")}">
          <mwc-list-item value="60">${getTranslation(h, "full")}</mwc-list-item><mwc-list-item value="40">${getTranslation(h, "two_thirds")}</mwc-list-item><mwc-list-item value="30">${getTranslation(h, "half")}</mwc-list-item>
          <mwc-list-item value="20">${getTranslation(h, "third")}</mwc-list-item><mwc-list-item value="15">${getTranslation(h, "quarter")}</mwc-list-item><mwc-list-item value="12">${getTranslation(h, "fifth")}</mwc-list-item><mwc-list-item value="10">${getTranslation(h, "sixth")}</mwc-list-item>
        </ha-select>
      `;

      box.querySelector(".move-up")?.addEventListener("click", () => this._move(i, -1));
      box.querySelector(".move-down")?.addEventListener("click", () => this._move(i, 1));
      box.querySelector(".delete-btn").addEventListener("click", () => { const c = [...this._config.controls]; c.splice(i, 1); this._fireDebounced({ ...this._config, controls: c }); this.renderButtons(); });

      const ep = box.querySelector(".ep");
      ep.hass = h;
      ep.value = ctrl.entity;
      ep.addEventListener("value-changed", (e) => this._upd(i, { entity: e.detail.value }));

      const nm = box.querySelector(".nm");
      nm.value = ctrl.name || "";
      nm.addEventListener("input", (e) => this._upd(i, { name: e.target.value }));

      const ic = box.querySelector(".ic");
      ic.value = ctrl.icon || "";
      ic.addEventListener("value-changed", (e) => this._upd(i, { icon: e.detail.value }));

      const ty = box.querySelector(".ty");
      ty.value = ctrl.type || "light";
      ty.addEventListener("value-changed", (e) => this._upd(i, { type: e.detail.value }));

      const wd = box.querySelector(".wd");
      wd.value = String(ctrl.width || 15);
      wd.addEventListener("value-changed", (e) => this._upd(i, { width: parseInt(e.detail.value) }));

      const ht = box.querySelector(".ht");
      ht.hass = h;
      ht.selector = { number: { min: 40, max: 250, mode: "box", unit_of_measurement: "px" } };
      ht.value = ctrl.height || 60;
      ht.addEventListener("value-changed", (e) => this._upd(i, { height: Number(e.detail.value) || 60 }));

      div.appendChild(box);
    });
  }

  _move(i, s) { const c = [...this._config.controls]; [c[i], c[i+s]] = [c[i+s], c[i]]; this._fireDebounced({ ...this._config, controls: c }); this.renderButtons(); }
  _upd(i, ch) { const c = [...this._config.controls]; c[i] = { ...c[i], ...ch }; this._fireDebounced({ ...this._config, controls: c }); }

  // *** FIXED METHOD ***
  updateValues() {
    if (!this._config) return;
    this.shadowRoot.querySelectorAll(".base").forEach((el) => {
      const key = el.getAttribute("config");
      let val = "";
      if (key === "nav_path") val = this._config.tap_action?.navigation_path || "";
      else val = this._config[key] || "";
      if (el.value !== val) el.value = val;
    });
  }

  // *** IMPROVED _CHANGED (GUARD) ***
  _changed(e) {
    if (!this._config) return; // Guard clause against undefined config

    const key = e.target.getAttribute("config");
    const val = e.detail?.value !== undefined ? e.detail.value : e.target.value;
    const c = { ...this._config };
    if (key === "nav_path") {
      if (val && val.trim() !== "") c.tap_action = { action: "navigate", navigation_path: val };
      else delete c.tap_action;
    } else {
      c[key] = val;
    }
    this._fireDebounced(c);
  }
}
customElements.define("room-card-editor", RoomCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({ type: "room-card", name: "OneLine Room Card", preview: true, description: "Minimalist Room Card" });