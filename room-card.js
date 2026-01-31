// SAFE VERSION 1.0.7 - Resolved Naming Conflict and added dynamic unit support (Fahrenheit/Celsius)

const VERSION = "1.0.9";
const LOG_FLAG = `customCards_RoomCard_Logged_${VERSION}`;

if (!window[LOG_FLAG]) {
  console.info(
    `%c ONELINE-ROOM-CARD %c ${VERSION} `,
    "color: white; background: #2c3e50; font-weight: 700;",
    "color: white; background: #c0392b; font-weight: 700;"
  );
  window[LOG_FLAG] = true;
}

// TRANSLATIONS
const TRANSLATIONS = {
  en: {
    empty: "Empty", low: "Low", critical: "Critical", window: "Window", general: "General",
    sensors_manual: "Sensors (Manual)", buttons: "Buttons", button: "Button", add_button: "Add Button",
    main_climate: "Main Climate Device (Optional)", climate_info: "Fills Temp/Humidity automatically if empty below.",
    temp_label: "Temperature (overrides climate)", target_temp_label: "Target Temperature", humid_label: "Humidity (overrides climate)",
    window_label: "Windows (List)", battery_label: "Batteries (List)", name: "Name", icon: "Icon", color: "Icon Color",
    force_color: "Force Manual Color (Always visible)", img_url: "Image URL", path: "Path (Tap Action)", entity: "Entity", device: "Device (Optional)",
    template: "Type Filter", add_template: "with Filter", add_prefix: "Add",
    tmpl_light: "Light", tmpl_switch: "Switch / Socket", tmpl_climate: "Climate", tmpl_cover: "Cover / Shutter", tmpl_media: "Media Player",
    show_state: "Show State",
    height: "Height", width: "Width", align: "Align", visible: "Visible", left: "Left", center: "Center", right: "Right",
    tap_action: "Tap Action", hold_action: "Hold Action", double_tap_action: "Double Tap Action",
    act_more: "Details (Default)", act_toggle: "Toggle", act_none: "None",
    upload_btn: "Upload Image", uploading: "Uploading...", upload_success: "Done!",
    migration_title: "Action Required", 
    migration_text: "Card renamed to <b>oneline-room-card</b> to avoid conflicts.<br>Please change <code>type: custom:room-card</code> to <code>type: custom:oneline-room-card</code> in your YAML."
  },
  de: {
    empty: "Leer", low: "Niedrig", critical: "Kritisch", window: "Fenster", general: "Allgemein",
    sensors_manual: "Sensoren (Manuell)", buttons: "Buttons", button: "Button", add_button: "Button hinzufügen",
    main_climate: "Haupt-Klima-Gerät (Optional)", climate_info: "Füllt Temp/Feuchtigkeit automatisch, wenn unten leer.",
    temp_label: "Temperatur (überschreibt Klima)", target_temp_label: "Soll-Temperatur", humid_label: "Luftfeuchtigkeit (überschreibt Klima)",
    window_label: "Fenster (Liste)", battery_label: "Batterien (Liste)", name: "Name", icon: "Icon", color: "Iconfarbe",
    force_color: "Manuelle Farbe erzwingen (Immer sichtbar)", img_url: "Bild URL", path: "Pfad (Tap Action)", entity: "Entität", device: "Gerät (Optional)",
    template: "Typ-Filter", add_template: "mit Filter", add_prefix: "Add",
    tmpl_light: "Licht", tmpl_switch: "Schalter / Steckdose", tmpl_climate: "Klima", tmpl_cover: "Rollladen / Abdeckung", tmpl_media: "Media Player",
    show_state: "Status anzeigen",
    height: "Höhe", width: "Breite", align: "Ausrichtung", visible: "Sichtbar", left: "Links", center: "Mitte", right: "Rechts",
    tap_action: "Antippen", hold_action: "Gedrückt halten", double_tap_action: "Doppelklick",
    act_more: "Details (Standard)", act_toggle: "Umschalten", act_none: "Nichts",
    upload_btn: "Bild hochladen", uploading: "Wird hochgeladen...", upload_success: "Fertig!",
    migration_title: "Handlung erforderlich", 
    migration_text: "Karte wurde in <b>oneline-room-card</b> umbenannt.<br>Bitte ändere <code>type: custom:room-card</code> zu <code>type: custom:oneline-room-card</code> in deiner YAML-Konfiguration."
  },
  fr: {
    empty: "Vide", low: "Faible", critical: "Critique", window: "Fenêtre", general: "Général",
    sensors_manual: "Capteurs (Manuel)", buttons: "Boutons", button: "Bouton", add_button: "Ajouter un bouton",
    main_climate: "Appareil climatique principal (Optionnel)", climate_info: "Remplit automatiquement Temp/Humidité si vide ci-dessous.",
    temp_label: "Température (remplace climat)", target_temp_label: "Température cible", humid_label: "Humidité (remplace climat)",
    window_label: "Fenêtres (Liste)", battery_label: "Batteries (Liste)", name: "Nom", icon: "Icône", color: "Couleur",
    force_color: "Forcer la couleur", img_url: "URL de l'image", path: "Chemin (Tap Action)", entity: "Entité", device: "Appareil (Optionnel)",
    template: "Filtre de type", add_template: "avec filtre", add_prefix: "Ajouter",
    tmpl_light: "Lumière", tmpl_switch: "Interrupteur / Prise", tmpl_climate: "Climatisation", tmpl_cover: "Volet / Store", tmpl_media: "Lecteur multimédia",
    show_state: "Afficher l'état",
    height: "Hauteur", width: "Largeur", align: "Alignement", visible: "Visible", left: "Gauche", center: "Centre", right: "Droite",
    tap_action: "Appui court", hold_action: "Appui long", double_tap_action: "Double appui",
    act_more: "Détails (Défaut)", act_toggle: "Basculer", act_none: "Rien",
    upload_btn: "Télécharger une image", uploading: "Téléchargement...", upload_success: "Terminé!",
    migration_title: "Action requise", 
    migration_text: "Carte renommée en <b>oneline-room-card</b> pour éviter les conflits.<br>Veuillez changer <code>type: custom:room-card</code> en <code>type: custom:oneline-room-card</code>."
  }
};

const getTranslation = (hass, key) => {
  const lang = hass?.language?.split("-")[0] || "en";
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS["en"]?.[key] ?? key;
};

const clampNum = (v, min, max, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(n, max)) : fallback;
};

// =============================================================================
// MAIN CARD CLASS
// =============================================================================
class OneLineRoomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) this.render();
    this._updateContentState();
  }

  setConfig(config) {
    this.config = config;
    this._configChanged = true;
    if (!this.content) this.render();
    this.updateContent();
  }

  getCardSize() {
    const c = this.config?.controls;
    return 3 + Math.ceil((Array.isArray(c) ? c.length : 0) / 2.5);
  }

  static getStubConfig(hass) {
    return { name: "", entity: "", controls: [] };
  }

  render() {
    if (!this.config) return;
    this.shadowRoot.innerHTML = `
      <style>
        ha-card { position: relative; overflow: hidden; border-radius: 16px; background: none; border: none; cursor: default; }
        .container { display: flex; flex-direction: column; background: var(--ha-card-background, rgba(255,255,255,0.1)); border-radius: 16px; }
        .img-box { position: relative; width: 100%; height: 120px; overflow: hidden; border-radius: 16px 16px 0 0; background: #444; cursor: pointer; }
        .img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 12px; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); display: flex; align-items: center; gap: 12px; }
        .text { display: flex; flex-direction: column; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
        ha-icon { color: var(--icon-color, white); }
        .primary { font-weight: bold; font-size: 14px; }
        .secondary { font-size: 12px; opacity: 0.9; }
        .chips { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 2; }
        .chip { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; background: #FFF8E1; color: #FFA000; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .chip.alert { background: #FFEBEE; color: #D32F2F; }
        .controls { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; }
        .btn { position: relative; display: flex; align-items: center; gap: 10px; padding: 0 10px; border-radius: 12px; cursor: pointer; background: var(--btn-bg, var(--card-background-color, rgba(128,128,128,0.05))); border: 1px solid transparent; flex-grow: 1; flex-shrink: 1; min-width: 0; overflow: hidden; box-sizing: border-box; transition: background 0.2s; user-select: none; -webkit-user-select: none; flex-basis: var(--btn-flex-basis, auto); height: var(--btn-height, 60px); justify-content: var(--btn-justify, center); }
        .btn:hover { background: rgba(128,128,128,0.1); border-color: rgba(128,128,128,0.2); }
        .btn:active { background: rgba(128,128,128,0.15); }
        .icon-box { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; background: var(--icon-bg, transparent); }
        .btn-txt { display: flex; flex-direction: column; text-align: left; overflow: hidden; min-width: 0; flex: initial; max-width: 100%; }
        .btn ha-icon { color: var(--icon-color, grey); --mdc-icon-size: 20px; }
        .btn-name { font-size: 13px; font-weight: 600; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .btn-state { font-size: 11px; color: var(--secondary-text-color); margin-top: 1px; }
        .warn { position: absolute; top: 4px; right: 4px; color: #d32f2f; --mdc-icon-size: 16px; background: rgba(255,255,255,0.8); border-radius: 50%; padding: 1px; }
      </style>
      <ha-card>
        <div class="container">
          <div class="img-box">
            <img id="bg" class="img">
            <div class="overlay">
              <ha-icon id="icon"></ha-icon>
              <div class="text">
                <span id="name" class="primary"></span>
                <span id="info" class="secondary"></span>
              </div>
            </div>
            <div id="chips" class="chips"></div>
          </div>
          <div id="ctrls" class="controls"></div>
        </div>
      </ha-card>`;

    this.content = this.shadowRoot.querySelector(".container");
    this.controls = this.shadowRoot.getElementById("ctrls");
    this.shadowRoot.querySelector(".img-box").addEventListener("click", () => this._nav());

    if (this.config) {
      this._configChanged = true;
      this.updateContent();
    }
  }

  updateContent() {
    if (!this.config || !this._hass || !this.content) return;
    this._updateContentState();
  }

  _updateContentState() {
    if (!this.config || !this._hass || !this.content) return;
    const h = this._hass, c = this.config;
    const effectiveEntity = c.entity;
    const effectiveTempSensor = c.temp_sensor;
    const effectiveHumidSensor = c.humid_sensor;
    const effectiveWindowSensors = c.window_sensors || [];
    const effectiveBatterySensors = c.battery_sensors || [];
    // --- NEW: DYNAMIC UNIT ---
    const unit = h.config.unit_system.temperature || "°C";

    this.shadowRoot.getElementById("bg").src = c.image || "/static/images/card_media/cover.png";
    this.shadowRoot.getElementById("name").innerText = c.name || "Room";
    const ico = this.shadowRoot.getElementById("icon");
    ico.icon = c.icon || "mdi:home";
    ico.style.setProperty("--icon-color", c.color || "white");

    let t = null, hm = null, tar = null;
    if (effectiveTempSensor && h.states[effectiveTempSensor]) t = h.states[effectiveTempSensor].state;
    else if (effectiveEntity && h.states[effectiveEntity]?.attributes?.current_temperature !== undefined) t = h.states[effectiveEntity].attributes.current_temperature;

    if (effectiveEntity && h.states[effectiveEntity]?.attributes?.temperature !== undefined) tar = h.states[effectiveEntity].attributes.temperature;
    if (c.target_temp_sensor && h.states[c.target_temp_sensor]) tar = h.states[c.target_temp_sensor].state;

    if (effectiveHumidSensor && h.states[effectiveHumidSensor]) hm = h.states[effectiveHumidSensor].state;
    else if (effectiveEntity && h.states[effectiveEntity]?.attributes?.current_humidity !== undefined) hm = h.states[effectiveEntity].attributes.current_humidity;

    const infoParts = [];
    if (t != null && t !== "-" && !isNaN(parseFloat(t))) {
      // --- NEW: USE DYNAMIC UNIT ---
      let tStr = t + unit;
      if (tar != null && tar !== "-") tStr += " (" + tar + unit + ")";
      infoParts.push(tStr);
    }
    if (hm != null && hm !== "-" && !isNaN(parseFloat(hm))) infoParts.push(hm + "%");

    this.shadowRoot.getElementById("info").innerText = infoParts.join(" | ");

    const ch = this.shadowRoot.getElementById("chips");
    ch.innerHTML = "";
    let al = null;
    (Array.isArray(effectiveBatterySensors) ? effectiveBatterySensors : []).forEach(s => {
      const st = h.states[s]; if (!st) return;
      if (st.state === "on") al = getTranslation(h, "empty");
      else if (!isNaN(parseFloat(st.state))) {
        if (st.state <= 5) al = getTranslation(h, "critical");
        else if (st.state <= 15 && !al) al = getTranslation(h, "low");
      }
    });

    if (al) ch.innerHTML += `<div class="chip alert"><ha-icon icon="mdi:battery-alert" style="--mdc-icon-size:14px"></ha-icon> ${al}</div>`;
    (Array.isArray(effectiveWindowSensors) ? effectiveWindowSensors : []).forEach(s => {
      const st = h.states[s];
      if (st?.state === "on") ch.innerHTML += `<div class="chip"><ha-icon icon="mdi:window-open-variant" style="--mdc-icon-size:14px"></ha-icon> ${st.attributes.friendly_name || getTranslation(h, "window")}</div>`;
    });

    const visibleCtrls = (c.controls || []).filter(ctrl => ctrl.entity && !ctrl.hide);

    if (this._configChanged) {
      this.controls.replaceChildren();
      visibleCtrls.forEach(ctrl => {
        const btn = this._createBtn(ctrl);
        this.controls.appendChild(btn);
        this._updateBtnState(btn, ctrl, h);
      });
      this._configChanged = false;
    } else {
      visibleCtrls.forEach((ctrl, i) => {
        const btn = this.controls.children[i];
        if (btn) this._updateBtnState(btn, ctrl, h);
      });
    }
  }

  _createBtn(ctrl) {
    const btn = document.createElement("div");
    btn.className = "btn";
    btn.style.setProperty("--btn-flex-basis", `calc(${(clampNum(ctrl.width, 1, 60, 15) / 60) * 100}% - 6px)`);
    btn.style.setProperty("--btn-height", `${clampNum(ctrl.height, 40, 250, 60)}px`);
    let justify = "center";
    if (ctrl.align === "left") justify = "flex-start";
    if (ctrl.align === "right") justify = "flex-end";
    btn.style.setProperty("--btn-justify", justify);
    this._attachActions(btn, ctrl);
    return btn;
  }

  _updateBtnState(btn, ctrl, h) {
    const st = h.states[ctrl.entity];
    const s = st ? st.state : "N/A";
    const domain = ctrl.entity.split(".")[0];
    const unit = h.config.unit_system.temperature || "°C"; // --- NEW: DYNAMIC UNIT ---

    let typ = "default";
    if (domain === "cover") typ = "shutter";
    else if (domain === "climate") typ = "climate";
    else if (domain === "switch") typ = "socket";
    else if (domain === "light") typ = "light";

    let col = "grey", bg = "rgba(128,128,128,0.1)";
    const isUnavail = s === "unavailable" || s === "unknown";

    if (ctrl.force_color && ctrl.color) {
      col = ctrl.color;
      const isHex = /^#[0-9A-F]{6}$/i.test(ctrl.color);
      bg = isHex ? ctrl.color + "33" : `color-mix(in srgb, ${ctrl.color} 20%, transparent)`;
    } else {
      const activeStates = ["on", "open", "playing", "heat", "cool", "auto", "drying", "fan_only", "cleaning", "manual", "boost", "unlocked", "home"];
      const isActive = activeStates.includes(s) || (typ === "shutter" && s !== "closed") || (typ === "climate" && s !== "off" && !isUnavail);
      if (st && isActive) {
        if (st.attributes.rgb_color) {
          const rgb = st.attributes.rgb_color.join(",");
          col = `rgb(${rgb})`; bg = `rgba(${rgb}, 0.2)`;
        } else if (typ === "climate" && st.attributes.hvac_action) {
          const act = st.attributes.hvac_action;
          if (act === "heating") { col = "#FF5722"; bg = "rgba(255,87,34,0.2)"; }
          else if (act === "cooling") { col = "#2196F3"; bg = "rgba(33,150,243,0.2)"; }
          else { col = "#4CAF50"; bg = "rgba(76,175,80,0.2)"; }
        } else {
          const themeVar = `var(--state-${domain}-active-color, var(--state-active-color, #ff9800))`;
          col = themeVar; bg = `color-mix(in srgb, ${themeVar} 20%, transparent)`;
        }
      }
    }

    const nameTxt = ctrl.name !== undefined ? ctrl.name : "Dev";
    let badge = "";
    if (isUnavail) badge = `<ha-icon class="warn" icon="mdi:alert-circle"></ha-icon>`;

    // --- NEW: USE DYNAMIC UNIT IN TEMPLATE ---
    const stateText = typ === "climate" && st?.attributes?.current_temperature
      ? st.attributes.current_temperature + unit
      : s;
    const showState = ctrl.show_state !== false;
    const stateHtml = showState ? `<span class="btn-state">${stateText}</span>` : "";

    btn.innerHTML = `
      <div class="icon-box">
        <ha-icon icon="${ctrl.icon || "mdi:circle"}" style="--mdc-icon-size:20px"></ha-icon>
      </div>
      <div class="btn-txt">
        <span class="btn-name">${nameTxt}</span>
        ${stateHtml}
      </div>
      ${badge}`;
    
    // Apply dynamic colors via CSS custom properties
    btn.style.setProperty("--icon-color", col);
    btn.style.setProperty("--btn-bg", bg);
  }

  _attachActions(node, ctrl) {
    const domain = ctrl.entity ? ctrl.entity.split(".")[0] : "";
    const canToggle = ["light", "switch", "input_boolean", "automation", "fan", "cover", "lock", "media_player", "vacuum", "group", "humidifier", "climate"].includes(domain);
    const config = {
      entity: ctrl.entity,
      tap_action: ctrl.tap_action || { action: "more-info" },
      hold_action: ctrl.hold_action || { action: canToggle ? "toggle" : "none" },
      double_tap_action: ctrl.double_tap_action || { action: "none" }
    };
    let timer = null, held = false, holdTimer = null;
    node.addEventListener("pointerdown", () => {
      held = false;
      holdTimer = setTimeout(() => { held = true; this._fireAction("hold", config); }, 500);
    });
    const cancel = () => { if (holdTimer) clearTimeout(holdTimer); };
    node.addEventListener("pointerup", cancel);
    node.addEventListener("pointerleave", cancel);
    node.addEventListener("pointercancel", cancel);
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      if (held) return;
      if (config.double_tap_action.action !== "none") {
        if (timer) { clearTimeout(timer); timer = null; this._fireAction("double_tap", config); }
        else { timer = setTimeout(() => { timer = null; this._fireAction("tap", config); }, 250); }
      } else { this._fireAction("tap", config); }
    });
  }

  _fireAction(type, config) {
    const actionKey = `${type}_action`;
    let actionConfig = config[actionKey] || {};
    if (!actionConfig || typeof actionConfig !== 'object') actionConfig = { action: 'none' };
    if (!actionConfig.action) actionConfig.action = "none";
    if (actionConfig.action === "toggle" && config.entity) {
      const domain = config.entity.split(".")[0];
      if (domain === "climate" && this._hass) {
        const state = this._hass.states[config.entity];
        if (state) {
          actionConfig = state.state !== "off"
            ? { action: "call-service", service: "climate.set_hvac_mode", data: { hvac_mode: "off" }, target: { entity_id: config.entity } }
            : { action: "call-service", service: "climate.turn_on", target: { entity_id: config.entity } };
        }
      }
    }
    const eventDetail = {
      config: {
        entity: config.entity,
        [actionKey]: { entity: config.entity, ...actionConfig }
      },
      action: type
    };
    this.dispatchEvent(new CustomEvent("hass-action", { bubbles: true, composed: true, detail: eventDetail }));
  }

  _nav() {
    if (this.config.tap_action?.action === "navigate" && this.config.tap_action?.navigation_path) {
      history.pushState(null, "", this.config.tap_action.navigation_path);
      window.dispatchEvent(new Event("location-changed", { bubbles: true, composed: true }));
    }
  }

  static getConfigElement() { return document.createElement("oneline-room-card-editor"); }
}

// =============================================================================
// EDITOR CLASS
// =============================================================================
class OneLineRoomCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = config || {};
    if (!Array.isArray(this._config.controls)) this._config = { ...this._config, controls: [] };
    this.render();
  }

  set hass(hass) {
    const upd = this._hass?.language !== hass?.language;
    this._hass = hass;
    if (upd) this.render();
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-selector,ha-entity-picker,ha-icon-picker,ha-textfield,ha-switch").forEach(e => {
        if (e.hass !== hass) e.hass = hass;
      });
    }
  }

  _fire(config) {
    this._config = config;
    clearTimeout(this._tm);
    this._tm = setTimeout(() => {
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }, 300);
  }

  async _handleUpload(e) {
    const file = e.target.files[0];
    if (!file || !this._hass) return;
    const btn = this.shadowRoot.getElementById("upload-btn");
    if (btn) btn.innerText = getTranslation(this._hass, "uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await this._hass.fetchWithAuth("/api/image/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      const imgUrl = `/api/image/serve/${data.id}/original`;
      this._fire({ ...this._config, image: imgUrl });
      this.updPreview();
      if (btn) btn.innerText = getTranslation(this._hass, "upload_success");
      setTimeout(() => { if (btn) btn.innerText = getTranslation(this._hass, "upload_btn"); }, 2000);
    } catch (err) {
      console.error("Upload Error:", err);
      if (btn) btn.innerText = "Error!";
    }
  }

  _applyNavSelectorOptions() {
    const nav = this.shadowRoot?.getElementById("nav-path");
    if (!nav) return;
    const options = Array.isArray(this._navOptions) ? this._navOptions : [];
    nav.selector = { select: { mode: "dropdown", options, custom_value: true } };
    nav.value = this._config?.tap_action?.navigation_path || "";
    if (this._hass && nav.hass !== this._hass) nav.hass = this._hass;
  }

  _defaultIconForDomain(domain) {
    const map = {
      light: "mdi:lightbulb",
      switch: "mdi:toggle-switch",
      climate: "mdi:thermostat",
      cover: "mdi:window-shutter",
      fan: "mdi:fan",
      media_player: "mdi:play-circle",
      lock: "mdi:lock",
      input_boolean: "mdi:toggle-switch",
      vacuum: "mdi:robot-vacuum",
      humidifier: "mdi:air-humidifier",
      sensor: "mdi:gauge",
      binary_sensor: "mdi:checkbox-marked-circle-outline"
    };
    return map[domain] || "mdi:help-circle-outline";
  }

  _getControlTemplates() {
    const h = this._hass;
    return [
      {
        id: "light",
        label: getTranslation(h, "tmpl_light"),
        domains: ["light"],
        defaults: {
          icon: "mdi:lightbulb",
          width: 15,
          height: 60,
          align: "center",
          tap_action: { action: "toggle" },
          hold_action: { action: "more-info" },
          double_tap_action: { action: "none" },
          show_state: true
        }
      },
      {
        id: "switch",
        label: getTranslation(h, "tmpl_switch"),
        domains: ["switch"],
        defaults: {
          icon: "mdi:power-socket-eu",
          width: 15,
          height: 60,
          align: "center",
          tap_action: { action: "toggle" },
          hold_action: { action: "more-info" },
          double_tap_action: { action: "none" },
          show_state: true
        }
      },
      {
        id: "climate",
        label: getTranslation(h, "tmpl_climate"),
        domains: ["climate"],
        defaults: {
          icon: "mdi:thermostat",
          width: 30,
          height: 60,
          align: "left",
          tap_action: { action: "more-info" },
          hold_action: { action: "toggle" },
          double_tap_action: { action: "none" },
          show_state: true
        }
      },
      {
        id: "cover",
        label: getTranslation(h, "tmpl_cover"),
        domains: ["cover"],
        defaults: {
          icon: "mdi:window-shutter",
          width: 20,
          height: 60,
          align: "center",
          tap_action: { action: "toggle" },
          hold_action: { action: "more-info" },
          double_tap_action: { action: "none" },
          show_state: true
        }
      },
      {
        id: "media_player",
        label: getTranslation(h, "tmpl_media"),
        domains: ["media_player"],
        defaults: {
          icon: "mdi:play-circle",
          width: 30,
          height: 60,
          align: "left",
          tap_action: { action: "toggle" },
          hold_action: { action: "more-info" },
          double_tap_action: { action: "none" },
          show_state: true
        }
      }
    ];
  }

  _getTemplateById(templateId) {
    const templates = this._getControlTemplates();
    return templates.find((t) => t.id === templateId);
  }

  _buildControlFromTemplate(template, entityId) {
    const st = this._hass?.states?.[entityId];
    const name = st?.attributes?.friendly_name || "";
    const icon = st?.attributes?.icon || template?.defaults?.icon || this._iconForEntity(entityId);
    const defaults = template?.defaults || {};
    return {
      entity: entityId || "",
      name,
      icon,
      width: defaults.width ?? 15,
      height: defaults.height ?? 60,
      align: defaults.align || "center",
      show_state: defaults.show_state !== false,
      tap_action: defaults.tap_action || { action: "more-info" },
      hold_action: defaults.hold_action || { action: "toggle" },
      double_tap_action: defaults.double_tap_action || { action: "none" }
    };
  }

  _iconForEntity(entityId) {
    if (!this._hass || !entityId) return "mdi:help-circle-outline";
    const st = this._hass.states[entityId];
    if (st?.attributes?.icon) return st.attributes.icon;
    const domain = entityId.split(".")[0];
    return this._defaultIconForDomain(domain);
  }

  async _resolveEntityFromDevice(deviceId) {
    if (!this._hass || !deviceId) return;
    try {
      const entries = await this._hass.callWS({ type: "config/entity_registry/list" });
      const devEntries = (Array.isArray(entries) ? entries : []).filter(
        (e) => e.device_id === deviceId && !e.disabled_by
      );
      if (devEntries.length === 0) return null;
      const preferredDomains = [
        "light",
        "switch",
        "climate",
        "cover",
        "fan",
        "media_player",
        "lock",
        "input_boolean",
        "vacuum",
        "humidifier",
        "sensor",
        "binary_sensor"
      ];
      for (const domain of preferredDomains) {
        const found = devEntries.find((e) => e.entity_id?.startsWith(`${domain}.`));
        if (found?.entity_id) return found.entity_id;
      }
      return devEntries[0].entity_id || null;
    } catch (err) {
      return null;
    }
  }

  async _ensureNavOptions() {
    if (!this._hass || this._navOptionsLoaded) return;
    this._navOptionsLoaded = true;
    try {
      const optionsMap = new Map();

      const addOption = (value, label) => {
        if (!value || optionsMap.has(value)) return;
        optionsMap.set(value, { value, label: label || value });
      };

      const addPanelViews = (panel, config) => {
        const panelPath = panel?.url_path || "lovelace";
        const panelLabel = panel?.title || panelPath;
        addOption(`/${panelPath}`, `${panelLabel} / (default)`);
        const views = Array.isArray(config?.views) ? config.views : [];
        views.forEach((view, index) => {
          const viewPath = view?.path || String(index);
          const fullPath = `/${panelPath}/${viewPath}`;
          const viewLabel = view?.title || viewPath || String(index);
          addOption(fullPath, `${panelLabel} / ${viewLabel}`);
        });
      };

      // Always include default Lovelace dashboard + views
      try {
        const cfg = await this._hass.connection.sendMessagePromise({ type: "lovelace/config" });
        addPanelViews({ url_path: "lovelace", title: "Lovelace" }, cfg);
      } catch (err) {
        addOption("/lovelace", "Lovelace (/lovelace)");
      }

      // Prefer Lovelace dashboards + views
      let dashboards = [];
      try {
        const dashResp = await this._hass.connection.sendMessagePromise({ type: "lovelace/dashboards" });
        if (Array.isArray(dashResp?.dashboards)) dashboards = dashResp.dashboards;
        else if (dashResp?.dashboards && typeof dashResp.dashboards === "object") dashboards = Object.values(dashResp.dashboards);
      } catch (err) {
        dashboards = [];
      }

      if (dashboards.length === 0) {
        const lovelacePanels = Object.values(this._hass.panels || {}).filter(p => p.component_name === "lovelace");
        dashboards = lovelacePanels.map(p => ({ url_path: p.url_path, title: p.title || p.url_path, default: p?.url_path === "lovelace" }));
      }

      if (dashboards.length > 0) {
        for (const dash of dashboards) {
          const isDefault = dash?.default || dash?.url_path === undefined || dash?.url_path === null || dash?.url_path === "";
          const urlPath = isDefault ? "lovelace" : dash.url_path;
          const title = dash.title || urlPath;
          try {
            const cfg = isDefault
              ? await this._hass.connection.sendMessagePromise({ type: "lovelace/config" })
              : await this._hass.connection.sendMessagePromise({ type: "lovelace/config", url_path: urlPath });
            addPanelViews({ url_path: urlPath, title }, cfg);
          } catch (err) {
            addOption(`/${urlPath}`, `${title} (${`/${urlPath}`})`);
          }
        }
      }

      this._navOptions = Array.from(optionsMap.values());
      this._applyNavSelectorOptions();
    } catch (err) {
      this._navOptionsLoaded = false;
    }
  }

  render() {
    if (!this._config) return;
    const alreadyRendered = !!this.shadowRoot.innerHTML;
    if (alreadyRendered) { this.updVal(); this.renBtn(); this._applyNavSelectorOptions(); this._ensureNavOptions(); return; }
    const h = this._hass;
    this.shadowRoot.innerHTML = `
      <style>
        .sec { padding: 12px 0; border-bottom: 1px solid var(--divider-color); }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .tmpl-label-row { margin-bottom: 4px; }
        .tmpl-label { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .tmpl-row { align-items: start; margin-bottom: 12px; }
        .tmpl-row ha-textfield,
        .tmpl-row ha-selector,
        .tmpl-row ha-entity-picker,
        .tmpl-row ha-icon-picker { margin-bottom: 0; }
        .add-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .add-prefix { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .box { border: 1px solid var(--divider-color); padding: 12px; border-radius: 8px; background: var(--secondary-background-color); margin-bottom: 12px; }
        .head { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; }
        ha-textfield, ha-selector, ha-entity-picker, ha-icon-picker { width: 100%; display: block; margin-bottom: 8px; }
        .preview { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; background: #444; display: none; }
        .preview.show { display: block; }
        .upload-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
        .upload-hidden { display: none; }
        .cl-row { display: flex; gap: 8px; align-items: center; }
        .cp { width: 50px; height: 40px; border: 1px solid var(--divider-color); background: none; padding: 2px; border-radius: 4px; cursor: pointer; flex-shrink: 0; }
        .hidden { display: none !important; }
      </style>
      <div class="sec">
        <h3>${getTranslation(h, "general")}</h3>
        <ha-textfield label="${getTranslation(h, "name")}" cfg="name" class="i"></ha-textfield>
        <ha-entity-picker label="${getTranslation(h, "main_climate")}" cfg="entity" class="i" include-domains='["climate"]'></ha-entity-picker>
        <div class="row">
          <ha-icon-picker label="${getTranslation(h, "icon")}" cfg="icon" class="i"></ha-icon-picker>
          <div class="cl-row">
            <ha-textfield label="${getTranslation(h, "color")}" cfg="color" class="i"></ha-textfield>
            <input type="color" class="cp i-cp" cfg="color">
          </div>
        </div>
        <label style="display:block;margin-bottom:4px;font-weight:bold">${getTranslation(h, "img_url")}</label>
        <img id="prev-img" class="preview">
        <ha-textfield id="img-url-field" cfg="image" class="i" icon="mdi:image"></ha-textfield>
        <div class="upload-row">
          <input type="file" id="file-upload" class="upload-hidden" accept="image/*">
          <mwc-button id="upload-btn" raised label="${getTranslation(h, "upload_btn")}">
            <ha-icon icon="mdi:upload" slot="icon"></ha-icon>
          </mwc-button>
        </div>
        <ha-selector id="nav-path" label="${getTranslation(h, "path")}" style="margin-top:12px"></ha-selector>
      </div>
      <div class="sec">
        <h3>${getTranslation(h, "sensors_manual")}</h3>
        <ha-entity-picker label="${getTranslation(h, "temp_label")}" cfg="temp_sensor" class="i" allow-custom-entity></ha-entity-picker>
        <ha-entity-picker label="${getTranslation(h, "target_temp_label")}" cfg="target_temp_sensor" class="i" allow-custom-entity></ha-entity-picker>
        <ha-entity-picker label="${getTranslation(h, "humid_label")}" cfg="humid_sensor" class="i" allow-custom-entity></ha-entity-picker>
        <ha-selector cfg="window_sensors" class="i" label="${getTranslation(h, "window_label")}"></ha-selector>
        <ha-selector cfg="battery_sensors" class="i" label="${getTranslation(h, "battery_label")}"></ha-selector>
      </div>
      <div class="sec">
        <h3>${getTranslation(h, "buttons")}</h3>
        <div class="row tmpl-label-row">
          <div class="tmpl-label">${getTranslation(h, "template")}</div>
          <div class="tmpl-label">${getTranslation(h, "entity")}</div>
        </div>
        <div class="row tmpl-row">
          <ha-selector id="tmpl-select" aria-label="${getTranslation(h, "template")}"></ha-selector>
          <ha-entity-picker id="tmpl-entity" aria-label="${getTranslation(h, "entity")}"></ha-entity-picker>
        </div>
        <div class="add-row">
          <span class="add-prefix">${getTranslation(h, "add_prefix")}</span>
          <mwc-button id="add-template" raised label="${getTranslation(h, "add_template")}">
            <ha-icon icon="mdi:playlist-plus" slot="icon"></ha-icon>
          </mwc-button>
        </div>
        <div id="b"></div>
        <mwc-button id="add" raised label="${getTranslation(h, "add_button")}">
          <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
        </mwc-button>
      </div>`;

    const fileInput = this.shadowRoot.getElementById("file-upload");
    const uploadBtn = this.shadowRoot.getElementById("upload-btn");
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => this._handleUpload(e));
    }

    this.shadowRoot.querySelectorAll(".i").forEach(e => {
      const k = e.getAttribute("cfg");
      if (k === "window_sensors") e.selector = { entity: { domain: "binary_sensor", device_class: ["window", "door", "garage_door"], multiple: true } };
      else if (k === "battery_sensors") e.selector = { entity: { device_class: "battery", multiple: true } };
      if (this._hass) e.hass = this._hass;
      const evType = e.localName === "ha-textfield" ? "change" : "value-changed";
      e.addEventListener(evType, (ev) => {
        ev.stopPropagation();
        const v = ev.detail?.value !== undefined ? ev.detail.value : ev.target.value;
        const c = { ...this._config };
        c[k] = v;
        this._fire(c);
        if (k === "color") this.updCp();
        if (k === "image") this.updPreview();
      });
    });
    const navSelect = this.shadowRoot.getElementById("nav-path");
    if (navSelect) {
      navSelect.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const v = ev.detail?.value ?? "";
        const c = { ...this._config };
        if (v?.trim()) c.tap_action = { action: "navigate", navigation_path: v };
        else delete c.tap_action;
        this._fire(c);
      });
    }
    this._applyNavSelectorOptions();
    this._ensureNavOptions();

    const tmplSelect = this.shadowRoot.getElementById("tmpl-select");
    const tmplEntity = this.shadowRoot.getElementById("tmpl-entity");
    if (tmplSelect) {
      tmplSelect.selector = {
        select: {
          mode: "dropdown",
          options: this._getControlTemplates().map((t) => ({ value: t.id, label: t.label }))
        }
      };
      tmplSelect.value = tmplSelect.value || "light";
      if (this._hass) tmplSelect.hass = this._hass;
      tmplSelect.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const tid = ev.detail?.value;
        const template = this._getTemplateById(tid);
        const domains = template?.domains || [];
        if (tmplEntity && domains.length > 0) tmplEntity.setAttribute("include-domains", JSON.stringify(domains));
      });
    }
    if (tmplEntity && this._hass) tmplEntity.hass = this._hass;
    if (tmplEntity && tmplSelect) {
      const template = this._getTemplateById(tmplSelect.value || "light");
      const domains = template?.domains || [];
      if (domains.length > 0) tmplEntity.setAttribute("include-domains", JSON.stringify(domains));
    }
    const addTemplateBtn = this.shadowRoot.getElementById("add-template");
    if (addTemplateBtn) {
      addTemplateBtn.addEventListener("click", () => {
        const tid = tmplSelect?.value || "light";
        const ent = tmplEntity?.value || "";
        if (!ent) return;
        const template = this._getTemplateById(tid);
        const next = this._buildControlFromTemplate(template, ent);
        const c = [...(this._config.controls || []), next];
        this._fire({ ...this._config, controls: c });
        this.renBtn();
      });
    }

    this.shadowRoot.querySelectorAll(".i-cp").forEach(e => {
      e.addEventListener("change", (ev) => {
        ev.stopPropagation();
        this._fire({ ...this._config, color: ev.target.value });
        this.updVal();
      });
    });

    this.shadowRoot.getElementById("add").addEventListener("click", () => {
      const c = [...(this._config.controls || [])];
      let w = 15; if (c.length > 0) w = c[c.length - 1].width || 15;
      let ent = "", ic = "mdi:lightbulb", n = "";
      if (c.length === 0 && this._config.entity) {
        ent = this._config.entity; ic = "mdi:thermostat";
        if (this._hass?.states[ent]) {
          n = this._hass.states[ent].attributes.friendly_name || "";
          if (this._hass.states[ent].attributes.icon) ic = this._hass.states[ent].attributes.icon;
        }
      }
      c.push({ entity: ent, name: n, icon: ic, width: w, height: 60 });
      this._fire({ ...this._config, controls: c });
      this.renBtn();
    });
    this.updVal(); this.updCp(); this.renBtn(); this.updPreview();
  }

  updPreview() {
    if (!this._config) return;
    const img = this.shadowRoot.getElementById("prev-img");
    if (this._config.image) {
      img.src = this._config.image;
      img.classList.add("show");
    } else { img.classList.remove("show"); }
  }

  renBtn() {
    if (!this._config?.controls) return;
    const div = this.shadowRoot.getElementById("b"); if (!div) return;
    const h = this._hass; div.replaceChildren();
    const actOpts = [
      { value: "more-info", label: getTranslation(h, "act_more") },
      { value: "toggle", label: getTranslation(h, "act_toggle") },
      { value: "none", label: getTranslation(h, "act_none") }
    ];
    this._config.controls.forEach((ctrl, i) => {
      const box = document.createElement("div"); box.className = "box";
      const hideColor = !ctrl.force_color ? "hidden" : "";
      const showNav = ctrl.tap_action?.action === "navigate" ? "" : "hidden";
      box.innerHTML = `
        <div class="head">#${i + 1}
          <div><ha-icon class="mv u" icon="mdi:arrow-up"></ha-icon><ha-icon class="mv d" icon="mdi:arrow-down"></ha-icon><ha-icon class="del" icon="mdi:delete" style="color:#d32f2f"></ha-icon></div>
        </div>
        <div class="dv-wrap"></div>
        <ha-entity-picker class="ep" label="${getTranslation(h, "entity")}"></ha-entity-picker>
        <div class="row"><ha-textfield class="nm" label="${getTranslation(h, "name")}"></ha-textfield><ha-icon-picker class="ic" label="${getTranslation(h, "icon")}"></ha-icon-picker></div>
        <div class="row"><ha-selector class="ht" label="${getTranslation(h, "height")}"></ha-selector><ha-selector class="wd" label="${getTranslation(h, "width")}"></ha-selector></div>
        <div class="row" style="margin-top:8px; align-items:center"><ha-formfield label="${getTranslation(h, "force_color")}"><ha-switch class="fc"></ha-switch></ha-formfield></div>
        <div class="cl-row ${hideColor}"><ha-textfield class="cl" label="${getTranslation(h, "color")}"></ha-textfield><input type="color" class="cp cl-p"></div>
        <div class="row" style="margin-top:8px; align-items:center"><ha-selector class="al" label="${getTranslation(h, "align")}"></ha-selector><ha-formfield label="${getTranslation(h, "show_state")}"><ha-switch class="ss" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "visible")}"><ha-switch class="hd" checked></ha-switch></ha-formfield></div>
        <div style="margin-top:12px; border-top:1px solid var(--divider-color); padding-top:12px"><ha-selector class="tap" label="${getTranslation(h, "tap_action")}"></ha-selector><ha-textfield class="tap-nav ${showNav}" label="Nav Pfad"></ha-textfield><ha-selector class="hold" label="${getTranslation(h, "hold_action")}"></ha-selector><ha-selector class="dbl" label="${getTranslation(h, "double_tap_action")}"></ha-selector></div>`;

      const upd = (k, v) => { const c = [...this._config.controls]; c[i] = { ...c[i], [k]: v }; this._fire({ ...this._config, controls: c }); };
      const updAct = (type, val) => { const c = [...this._config.controls]; const old = c[i][type] || {}; c[i] = { ...c[i], [type]: { ...old, action: val } }; this._fire({ ...this._config, controls: c }); this.renBtn(); };
      box.querySelector(".u").onclick = () => { if (i > 0) { const c = [...this._config.controls];[c[i], c[i - 1]] = [c[i - 1], c[i]]; this._fire({ ...this._config, controls: c }); this.renBtn(); } };
      box.querySelector(".d").onclick = () => { if (i < this._config.controls.length - 1) { const c = [...this._config.controls];[c[i], c[i + 1]] = [c[i + 1], c[i]]; this._fire({ ...this._config, controls: c }); this.renBtn(); } };
      box.querySelector(".del").onclick = () => { const c = [...this._config.controls]; c.splice(i, 1); this._fire({ ...this._config, controls: c }); this.renBtn(); };
      const ep = box.querySelector(".ep"); ep.hass = h; ep.value = ctrl.entity;
      ep.addEventListener("value-changed", e => {
        const val = e.detail.value; const st = h.states[val]; const c = [...this._config.controls]; let changes = { entity: val };
        if (st?.attributes?.icon) changes.icon = st.attributes.icon; else changes.icon = "mdi:help-circle-outline";
        if (st?.attributes?.friendly_name) changes.name = st.attributes.friendly_name;
        c[i] = { ...c[i], ...changes }; this._fire({ ...this._config, controls: c }); this.renBtn();
      });
      const dvWrap = box.querySelector(".dv-wrap");
      if (dvWrap) {
        const dv = document.createElement("ha-selector");
        dv.className = "dv";
        dv.label = getTranslation(h, "device");
        dv.hass = h;
        dv.selector = { device: {} };
        dv.value = ctrl.device || "";
        dv.addEventListener("value-changed", async e => {
          e.stopPropagation();
          const deviceId = e.detail?.value ?? "";
          const c = [...this._config.controls];
          const next = { ...c[i], device: deviceId || undefined };
          if (deviceId) {
            const ent = await this._resolveEntityFromDevice(deviceId);
            if (ent) {
              next.entity = ent;
              next.icon = this._iconForEntity(ent);
              const st = h.states[ent];
              if (st?.attributes?.friendly_name) next.name = st.attributes.friendly_name;
            }
          }
          c[i] = next; this._fire({ ...this._config, controls: c }); this.renBtn();
        });
        dvWrap.appendChild(dv);
      }
      const nm = box.querySelector(".nm"); nm.value = ctrl.name || ""; nm.addEventListener("change", e => upd("name", e.target.value));
      const fc = box.querySelector(".fc"); fc.checked = ctrl.force_color === true; fc.addEventListener("change", e => { upd("force_color", e.target.checked); this.renBtn(); });
      const cl = box.querySelector(".cl"); cl.value = ctrl.color || ""; cl.addEventListener("change", e => upd("color", e.target.value));
      const clp = box.querySelector(".cl-p"); clp.value = ctrl.color || "#000000"; clp.addEventListener("change", e => upd("color", e.target.value));
      const ic = box.querySelector(".ic"); ic.value = ctrl.icon || ""; ic.addEventListener("value-changed", e => { e.stopPropagation(); upd("icon", e.detail.value); });
      const ht = box.querySelector(".ht"); ht.hass = h; ht.selector = { number: { min: 40, max: 250, mode: "box", unit_of_measurement: "px" } };
      ht.value = ctrl.height || 60; ht.addEventListener("value-changed", e => { e.stopPropagation(); upd("height", Number(e.detail.value)); });
      const wd = box.querySelector(".wd"); wd.hass = h; wd.selector = { select: { mode: "dropdown", options: [{ value: "60", label: "1/1" }, { value: "40", label: "2/3" }, { value: "30", label: "1/2" }, { value: "20", label: "1/3" }, { value: "15", label: "1/4" }, { value: "12", label: "1/5" }, { value: "10", label: "1/6" }] } };
      wd.value = String(ctrl.width || 15); wd.addEventListener("value-changed", e => { e.stopPropagation(); upd("width", parseInt(e.detail.value)); });
      const al = box.querySelector(".al"); al.hass = h; al.selector = { select: { mode: "dropdown", options: [{ value: "left", label: getTranslation(h, "left") }, { value: "center", label: getTranslation(h, "center") }, { value: "right", label: getTranslation(h, "right") }] } };
      al.value = ctrl.align || "center"; al.addEventListener("value-changed", e => { e.stopPropagation(); upd("align", e.detail.value); });
      const ss = box.querySelector(".ss"); ss.checked = ctrl.show_state !== false; ss.addEventListener("change", e => { e.stopPropagation(); upd("show_state", e.target.checked); });
      const hd = box.querySelector(".hd"); hd.checked = !ctrl.hide; hd.addEventListener("change", e => { e.stopPropagation(); upd("hide", !e.target.checked); });
      const tap = box.querySelector(".tap"); tap.hass = h; tap.selector = { select: { mode: "dropdown", options: actOpts } };
      tap.value = ctrl.tap_action?.action || "more-info"; tap.addEventListener("value-changed", e => { e.stopPropagation(); updAct("tap_action", e.detail.value); });
      const tapNav = box.querySelector(".tap-nav"); if (tapNav) {
        tapNav.value = ctrl.tap_action?.navigation_path || ""; tapNav.addEventListener("change", e => {
          const c = [...this._config.controls];
          const action = e.target.value ? { action: "navigate", navigation_path: e.target.value } : { action: "more-info" };
          c[i] = { ...c[i], tap_action: action };
          this._fire({ ...this._config, controls: c });
        });
      }
      const hold = box.querySelector(".hold"); hold.hass = h; hold.selector = { select: { mode: "dropdown", options: actOpts } };
      hold.value = ctrl.hold_action?.action || "toggle"; hold.addEventListener("value-changed", e => { e.stopPropagation(); updAct("hold_action", e.detail.value); });
      const dbl = box.querySelector(".dbl"); dbl.hass = h; dbl.selector = { select: { mode: "dropdown", options: actOpts } };
      dbl.value = ctrl.double_tap_action?.action || "none"; dbl.addEventListener("value-changed", e => { e.stopPropagation(); updAct("double_tap_action", e.detail.value); });
      div.appendChild(box);
    });
  }

  updVal() {
    if (!this._config) return;
    this.shadowRoot.querySelectorAll(".i").forEach(e => {
      const k = e.getAttribute("cfg");
      const v = k === "nav_path" ? this._config.tap_action?.navigation_path || "" : this._config[k] ?? "";
      if (e.value !== v) e.value = v;
    });
    const nav = this.shadowRoot.getElementById("nav-path");
    if (nav && nav.value !== (this._config.tap_action?.navigation_path || "")) {
      nav.value = this._config.tap_action?.navigation_path || "";
    }
  }

  updCp() {
    if (!this._config) return;
    this.shadowRoot.querySelectorAll(".i-cp").forEach(e => {
      const k = e.getAttribute("cfg");
      const v = this._config[k] || "#000000";
      if (e.value !== v) e.value = v;
    });
  }
}

// =============================================================================
// REGISTRATION (SAFE & ROBUST)
// =============================================================================

const patchExistingEditor = (ExistingEditor, NewEditor) => {
  const methods = ["render", "updVal", "updCp", "renBtn", "setConfig", "_fire", "_handleUpload", "updPreview"];
  methods.forEach((name) => {
    if (typeof NewEditor.prototype[name] === "function") {
      ExistingEditor.prototype[name] = NewEditor.prototype[name];
    }
  });
  const hassDesc = Object.getOwnPropertyDescriptor(NewEditor.prototype, "hass");
  if (hassDesc) Object.defineProperty(ExistingEditor.prototype, "hass", hassDesc);
};

// 1. Editor registrieren (wenn noch nicht da)
const existingEditor = customElements.get("oneline-room-card-editor");
if (!existingEditor) {
  customElements.define("oneline-room-card-editor", OneLineRoomCardEditor);
} else if (existingEditor !== OneLineRoomCardEditor) {
  patchExistingEditor(existingEditor, OneLineRoomCardEditor);
}

// 2. Neue Karte registrieren (wenn noch nicht da)
if (!customElements.get("oneline-room-card")) {
  customElements.define("oneline-room-card", OneLineRoomCard);
}

// 3. MIGRATION WARNING (wenn "room-card" noch frei ist)
if (!customElements.get("room-card")) {
  class MigrationWarningCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    setConfig(config) {
      this._config = config;
    }

    set hass(hass) {
      const title = getTranslation(hass, "migration_title");
      const text = getTranslation(hass, "migration_text");

      this.shadowRoot.innerHTML = `
        <style>
          ha-card { background: var(--ha-card-background, var(--card-background-color, white)); border-radius: var(--ha-card-border-radius, 12px); box-shadow: var(--ha-card-box-shadow, none); }
          .warn { padding: 16px; color: var(--error-color, #db4437); background: rgba(255, 0, 0, 0.1); border: 1px solid var(--error-color, #db4437); border-radius: 8px; }
        </style>
        <ha-card>
          <div class="warn">
            <h3 style="margin:0 0 8px 0; display:flex; align-items:center; gap:8px">
              <ha-icon icon="mdi:alert-circle"></ha-icon> ${title}
            </h3>
            <div>${text}</div>
          </div>
        </ha-card>
      `;
    }

    getCardSize() {
      return 2;
    }
  }

  customElements.define("room-card", MigrationWarningCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "oneline-room-card",
  name: "OneLine Room Card",
  preview: true,
  description: "Minimalist Room Card for Home Assistant"
});
