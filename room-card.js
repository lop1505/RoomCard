const VERSION = "1.1.0";
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
    humid_warn_threshold: "Humidity Warning Threshold (%)", high_humidity: "High humidity", device_unavailable: "Device unavailable",
    force_color: "Force Manual Color (Always visible)", img_url: "Image URL", image: "Image", path: "Path (Tap Action)", entity: "Entity", device: "Device (Optional)",
    template: "Type Filter", add_template: "with Filter", add_prefix: "Add",
    quick_add_title: "Quick Add",
    quick_add_desc: "Quickly add buttons from existing entities.",
    quick_add_entity_type_label: "Entity type",
    quick_add_entity_label: "Entity (filtered)",
    quick_add_entity_type_help: "Filters the entity list on the right.",
    quick_add_entity_help: "Select an entity of this type and click ‘Add’.",
    quick_add_entity_placeholder: "Select entity ({type})",
    quick_add_empty_hint: "No matching entities found.",
    quick_add_settings_caption: "Button settings (for added entries)",
    expand_all: "Expand all",
    collapse_all: "Collapse all",
    label_position: "Label & Status Position",
    label_position_all: "Label & status position (all buttons)",
    use_global: "Use global setting",
    pos_right: "Right",
    pos_bottom: "Bottom",
    pos_left: "Left",
    pos_top: "Top",
    row_type: "Row Type", type_entity: "Entity", type_template: "Template",
    tmpl_content: "Content (Template)", tmpl_icon: "Icon (Template)", tmpl_color: "Color (Template)", tmpl_state: "State (Template)", tmpl_preview: "Preview",
    tmpl_light: "Light", tmpl_switch: "Switch / Socket", tmpl_climate: "Climate", tmpl_cover: "Cover / Shutter", tmpl_media: "Media Player",
    show_state: "Show State", show_label: "Show Label", show_icon: "Show Icon", state_first: "State First", text_layout: "Text Order", primary_text: "First line", primary_state: "State / value first", primary_name: "Name first",
    height: "Height", width: "Width", align: "Align", visible: "Visible", left: "Left", center: "Center", right: "Right",
    tap_action: "Tap Action", hold_action: "Hold Action", double_tap_action: "Double Tap Action",
    act_more: "Details (Default)", act_toggle: "Toggle", act_none: "None",
    live_preview: "Live preview",
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
    humid_warn_threshold: "Feuchte-Warnschwelle (%)", high_humidity: "Hohe Luftfeuchtigkeit", device_unavailable: "Gerät nicht verfügbar",
    force_color: "Manuelle Farbe erzwingen (Immer sichtbar)", img_url: "Bild URL", image: "Bild", path: "Pfad (Tap Action)", entity: "Entität", device: "Gerät (Optional)",
    template: "Typ-Filter", add_template: "mit Filter", add_prefix: "Add",
    quick_add_title: "Schnellerfassung",
    quick_add_desc: "Schnell Buttons aus bestehenden Entitäten hinzufügen.",
    quick_add_entity_type_label: "Entitätstyp",
    quick_add_entity_label: "Entität (gefiltert)",
    quick_add_entity_type_help: "Filtert die Entitätenliste rechts.",
    quick_add_entity_help: "Wähle eine Entität dieses Typs und klicke anschließend auf ‘Hinzufügen’.",
    quick_add_entity_placeholder: "Entität auswählen ({type})",
    quick_add_empty_hint: "Keine passenden Entitäten gefunden.",
    quick_add_settings_caption: "Button-Einstellungen (für hinzugefügte Einträge)",
    expand_all: "Alle aufklappen",
    collapse_all: "Alle zuklappen",
    label_position: "Position von Label & Status",
    label_position_all: "Label & Status Position (alle Buttons)",
    use_global: "Globale Einstellung verwenden",
    pos_right: "Rechts",
    pos_bottom: "Unten",
    pos_left: "Links",
    pos_top: "Oben",
    row_type: "Zeilentyp", type_entity: "Entität", type_template: "Template",
    tmpl_content: "Text (Template)", tmpl_icon: "Icon (Template)", tmpl_color: "Farbe (Template)", tmpl_state: "Status (Template)", tmpl_preview: "Vorschau",
    tmpl_light: "Licht", tmpl_switch: "Schalter / Steckdose", tmpl_climate: "Klima", tmpl_cover: "Rollladen / Abdeckung", tmpl_media: "Media Player",
    show_state: "Status anzeigen", show_label: "Bezeichnung anzeigen", show_icon: "Icon anzeigen", state_first: "Wert zuerst", text_layout: "Text-Reihenfolge", primary_text: "Erste Zeile", primary_state: "Wert zuerst", primary_name: "Name zuerst",
    height: "Höhe", width: "Breite", align: "Ausrichtung", visible: "Sichtbar", left: "Links", center: "Mitte", right: "Rechts",
    tap_action: "Antippen", hold_action: "Gedrückt halten", double_tap_action: "Doppelklick",
    act_more: "Details (Standard)", act_toggle: "Umschalten", act_none: "Nichts",
    live_preview: "Live-Vorschau",
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
    humid_warn_threshold: "Seuil d'alerte d'humidité (%)", high_humidity: "Humidité élevée", device_unavailable: "Appareil indisponible",
    force_color: "Forcer la couleur", img_url: "URL de l'image", image: "Image", path: "Chemin (Tap Action)", entity: "Entité", device: "Appareil (Optionnel)",
    template: "Filtre de type", add_template: "avec filtre", add_prefix: "Ajouter",
    quick_add_title: "Ajout rapide",
    quick_add_desc: "Ajouter rapidement des boutons à partir d’entités existantes.",
    quick_add_entity_type_label: "Type d’entité",
    quick_add_entity_label: "Entité (filtrée)",
    quick_add_entity_type_help: "Filtre la liste des entités à droite.",
    quick_add_entity_help: "Sélectionnez une entité de ce type puis cliquez sur « Ajouter ».",
    quick_add_entity_placeholder: "Sélectionner une entité ({type})",
    quick_add_empty_hint: "Aucune entité correspondante trouvée.",
    quick_add_settings_caption: "Paramètres des boutons (pour les éléments ajoutés)",
    expand_all: "Tout développer",
    collapse_all: "Tout replier",
    label_position: "Position du libellé et de l’état",
    label_position_all: "Position du libellé et de l’état (tous les boutons)",
    use_global: "Utiliser le réglage global",
    pos_right: "Droite",
    pos_bottom: "Bas",
    pos_left: "Gauche",
    pos_top: "Haut",
    row_type: "Type de ligne", type_entity: "Entité", type_template: "Template",
    tmpl_content: "Contenu (Template)", tmpl_icon: "Icône (Template)", tmpl_color: "Couleur (Template)", tmpl_state: "État (Template)", tmpl_preview: "Aperçu",
    tmpl_light: "Lumière", tmpl_switch: "Interrupteur / Prise", tmpl_climate: "Climatisation", tmpl_cover: "Volet / Store", tmpl_media: "Lecteur multimédia",
    show_state: "Afficher l'état", show_label: "Afficher le libellé", show_icon: "Afficher l’icône", state_first: "Valeur d'abord", text_layout: "Ordre du texte", primary_text: "Première ligne", primary_state: "Valeur d’abord", primary_name: "Nom d’abord",
    height: "Hauteur", width: "Largeur", align: "Alignement", visible: "Visible", left: "Gauche", center: "Centre", right: "Droite",
    tap_action: "Appui court", hold_action: "Appui long", double_tap_action: "Double appui",
    act_more: "Détails (Défaut)", act_toggle: "Basculer", act_none: "Rien",
    live_preview: "Aperçu en direct",
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

const replaceTemplateExpressions = (str, evalExpr) => {
  let out = "";
  let i = 0;
  while (i < str.length) {
    if (str[i] === "$" && str[i + 1] === "{") {
      i += 2;
      let expr = "";
      let depth = 0;
      let inSingle = false;
      let inDouble = false;
      let inBacktick = false;
      let esc = false;
      let closed = false;
      for (; i < str.length; i++) {
        const ch = str[i];
        if (esc) {
          expr += ch;
          esc = false;
          continue;
        }
        if (ch === "\\") {
          expr += ch;
          esc = true;
          continue;
        }
        if (inSingle) {
          if (ch === "'") inSingle = false;
          expr += ch;
          continue;
        }
        if (inDouble) {
          if (ch === '"') inDouble = false;
          expr += ch;
          continue;
        }
        if (inBacktick) {
          if (ch === "`") inBacktick = false;
          expr += ch;
          continue;
        }
        if (ch === "'") { inSingle = true; expr += ch; continue; }
        if (ch === '"') { inDouble = true; expr += ch; continue; }
        if (ch === "`") { inBacktick = true; expr += ch; continue; }
        if (ch === "{") { depth++; expr += ch; continue; }
        if (ch === "}") {
          if (depth === 0) { closed = true; i++; break; }
          depth--; expr += ch; continue;
        }
        expr += ch;
      }
      if (!closed) {
        out += "${" + expr;
        break;
      }
      out += evalExpr(expr.trim());
      continue;
    }
    out += str[i];
    i++;
  }
  return out;
};

const trimStr = (v) => (typeof v === "string" ? v.trim() : v);

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

const isHeaderForceColorEnabled = (config) => {
  if (typeof config?.header_force_color === "boolean") return config.header_force_color;
  // Backward-compat: legacy header color behaved as always-forced.
  return !!trimStr(config?.color);
};

const resolveLabelPosition = (btn, config) => {
  const globalPos = config?.global_label_position ?? config?.buttons_label_position ?? "right";
  const per = btn?.label_position;
  if (!per || per === "global") return globalPos;
  return per;
};

const setAlignmentClass = (el, pos) => {
  if (!el) return;
  el.classList.remove("label-right", "label-left", "label-bottom", "label-top");
  el.classList.add(
    pos === "bottom"
      ? "label-bottom"
      : (pos === "left"
        ? "label-left"
        : (pos === "top" ? "label-top" : "label-right"))
  );
};

const applyLabelPosition = (layoutEl, pos) => {
  if (!layoutEl) return;
  // Reset layout element inline styles
  layoutEl.style.flexDirection = "";
  layoutEl.style.alignItems = "";
  layoutEl.style.justifyContent = "";
  layoutEl.style.gap = "";
  layoutEl.style.textAlign = "";
  layoutEl.style.padding = "";
  layoutEl.style.overflow = "";
  layoutEl.style.flexWrap = "";

  // Reset common child inline styles if any
  const txt = layoutEl.querySelector(".btn-txt");
  if (txt) {
    txt.style.textAlign = "";
    txt.style.alignItems = "";
    txt.style.flex = "";
    txt.style.minHeight = "";
    txt.style.maxWidth = "";
    txt.style.overflow = "";
    txt.style.whiteSpace = "";
  }
  const iconBox = layoutEl.querySelector(".icon-box");
  if (iconBox) {
    iconBox.style.flexShrink = "";
  }
  const nameEl = layoutEl.querySelector(".btn-name");
  if (nameEl) {
    nameEl.style.overflow = "";
    nameEl.style.textOverflow = "";
    nameEl.style.whiteSpace = "";
    nameEl.style.maxWidth = "";
    nameEl.style.lineHeight = "";
    nameEl.style.fontSize = "";
  }
  const stateEl = layoutEl.querySelector(".btn-state");
  if (stateEl) {
    stateEl.style.overflow = "";
    stateEl.style.textOverflow = "";
    stateEl.style.whiteSpace = "";
    stateEl.style.maxWidth = "";
    stateEl.style.lineHeight = "";
    stateEl.style.fontSize = "";
  }

  layoutEl.classList.remove("label-right", "label-left", "label-bottom", "label-top");
  setAlignmentClass(layoutEl, pos);
};

// =============================================================================
// MAIN CARD CLASS
// =============================================================================
class OneLineRoomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._quickAddOpen = false;
    this._lastStates = new Map();
    this._lastRenderMetaSig = "";
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) this.render();
    if (!this._shouldUpdateFromHass(hass)) return;
    this._updateContentState();
    this._captureStateSnapshot(hass);
  }

  setConfig(config) {
    this.config = config;
    this._configChanged = true;
    this._lastStates = new Map();
    this._lastRenderMetaSig = "";
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
        ha-card.warning-battery { outline: 2px solid var(--error-color, #d32f2f); outline-offset: -2px; }
        ha-card.warning-humidity { outline: 2px solid var(--info-color, #2196F3); outline-offset: -2px; box-shadow: 0 0 0 2px rgba(33,150,243,0.35), 0 0 12px rgba(33,150,243,0.35), 0 0 22px rgba(33,150,243,0.25); }
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
        .chip.humidity { background: #E3F2FD; color: #1976D2; }
        .controls { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; }
        .btn { position: relative; display: flex; align-items: center; gap: 10px; padding: 0 10px; border-radius: 12px; cursor: pointer; background: var(--btn-bg, var(--card-background-color, rgba(128,128,128,0.05))); border: 1px solid transparent; flex-grow: 1; flex-shrink: 1; min-width: 0; overflow: hidden; box-sizing: border-box; transition: background 0.2s; user-select: none; -webkit-user-select: none; flex-basis: var(--btn-flex-basis, auto); height: var(--btn-height, 60px); justify-content: var(--btn-justify, center); }
        .btn.label-right { flex-direction: row; align-items: center; justify-content: var(--btn-justify, center); gap: 10px; padding: 0 10px; }
        .btn.label-left { flex-direction: row-reverse; align-items: center; justify-content: var(--btn-justify, center); gap: 10px; padding: 0 10px; }
        .btn.label-bottom { flex-direction: column; justify-content: flex-start; align-items: center; gap: 1px; padding: 2px 4px; overflow: hidden; }
        .btn.label-top { flex-direction: column-reverse; justify-content: center; gap: 4px; padding: 6px 8px; overflow: hidden; }
        .btn.label-left .btn-txt { text-align: right; align-items: flex-end; }
        .btn.label-bottom .icon-box,
        .btn.label-top .icon-box { flex-shrink: 0; }
        .btn.label-bottom .icon-box { width: 28px; height: 28px; margin-top: 1px; }
        .btn.label-bottom ha-icon { --mdc-icon-size: 18px; }
        .btn.label-bottom .btn-txt,
        .btn.label-top .btn-txt { text-align: center; align-items: center; flex: 1; min-height: 0; max-width: 100%; overflow: hidden; }
        .btn.label-bottom .btn-txt { flex: 0 0 auto; min-height: 22px; max-height: 22px; gap: 1px; }
        .btn.label-bottom .btn-name,
        .btn.label-bottom .btn-state,
        .btn.label-top .btn-name,
        .btn.label-top .btn-state { font-size: 11px; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .btn.label-bottom .btn-name { font-size: 11px; line-height: 11px; }
        .btn.label-bottom .btn-state { font-size: 10px; line-height: 10px; margin-top: 0; }
        .btn:hover { background: rgba(128,128,128,0.1); border-color: rgba(128,128,128,0.2); }
        .btn:active { background: rgba(128,128,128,0.15); }
        .btn.state-unavailable { opacity: 0.56; }
        .btn.state-unavailable:hover,
        .btn.state-unavailable:active { background: var(--btn-bg, var(--card-background-color, rgba(128,128,128,0.05))); border-color: transparent; }
        .btn.state-unavailable .btn-name,
        .btn.state-unavailable .btn-state,
        .btn.state-unavailable ha-icon { color: var(--disabled-text-color, var(--secondary-text-color)); }
        .icon-box { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; background: var(--icon-bg, transparent); }
        .btn-txt { display: flex; flex-direction: column; text-align: left; overflow: hidden; min-width: 0; flex: initial; max-width: 100%; }
        .btn ha-icon { color: var(--icon-color, grey); --mdc-icon-size: 20px; }
        .btn-name { font-size: 13px; font-weight: 600; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .btn-state { font-size: 11px; color: var(--secondary-text-color); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .warn { position: absolute; top: 4px; right: 4px; color: #d32f2f; --mdc-icon-size: 16px; background: rgba(255,255,255,0.8); border-radius: 50%; padding: 1px; }
        .warn.warn-offline { color: var(--warning-color, var(--secondary-text-color)); background: var(--card-background-color, rgba(255,255,255,0.85)); }
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
    this._captureStateSnapshot(this._hass);
  }

  _hasVisibleTemplateControl() {
    const controls = Array.isArray(this.config?.controls) ? this.config.controls : [];
    return controls.some((ctrl) => !ctrl?.hide && ctrl?.type === "template");
  }

  _getRelevantEntityIds() {
    const cfg = this.config || {};
    const ids = new Set();
    const add = (id) => {
      if (typeof id === "string" && id.trim()) ids.add(id.trim());
    };
    add(cfg.entity);
    add(cfg.temp_sensor);
    add(cfg.target_temp_sensor);
    add(cfg.humid_sensor);
    (Array.isArray(cfg.window_sensors) ? cfg.window_sensors : []).forEach(add);
    (Array.isArray(cfg.battery_sensors) ? cfg.battery_sensors : []).forEach(add);
    (Array.isArray(cfg.controls) ? cfg.controls : []).forEach((ctrl) => add(ctrl?.entity));
    return Array.from(ids);
  }

  _getStateSignature(stateObj) {
    if (!stateObj) return "__missing__";
    const attrs = stateObj.attributes || {};
    const rgb = Array.isArray(attrs.rgb_color) ? attrs.rgb_color.join(",") : "";
    return [
      stateObj.state ?? "",
      attrs.current_temperature ?? "",
      attrs.temperature ?? "",
      attrs.current_humidity ?? "",
      attrs.friendly_name ?? "",
      attrs.hvac_action ?? "",
      attrs.icon ?? "",
      rgb
    ].join("|");
  }

  _getRenderMetaSignature(hass) {
    const lang = hass?.language || "";
    const tempUnit = hass?.config?.unit_system?.temperature || "";
    return `${lang}|${tempUnit}`;
  }

  _buildStateSnapshot(hass) {
    const states = hass?.states || {};
    const ids = this._getRelevantEntityIds();
    const next = new Map();
    ids.forEach((id) => next.set(id, this._getStateSignature(states[id])));
    return next;
  }

  _isSameSnapshot(nextStates, nextMetaSig) {
    if (this._lastRenderMetaSig !== nextMetaSig) return false;
    if (!this._lastStates || this._lastStates.size !== nextStates.size) return false;
    for (const [id, sig] of nextStates.entries()) {
      if (this._lastStates.get(id) !== sig) return false;
    }
    return true;
  }

  _shouldUpdateFromHass(hass) {
    if (!this.config || !this.content) return false;
    if (this._configChanged) return true;
    if (this._hasVisibleTemplateControl()) return true;
    const nextMetaSig = this._getRenderMetaSignature(hass);
    const nextStates = this._buildStateSnapshot(hass);
    return !this._isSameSnapshot(nextStates, nextMetaSig);
  }

  _captureStateSnapshot(hass) {
    if (!this.config || !hass) return;
    this._lastRenderMetaSig = this._getRenderMetaSignature(hass);
    this._lastStates = this._buildStateSnapshot(hass);
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
    // Priority: force/manual > dynamic state color > default/theme fallback.
    const headerForceColor = isHeaderForceColorEnabled(c);
    const headerColors = this._resolveEntityIconColors(effectiveEntity, h, {
      defaultColor: "",
      defaultBg: "transparent",
      forceColor: headerForceColor ? c.color : ""
    });
    if (headerColors.color) ico.style.setProperty("--icon-color", headerColors.color);
    else ico.style.removeProperty("--icon-color");

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
      if (isEntityOn(st)) al = getTranslation(h, "empty");
      else if (!isNaN(parseFloat(st.state))) {
        if (st.state <= 5) al = getTranslation(h, "critical");
        else if (st.state <= 15 && !al) al = getTranslation(h, "low");
      }
    });

    const batteryWarn = !!al;
    if (batteryWarn) ch.innerHTML += `<div class="chip alert"><ha-icon icon="mdi:battery-alert" style="--mdc-icon-size:14px"></ha-icon> ${al}</div>`;

    const humidNum = hm != null ? parseFloat(hm) : NaN;
    const thresholdRaw = c.humidity_warning_threshold ?? 60;
    const humidThreshold = Number.isFinite(Number(thresholdRaw)) ? Number(thresholdRaw) : 60;
    const humidityWarn = Number.isFinite(humidNum) && humidNum > humidThreshold;
    if (humidityWarn) {
      const txt = getTranslation(h, "high_humidity");
      ch.innerHTML += `<div class="chip humidity"><ha-icon icon="mdi:water-alert" style="--mdc-icon-size:14px"></ha-icon> ${txt}</div>`;
    }
    (Array.isArray(effectiveWindowSensors) ? effectiveWindowSensors : []).forEach(s => {
      const st = h.states[s];
      if (isEntityOn(st)) ch.innerHTML += `<div class="chip"><ha-icon icon="mdi:window-open-variant" style="--mdc-icon-size:14px"></ha-icon> ${st.attributes.friendly_name || getTranslation(h, "window")}</div>`;
    });

    const cardEl = this.shadowRoot.querySelector("ha-card");
    if (cardEl) {
      cardEl.classList.toggle("warning-battery", batteryWarn);
      cardEl.classList.toggle("warning-humidity", !batteryWarn && humidityWarn);
    }

    const visibleCtrls = (c.controls || []).filter(ctrl => !ctrl.hide && (ctrl.entity || ctrl.type === "template"));

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

  _isEntityUnavailable(entityId, hass = this._hass) {
    if (!entityId || !hass?.states) return false;
    return isEntityOffline(hass.states[entityId]);
  }

  _evalTemplateString(tpl, h, ctrl) {
    if (tpl === undefined || tpl === null) return "";
    const str = String(tpl);
    if (!str.includes("${")) return str;
    try {
      const states = h?.states || {};
      const entity = (id) => states[id];
      const attr = (id, name) => states[id]?.attributes?.[name];
      return replaceTemplateExpressions(str, (expr) => {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function("hass", "states", "entity", "attr", "ctrl", `return (${expr});`);
          const res = fn(h, states, entity, attr, ctrl);
          return res === undefined || res === null ? "" : String(res);
        } catch (err) {
          return "";
        }
      });
    } catch (err) {
      return "";
    }
  }

  _resolveTemplateCtrl(ctrl, h) {
    const content = this._evalTemplateString(ctrl.content, h, ctrl);
    const icon = trimStr(this._evalTemplateString(ctrl.icon, h, ctrl));
    const color = trimStr(this._evalTemplateString(ctrl.color, h, ctrl));
    const state = this._evalTemplateString(ctrl.state, h, ctrl);
    return { content, icon, color, state };
  }

  _resolveEntityIconColors(entityId, hass, opts = {}) {
    const defaultColor = opts.defaultColor ?? "grey";
    const defaultBg = opts.defaultBg ?? "rgba(128,128,128,0.1)";
    const forceColor = trimStr(opts.forceColor);
    const st = entityId ? hass?.states?.[entityId] : null;
    const domain = getEntityDomain(entityId);
    const isUnavailable = isEntityOffline(st);
    if (forceColor) {
      const isHex = /^#[0-9A-F]{6}$/i.test(forceColor);
      return {
        color: forceColor,
        bg: isHex ? forceColor + "33" : `color-mix(in srgb, ${forceColor} 20%, transparent)`,
        isUnavailable
      };
    }

    let color = defaultColor;
    let bg = defaultBg;

    if (st && isEntityActive(st, entityId)) {
      if (st.attributes.rgb_color) {
        const rgb = st.attributes.rgb_color.join(",");
        color = `rgb(${rgb})`;
        bg = `rgba(${rgb}, 0.2)`;
      } else if (domain === "climate" && st.attributes.hvac_action) {
        const act = st.attributes.hvac_action;
        if (act === "heating") { color = "#FF5722"; bg = "rgba(255,87,34,0.2)"; }
        else if (act === "cooling") { color = "#2196F3"; bg = "rgba(33,150,243,0.2)"; }
        else { color = "#4CAF50"; bg = "rgba(76,175,80,0.2)"; }
      } else {
        const themeVar = `var(--state-${domain}-active-color, var(--state-active-color, #ff9800))`;
        color = themeVar;
        bg = `color-mix(in srgb, ${themeVar} 20%, transparent)`;
      }
    }

    return { color, bg, isUnavailable };
  }

  _updateBtnState(btn, ctrl, h) {
    const unit = h.config.unit_system.temperature || "°C"; // --- NEW: DYNAMIC UNIT ---
    const st = ctrl.entity ? h.states[ctrl.entity] : null;
    const s = st ? st.state : "N/A";
    const domain = ctrl.entity ? ctrl.entity.split(".")[0] : "";
    const isTemplate = ctrl.type === "template";

    let typ = "default";
    if (domain === "cover") typ = "shutter";
    else if (domain === "climate") typ = "climate";
    else if (domain === "switch") typ = "socket";
    else if (domain === "light") typ = "light";

    let col = "grey", bg = "rgba(128,128,128,0.1)";
    let isUnavail = false;

    let tpl = null;
    if (isTemplate) {
      tpl = this._resolveTemplateCtrl(ctrl, h);
      if (tpl.color) {
        col = tpl.color;
        const isHex = /^#[0-9A-F]{6}$/i.test(tpl.color);
        bg = isHex ? tpl.color + "33" : `color-mix(in srgb, ${tpl.color} 20%, transparent)`;
      }
    } else {
      const resolved = this._resolveEntityIconColors(ctrl.entity, h, {
        defaultColor: "grey",
        defaultBg: "rgba(128,128,128,0.1)",
        forceColor: ctrl.force_color ? ctrl.color : ""
      });
      col = resolved.color;
      bg = resolved.bg;
      isUnavail = resolved.isUnavailable;
    }

    const nameTxt = isTemplate
      ? (tpl?.content || ctrl.name || "")
      : (ctrl.name !== undefined ? ctrl.name : "Dev");
    const unavailableText = getTranslation(h, "device_unavailable");
    let badge = "";
    if (isUnavail) badge = `<ha-icon class="warn warn-offline" icon="mdi:lan-disconnect" title="${unavailableText}"></ha-icon>`;

    // --- NEW: USE DYNAMIC UNIT IN TEMPLATE ---
    const stateText = isTemplate
      ? (tpl?.state || "")
      : (typ === "climate" && st?.attributes?.current_temperature
        ? st.attributes.current_temperature + unit
        : s);
    const showState = isTemplate ? ctrl.show_state === true : ctrl.show_state !== false;
    const showLabel = ctrl.show_label !== false;
    const stateHtml = showState ? `<span class="btn-state">${stateText}</span>` : "";
    const labelHtml = showLabel ? `<span class="btn-name">${nameTxt}</span>` : "";
    const showIcon = ctrl.show_icon !== false;
    const stateFirst = ctrl.state_first === true;
    const textHtml = stateFirst ? `${stateHtml}${labelHtml}` : `${labelHtml}${stateHtml}`;

    const per = ctrl.label_position;
    const globalPos = this.config?.global_label_position;
    const pos = resolveLabelPosition(ctrl, this.config);
    btn.dataset.lpPer = per ?? "";
    btn.dataset.lpGlobal = globalPos ?? "";
    btn.dataset.lpEff = pos ?? "";
    applyLabelPosition(btn, pos);

    const iconHtml = showIcon
      ? `<div class="icon-box">
        <ha-icon icon="${(isTemplate ? (tpl?.icon || ctrl.icon) : ctrl.icon) || "mdi:circle"}" style="--mdc-icon-size:20px"></ha-icon>
      </div>`
      : "";
    btn.innerHTML = `
      ${iconHtml}
      <div class="btn-txt">
        ${textHtml}
      </div>
      ${badge}`;

    btn.classList.toggle("state-unavailable", isUnavail);
    if (!isTemplate) {
      btn.style.cursor = isUnavail ? "default" : "pointer";
    }
    btn.setAttribute("aria-disabled", isUnavail ? "true" : "false");
    if (isUnavail) btn.title = unavailableText;
    else btn.removeAttribute("title");
    
    // Apply dynamic colors via CSS custom properties
    btn.style.setProperty("--icon-color", col);
    btn.style.setProperty("--btn-bg", bg);
  }

  _attachActions(node, ctrl) {
    if (ctrl.type === "template") {
      node.style.cursor = "default";
      return;
    }
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
      if (this._isEntityUnavailable(ctrl.entity)) return;
      held = false;
      holdTimer = setTimeout(() => { held = true; this._fireAction("hold", config); }, 500);
    });
    const cancel = () => { if (holdTimer) clearTimeout(holdTimer); };
    node.addEventListener("pointerup", cancel);
    node.addEventListener("pointerleave", cancel);
    node.addEventListener("pointercancel", cancel);
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._isEntityUnavailable(ctrl.entity)) return;
      if (held) return;
      if (config.double_tap_action.action !== "none") {
        if (timer) { clearTimeout(timer); timer = null; this._fireAction("double_tap", config); }
        else { timer = setTimeout(() => { timer = null; this._fireAction("tap", config); }, 250); }
      } else { this._fireAction("tap", config); }
    });
  }

  _fireAction(type, config) {
    if (config.entity && this._isEntityUnavailable(config.entity)) return;
    const actionKey = `${type}_action`;
    let actionConfig = config[actionKey] || {};
    if (!actionConfig || typeof actionConfig !== 'object') actionConfig = { action: 'none' };
    if (!actionConfig.action) actionConfig.action = "none";
    if (actionConfig.action === "toggle" && config.entity) {
      const domain = config.entity.split(".")[0];
      if (domain === "climate" && this._hass) {
        const state = this._hass.states[config.entity];
        if (state) {
          actionConfig = !isEntityOff(state)
            ? { action: "call-service", service: "climate.set_hvac_mode", data: { hvac_mode: STATE_DEFINITIONS.INACTIVE_STATES.off }, target: { entity_id: config.entity } }
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
    this._batteryListOpen = false;
    this._manualSensorsOpen = false;
    this._imageSectionOpen = false;
    this._controlIds = [];
    this._nextControlId = 1;
    this._livePreview = true;
    this._pendingConfig = null;
    this._boundHandlePrimarySave = (ev) => this._handlePrimarySave(ev);
  }

  connectedCallback() {
    document.addEventListener("click", this._boundHandlePrimarySave, true);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._boundHandlePrimarySave, true);
    clearTimeout(this._tm);
  }

  _ensureEditorState() {
    if (typeof this._livePreview !== "boolean") this._livePreview = true;
    if (this._pendingConfig === undefined) this._pendingConfig = null;
  }

  setConfig(config) {
    this._ensureEditorState();
    this._config = config || {};
    if (!Array.isArray(this._config.controls)) this._config = { ...this._config, controls: [] };
    this._syncControlIds();
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
    this._ensureEditorState();
    this._config = config;
    this._syncControlIds();
    if (!this._livePreview) {
      this._pendingConfig = config;
      return;
    }
    clearTimeout(this._tm);
    this._tm = setTimeout(() => {
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }, 300);
  }

  _emitConfigNow(config) {
    clearTimeout(this._tm);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  _flushPendingConfig() {
    this._ensureEditorState();
    if (!this._pendingConfig) return;
    const cfg = this._pendingConfig;
    this._pendingConfig = null;
    this._emitConfigNow(cfg);
  }

  _handlePrimarySave(ev) {
    if (this._livePreview) return;
    const path = typeof ev.composedPath === "function" ? ev.composedPath() : [ev.target];
    const dialogHost = this.closest("hui-dialog-edit-card");
    if (dialogHost && !path.includes(dialogHost)) return;
    const saveBtn = path.find((el) => el && typeof el.getAttribute === "function" && el.getAttribute("slot") === "primaryAction");
    if (!saveBtn || saveBtn.disabled) return;
    this._flushPendingConfig();
  }

  _makeControlId() {
    const id = `c${this._nextControlId}`;
    this._nextControlId += 1;
    return id;
  }

  _syncControlIds() {
    const len = Array.isArray(this._config?.controls) ? this._config.controls.length : 0;
    while (this._controlIds.length < len) this._controlIds.push(this._makeControlId());
    if (this._controlIds.length > len) this._controlIds.length = len;
  }

  _getScrollParent() {
    let el = this;
    while (el && el.parentElement) {
      const style = getComputedStyle(el);
      const oy = style.overflowY;
      if (oy === "auto" || oy === "scroll") return el;
      el = el.parentElement;
    }
    return null;
  }

  _withScrollRestore(fn) {
    const sc = this._getScrollParent();
    const top = sc ? sc.scrollTop : 0;
    fn();
    if (sc) sc.scrollTop = top;
  }

  _areAllButtonsExpanded() {
    const controls = Array.isArray(this._config?.controls) ? this._config.controls : [];
    if (controls.length === 0) return false;
    this._collapsedState = this._collapsedState || {};
    return controls.every((ctrl, i) => {
      const key = ctrl.entity || ctrl.name || ctrl.content || ctrl.device || String(i);
      return this._collapsedState[key] !== true;
    });
  }

  _toggleAllButtonsExpanded(expand) {
    const controls = Array.isArray(this._config?.controls) ? this._config.controls : [];
    this._collapsedState = this._collapsedState || {};
    controls.forEach((ctrl, i) => {
      const key = ctrl.entity || ctrl.name || ctrl.content || ctrl.device || String(i);
      this._collapsedState[key] = !expand;
    });
    this.renBtn();
    this._updateBulkToggleButton();
  }

  _updateBulkToggleButton() {
    const btn = this.shadowRoot?.getElementById("bulk-toggle");
    if (!btn) return;
    const controls = Array.isArray(this._config?.controls) ? this._config.controls : [];
    const allExpanded = controls.length > 0 && this._areAllButtonsExpanded();
    const label = getTranslation(this._hass, allExpanded ? "collapse_all" : "expand_all");
    const icon = allExpanded ? "mdi:unfold-less-vertical" : "mdi:unfold-more-vertical";
    btn.disabled = controls.length === 0;
    const ic = btn.querySelector("ha-icon");
    if (ic) ic.setAttribute("icon", icon);
    btn.setAttribute("title", label);
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

  _evalTemplateString(tpl, h, ctrl) {
    if (tpl === undefined || tpl === null) return "";
    const str = String(tpl);
    if (!str.includes("${")) return str;
    try {
      const states = h?.states || {};
      const entity = (id) => states[id];
      const attr = (id, name) => states[id]?.attributes?.[name];
      return replaceTemplateExpressions(str, (expr) => {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function("hass", "states", "entity", "attr", "ctrl", `return (${expr});`);
          const res = fn(h, states, entity, attr, ctrl);
          return res === undefined || res === null ? "" : String(res);
        } catch (err) {
          return "";
        }
      });
    } catch (err) {
      return "";
    }
  }

  _resolveTemplateCtrl(ctrl, h) {
    const content = this._evalTemplateString(ctrl.content, h, ctrl);
    const icon = trimStr(this._evalTemplateString(ctrl.icon, h, ctrl));
    const color = trimStr(this._evalTemplateString(ctrl.color, h, ctrl));
    const state = this._evalTemplateString(ctrl.state, h, ctrl);
    return { content, icon, color, state };
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
          show_state: true,
          show_label: true,
          show_icon: true
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
          show_state: true,
          show_label: true,
          show_icon: true
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
          show_state: true,
          show_label: true,
          show_icon: true
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
          show_state: true,
          show_label: true,
          show_icon: true
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
          show_state: true,
          show_label: true,
          show_icon: true
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
      show_label: defaults.show_label !== false,
      show_icon: defaults.show_icon !== false,
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
    this._ensureEditorState();
    if (!this._config) return;
    const alreadyRendered = !!this.shadowRoot.innerHTML;
    if (alreadyRendered) { this.updVal(); this.renBtn(); this._applyNavSelectorOptions(); this._ensureNavOptions(); this._updateBatteryListUI(); this._updateManualSensorsUI(); this._updateImageSectionUI(); return; }
    const h = this._hass;
    this.shadowRoot.innerHTML = `
      <style>
        .sec { padding: 12px 0; border-bottom: 1px solid var(--divider-color); }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .image-sec { border: 1px solid var(--divider-color); border-radius: 8px; background: var(--secondary-background-color); padding: 6px 10px; margin-bottom: 8px; }
        .image-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer; user-select: none; padding: 4px 0; }
        .image-title { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .image-chev { --mdc-icon-size: 18px; opacity: 0.7; transition: transform 0.15s ease; }
        .image-sec.open .image-chev { transform: rotate(90deg); }
        .image-content { margin-top: 6px; }
        .image-content[hidden] { display: none; }
        .manual-sec { border: 1px solid var(--divider-color); border-radius: 8px; background: var(--secondary-background-color); padding: 6px 10px; margin-bottom: 8px; }
        .manual-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer; user-select: none; padding: 4px 0; }
        .manual-title { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .manual-chev { --mdc-icon-size: 18px; opacity: 0.7; transition: transform 0.15s ease; }
        .manual-sec.open .manual-chev { transform: rotate(90deg); }
        .manual-content { margin-top: 6px; }
        .manual-content[hidden] { display: none; }
        .battery-sec { border: 1px solid var(--divider-color); border-radius: 8px; background: var(--secondary-background-color); padding: 6px 10px; margin-bottom: 8px; }
        .battery-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer; user-select: none; padding: 4px 0; }
        .battery-title { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .battery-chev { --mdc-icon-size: 18px; opacity: 0.7; transition: transform 0.15s ease; }
        .battery-sec.open .battery-chev { transform: rotate(90deg); }
        .battery-content { margin-top: 6px; }
        .battery-content[hidden] { display: none; }
        .tmpl-label-row { margin-bottom: 4px; }
        .tmpl-label { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .tmpl-row { align-items: start; margin-bottom: 12px; }
        .tmpl-row ha-textfield,
        .tmpl-row ha-selector,
        .tmpl-row ha-entity-picker,
        .tmpl-row ha-icon-picker { margin-bottom: 0; }
        .qa { border: 1px solid var(--divider-color); border-radius: 8px; background: var(--secondary-background-color); padding: 6px 10px; }
        .sec-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sec-head h3 { margin: 0; }
        .section-action { background: none; border: 0; cursor: pointer; padding: 4px; display: inline-flex; align-items: center; }
        .section-action[disabled] { opacity: 0.4; cursor: default; }
        .section-action ha-icon { --mdc-icon-size: 20px; }
        .qa summary { list-style: none; cursor: pointer; }
        .qa summary::-webkit-details-marker { display: none; }
        .qa-summary { display: flex; flex-direction: column; gap: 4px; }
        .qa-title { font-weight: 700; }
        .qa-desc { font-size: 12px; opacity: 0.8; }
        .qa-body { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--divider-color); }
        .quick-add-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
        .quick-add-col { display: flex; flex-direction: column; }
        .quick-add-label { font-size: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 6px; }
        .quick-add-field { min-height: 56px; display: flex; align-items: stretch; }
        .quick-add-field > ha-selector,
        .quick-add-field > ha-entity-picker { min-height: 56px; }
        .quick-add-field > ha-selector::part(form-field),
        .quick-add-field > ha-entity-picker::part(form-field) { min-height: 56px; }
        .quick-add-helper { font-size: 12px; opacity: 0.7; margin-top: 4px; }
        .qa-empty { font-size: 12px; color: var(--error-color, #db4437); margin-top: 4px; }
        .qa-caption { font-size: 12px; font-weight: 600; opacity: 0.8; margin: 6px 0 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .qa-sep { height: 12px; }
        .add-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .add-prefix { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .tmpl-preview { margin-top: 6px; font-size: 12px; opacity: 0.8; display: flex; align-items: center; gap: 6px; }
        .tmpl-details { margin-top: 8px; border-top: 1px solid var(--divider-color); padding-top: 8px; }
        .tmpl-details summary { cursor: pointer; font-weight: 600; font-size: 12px; opacity: 0.8; list-style: none; }
        .tmpl-details summary::-webkit-details-marker { display: none; }
        .box { border: 1px solid var(--divider-color); padding: 12px; border-radius: 8px; background: var(--secondary-background-color); margin-bottom: 12px; }
        .box.dragging { opacity: 0.6; }
        .box.drag-over { outline: 2px dashed var(--divider-color); outline-offset: 2px; }
        .head { display: flex; justify-content: space-between; align-items: center; font-weight: bold; cursor: pointer; }
        .head::-webkit-details-marker { display: none; }
        .head-left { display: flex; align-items: center; gap: 6px; min-width: 0; }
        .chev { transition: transform 0.15s ease; --mdc-icon-size: 18px; opacity: 0.8; }
        details[open] .chev { transform: rotate(90deg); }
        .summary-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .body { margin-top: 8px; }
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
        <div class="row" style="margin-top:8px; align-items:center">
          <ha-formfield label="${getTranslation(h, "live_preview")}">
            <ha-switch id="live-preview-toggle" checked></ha-switch>
          </ha-formfield>
        </div>
        <ha-textfield label="${getTranslation(h, "name")}" cfg="name" class="i"></ha-textfield>
        <ha-entity-picker label="${getTranslation(h, "main_climate")}" cfg="entity" class="i" include-domains='["climate"]'></ha-entity-picker>
        <div class="row" style="margin-top:8px; align-items:center">
          <ha-formfield label="${getTranslation(h, "force_color")}">
            <ha-switch id="header-force-color"></ha-switch>
          </ha-formfield>
        </div>
        <div class="row">
          <ha-icon-picker label="${getTranslation(h, "icon")}" cfg="icon" class="i"></ha-icon-picker>
          <div id="header-color-row" class="cl-row">
            <ha-textfield label="${getTranslation(h, "color")}" cfg="color" class="i"></ha-textfield>
            <input type="color" class="cp i-cp" cfg="color">
          </div>
        </div>
        <div id="image-sec" class="image-sec">
          <div id="image-head" class="image-head">
            <span id="image-title" class="image-title"></span>
            <ha-icon id="image-chev" class="image-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="image-content" class="image-content" hidden>
            <img id="prev-img" class="preview">
            <ha-textfield id="img-url-field" cfg="image" class="i" icon="mdi:image"></ha-textfield>
            <div class="upload-row">
              <input type="file" id="file-upload" class="upload-hidden" accept="image/*">
              <mwc-button id="upload-btn" raised label="${getTranslation(h, "upload_btn")}">
                <ha-icon icon="mdi:upload" slot="icon"></ha-icon>
              </mwc-button>
            </div>
          </div>
        </div>
        <ha-selector id="nav-path" label="${getTranslation(h, "path")}" style="margin-top:12px"></ha-selector>
      </div>
      <div class="sec">
        <div id="manual-sec" class="manual-sec">
          <div id="manual-head" class="manual-head">
            <span id="manual-title" class="manual-title"></span>
            <ha-icon id="manual-chev" class="manual-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="manual-content" class="manual-content" hidden>
            <ha-entity-picker label="${getTranslation(h, "temp_label")}" cfg="temp_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <ha-entity-picker label="${getTranslation(h, "target_temp_label")}" cfg="target_temp_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <ha-entity-picker label="${getTranslation(h, "humid_label")}" cfg="humid_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <ha-textfield label="${getTranslation(h, "humid_warn_threshold")}" cfg="humidity_warning_threshold" class="i" type="number"></ha-textfield>
            <ha-selector cfg="window_sensors" class="i" label="${getTranslation(h, "window_label")}"></ha-selector>
          </div>
        </div>
        <div id="battery-sec" class="battery-sec">
          <div id="battery-head" class="battery-head">
            <span id="battery-title" class="battery-title"></span>
            <ha-icon id="battery-chev" class="battery-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="battery-content" class="battery-content" hidden>
            <ha-selector cfg="battery_sensors" class="i" label="${getTranslation(h, "battery_label")}"></ha-selector>
          </div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-head">
          <h3>${getTranslation(h, "buttons")}</h3>
        </div>
        <div class="row">
          <ha-selector id="global-label-pos" label="${getTranslation(h, "label_position_all")}"></ha-selector>
        </div>
        <details id="quick-add" class="qa" ${this._quickAddOpen ? "open" : ""}>
          <summary class="qa-summary">
            <div class="qa-title">${getTranslation(h, "quick_add_title")}</div>
            <div class="qa-desc">${getTranslation(h, "quick_add_desc")}</div>
          </summary>
          <div class="qa-body">
            <div class="quick-add-grid">
              <div class="quick-add-col">
                <div class="quick-add-label">${getTranslation(h, "quick_add_entity_type_label")}</div>
                <div class="quick-add-field">
                  <ha-selector id="tmpl-select" aria-label="${getTranslation(h, "quick_add_entity_type_label")}"></ha-selector>
                </div>
                <div class="quick-add-helper">${getTranslation(h, "quick_add_entity_type_help")}</div>
              </div>
              <div class="quick-add-col">
                <div class="quick-add-label">${getTranslation(h, "quick_add_entity_label")}</div>
                <div class="quick-add-field">
                  <ha-entity-picker id="tmpl-entity" aria-label="${getTranslation(h, "quick_add_entity_label")}"></ha-entity-picker>
                </div>
                <div id="qa-empty-hint" class="qa-empty hidden">${getTranslation(h, "quick_add_empty_hint")}</div>
                <div class="quick-add-helper">${getTranslation(h, "quick_add_entity_help")}</div>
              </div>
            </div>
            <div class="add-row">
              <span class="add-prefix">${getTranslation(h, "add_prefix")}</span>
              <mwc-button id="add-template" raised label="${getTranslation(h, "add_template")}">
                <ha-icon icon="mdi:playlist-plus" slot="icon"></ha-icon>
              </mwc-button>
            </div>
          </div>
        </details>
        <div class="qa-sep"></div>
        <div class="qa-caption">
          <span>${getTranslation(h, "quick_add_settings_caption")}</span>
          <button id="bulk-toggle" class="section-action" type="button">
            <ha-icon></ha-icon>
          </button>
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
    const imageHead = this.shadowRoot.getElementById("image-head");
    if (imageHead) {
      imageHead.addEventListener("click", () => {
        this._imageSectionOpen = !this._imageSectionOpen;
        this._updateImageSectionUI();
      });
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
        if (k === "humidity_warning_threshold") {
          const raw = v ?? "";
          const num = raw === "" ? 60 : Number(raw);
          c[k] = Number.isFinite(num) ? num : 60;
          if (e.value !== String(c[k])) e.value = String(c[k]);
        } else {
          c[k] = v;
        }
        this._fire(c);
        if (k === "color") this.updCp();
        if (k === "image") this.updPreview();
      });
    });
    const manualHead = this.shadowRoot.getElementById("manual-head");
    if (manualHead) {
      manualHead.addEventListener("click", () => {
        this._manualSensorsOpen = !this._manualSensorsOpen;
        this._updateManualSensorsUI();
      });
    }
    const batteryHead = this.shadowRoot.getElementById("battery-head");
    if (batteryHead) {
      batteryHead.addEventListener("click", () => {
        this._batteryListOpen = !this._batteryListOpen;
        this._updateBatteryListUI();
      });
    }
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
    const livePreviewToggle = this.shadowRoot.getElementById("live-preview-toggle");
    if (livePreviewToggle) {
      livePreviewToggle.checked = this._livePreview !== false;
      livePreviewToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const enabled = ev.target.checked !== false;
        const wasEnabled = this._livePreview !== false;
        this._livePreview = enabled;
        if (enabled && !wasEnabled) this._flushPendingConfig();
      });
    }
    const headerForceToggle = this.shadowRoot.getElementById("header-force-color");
    const headerColorRow = this.shadowRoot.getElementById("header-color-row");
    const updateHeaderColorUi = () => {
      if (!headerForceToggle) return;
      const enabled = headerForceToggle.checked === true;
      if (headerColorRow) headerColorRow.classList.toggle("hidden", !enabled);
    };
    if (headerForceToggle) {
      headerForceToggle.checked = isHeaderForceColorEnabled(this._config);
      updateHeaderColorUi();
      headerForceToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const enabled = ev.target.checked === true;
        this._fire({ ...this._config, header_force_color: enabled });
        updateHeaderColorUi();
      });
    }
    this._applyNavSelectorOptions();
    this._ensureNavOptions();

    const tmplSelect = this.shadowRoot.getElementById("tmpl-select");
    const tmplEntity = this.shadowRoot.getElementById("tmpl-entity");
    const globalLabelPos = this.shadowRoot.getElementById("global-label-pos");
    const quickAdd = this.shadowRoot.getElementById("quick-add");
    if (quickAdd) {
      quickAdd.open = this._quickAddOpen === true;
      quickAdd.addEventListener("toggle", () => { this._quickAddOpen = quickAdd.open; });
    }
    if (globalLabelPos) {
      globalLabelPos.hass = h;
      globalLabelPos.selector = { select: { mode: "dropdown", options: [
        { value: "right", label: getTranslation(h, "pos_right") },
        { value: "bottom", label: getTranslation(h, "pos_bottom") },
        { value: "top", label: getTranslation(h, "pos_top") },
        { value: "left", label: getTranslation(h, "pos_left") }
      ] } };
      globalLabelPos.value = this._config?.global_label_position ?? this._config?.buttons_label_position ?? "right";
      globalLabelPos.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const v = ev.detail?.value ?? "right";
        this._fire({ ...this._config, global_label_position: v });
        this.renBtn();
      });
    }
    const updateQuickAddHints = () => {
      if (!tmplSelect || !tmplEntity) return;
      const template = this._getTemplateById(tmplSelect.value || "light");
      const label = template?.label || "";
      const placeholder = getTranslation(h, "quick_add_entity_placeholder").replace("{type}", label || "");
      tmplEntity.placeholder = placeholder;
      tmplEntity.setAttribute("placeholder", placeholder);
      const domains = template?.domains || [];
      let hasMatch = true;
      if (domains.length > 0 && this._hass?.states) {
        hasMatch = Object.keys(this._hass.states).some((id) => domains.includes(id.split(".")[0]));
      }
      const emptyHint = this.shadowRoot.getElementById("qa-empty-hint");
      if (emptyHint) emptyHint.classList.toggle("hidden", hasMatch);
    };
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
        if (tmplEntity) tmplEntity.value = "";
        updateQuickAddHints();
      });
    }
    if (tmplEntity && this._hass) tmplEntity.hass = this._hass;
    if (tmplEntity && tmplSelect) {
      const template = this._getTemplateById(tmplSelect.value || "light");
      const domains = template?.domains || [];
      if (domains.length > 0) tmplEntity.setAttribute("include-domains", JSON.stringify(domains));
      updateQuickAddHints();
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
        this._updateBulkToggleButton();
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
      this._updateBulkToggleButton();
    });
    const bulkToggle = this.shadowRoot.getElementById("bulk-toggle");
    if (bulkToggle) {
      bulkToggle.addEventListener("click", () => {
        const allExpanded = this._areAllButtonsExpanded();
        this._toggleAllButtonsExpanded(!allExpanded);
      });
    }
    this._updateBulkToggleButton();
    this.updVal(); this.updCp(); this.renBtn(); this.updPreview();
    this._updateBatteryListUI();
    this._updateManualSensorsUI();
    this._updateImageSectionUI();
  }

  _updateImageSectionUI() {
    const sec = this.shadowRoot?.getElementById("image-sec");
    const content = this.shadowRoot?.getElementById("image-content");
    const title = this.shadowRoot?.getElementById("image-title");
    if (!sec || !content || !title) return;
    title.textContent = getTranslation(this._hass, "image");
    sec.classList.toggle("open", this._imageSectionOpen);
    content.hidden = !this._imageSectionOpen;
  }

  _updateManualSensorsUI() {
    const sec = this.shadowRoot?.getElementById("manual-sec");
    const content = this.shadowRoot?.getElementById("manual-content");
    const title = this.shadowRoot?.getElementById("manual-title");
    if (!sec || !content || !title) return;
    const c = this._config || {};
    const count = [
      c.temp_sensor,
      c.target_temp_sensor,
      c.humid_sensor,
      ...(Array.isArray(c.window_sensors) ? c.window_sensors : [])
    ].filter((v) => v && String(v).trim() !== "").length;
    const label = getTranslation(this._hass, "sensors_manual");
    title.textContent = count > 0 ? `${label} (${count})` : label;
    sec.classList.toggle("open", this._manualSensorsOpen);
    content.hidden = !this._manualSensorsOpen;
  }

  _updateBatteryListUI() {
    const sec = this.shadowRoot?.getElementById("battery-sec");
    const content = this.shadowRoot?.getElementById("battery-content");
    const title = this.shadowRoot?.getElementById("battery-title");
    if (!sec || !content || !title) return;
    const items = Array.isArray(this._config?.battery_sensors) ? this._config.battery_sensors : [];
    const count = items.length;
    const label = getTranslation(this._hass, "battery_label");
    title.textContent = count > 0 ? `${label} (${count})` : label;
    sec.classList.toggle("open", this._batteryListOpen);
    content.hidden = !this._batteryListOpen;
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
    const h = this._hass;
    this._syncControlIds();
    this._withScrollRestore(() => {
      div.replaceChildren();
    const actOpts = [
      { value: "more-info", label: getTranslation(h, "act_more") },
      { value: "toggle", label: getTranslation(h, "act_toggle") },
      { value: "none", label: getTranslation(h, "act_none") }
    ];
    this._config.controls.forEach((ctrl, i) => {
      const box = document.createElement("details"); box.className = "box";
      const isTemplate = ctrl.type === "template";
      const hideEntity = isTemplate ? "hidden" : "";
      const showTemplate = isTemplate ? "" : "hidden";
      const hideColor = !ctrl.force_color ? "hidden" : "";
      const showNav = ctrl.tap_action?.action === "navigate" ? "" : "hidden";
      const key = this._controlIds[i] || this._makeControlId();
      this._controlIds[i] = key;
      this._collapsedState = this._collapsedState || {};
      if (this._collapsedState[key] === undefined) this._collapsedState[key] = true;
      box.open = this._collapsedState[key] !== true;
      box.addEventListener("toggle", () => { this._collapsedState[key] = !box.open; this._updateBulkToggleButton(); });
      const summaryText = ctrl.name || ctrl.entity || (isTemplate ? (ctrl.content || "Template") : "Button");
      box.innerHTML = `
        <summary class="head">
          <span class="head-left"><ha-icon class="chev" icon="mdi:chevron-right"></ha-icon><span class="summary-text">#${i + 1} — ${summaryText}</span></span>
          <div><ha-icon class="mv u" icon="mdi:arrow-up"></ha-icon><ha-icon class="mv d" icon="mdi:arrow-down"></ha-icon><ha-icon class="del" icon="mdi:delete" style="color:#d32f2f"></ha-icon></div>
        </summary>
        <div class="body">
        <div class="row">
          <ha-selector class="rt" label="${getTranslation(h, "row_type")}"></ha-selector>
        </div>
        <div class="entity-only ${hideEntity}">
          <div class="dv-wrap"></div>
          <ha-entity-picker class="ep" label="${getTranslation(h, "entity")}"></ha-entity-picker>
          <div class="row"><ha-textfield class="nm" label="${getTranslation(h, "name")}"></ha-textfield><ha-icon-picker class="ic" label="${getTranslation(h, "icon")}"></ha-icon-picker></div>
          <div class="row"><ha-selector class="ht" label="${getTranslation(h, "height")}"></ha-selector><ha-selector class="wd" label="${getTranslation(h, "width")}"></ha-selector></div>
          <div class="row" style="margin-top:8px; align-items:center"><ha-formfield label="${getTranslation(h, "force_color")}"><ha-switch class="fc"></ha-switch></ha-formfield></div>
          <div class="cl-row ${hideColor}"><ha-textfield class="cl" label="${getTranslation(h, "color")}"></ha-textfield><input type="color" class="cp cl-p"></div>
        </div>
        <details class="tmpl-only tmpl-details ${showTemplate}" ${isTemplate ? "open" : ""}>
          <summary>${getTranslation(h, "type_template")}</summary>
          <ha-textfield class="tc" label="${getTranslation(h, "tmpl_content")}"></ha-textfield>
          <div class="row"><ha-textfield class="ti" label="${getTranslation(h, "tmpl_icon")}"></ha-textfield><ha-textfield class="tcl" label="${getTranslation(h, "tmpl_color")}"></ha-textfield></div>
          <ha-textfield class="ts" label="${getTranslation(h, "tmpl_state")}"></ha-textfield>
          <div class="tmpl-preview"><span>${getTranslation(h, "tmpl_preview")}:</span> <ha-icon class="tp-ic"></ha-icon> <span class="tp-tx"></span></div>
        </details>
        <div class="row" style="margin-top:8px; align-items:center"><ha-selector class="al" label="${getTranslation(h, "align")}"></ha-selector><ha-selector class="lp" label="${getTranslation(h, "label_position")}"></ha-selector><ha-selector class="tl" label="${getTranslation(h, "text_layout")}"></ha-selector><ha-formfield label="${getTranslation(h, "show_state")}"><ha-switch class="ss" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_label")}"><ha-switch class="sl" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_icon")}"><ha-switch class="si" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "visible")}"><ha-switch class="hd" checked></ha-switch></ha-formfield></div>
        <div class="entity-only ${hideEntity}" style="margin-top:12px; border-top:1px solid var(--divider-color); padding-top:12px"><ha-selector class="tap" label="${getTranslation(h, "tap_action")}"></ha-selector><ha-textfield class="tap-nav ${showNav}" label="Nav Pfad"></ha-textfield><ha-selector class="hold" label="${getTranslation(h, "hold_action")}"></ha-selector><ha-selector class="dbl" label="${getTranslation(h, "double_tap_action")}"></ha-selector></div>
        </div>`;

      const head = box.querySelector(".head");
      if (head) {
        head.setAttribute("draggable", "true");
        head.addEventListener("dragstart", (e) => {
          this._dragIndex = i;
          box.classList.add("dragging");
          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(i));
          }
        });
        head.addEventListener("dragend", () => {
          this._dragIndex = null;
          box.classList.remove("dragging");
          div.querySelectorAll(".box.drag-over").forEach((el) => el.classList.remove("drag-over"));
        });
      }
      box.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (this._dragIndex === i) return;
        box.classList.add("drag-over");
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      });
      box.addEventListener("dragleave", () => {
        box.classList.remove("drag-over");
      });
      box.addEventListener("drop", (e) => {
        e.preventDefault();
        box.classList.remove("drag-over");
        const from = Number.isInteger(this._dragIndex) ? this._dragIndex : parseInt(e.dataTransfer?.getData("text/plain") || "", 10);
        const to = i;
        if (!Number.isInteger(from) || from === to) return;
        const c = [...this._config.controls];
        const [moved] = c.splice(from, 1);
        c.splice(to, 0, moved);
        const ids = [...this._controlIds];
        const [movedId] = ids.splice(from, 1);
        ids.splice(to, 0, movedId);
        this._controlIds = ids;
        this._fire({ ...this._config, controls: c });
        this.renBtn();
      });

      const keepOpen = () => { this._collapsedState[key] = false; };
      const upd = (k, v) => { keepOpen(); const c = [...this._config.controls]; c[i] = { ...c[i], [k]: v }; this._fire({ ...this._config, controls: c }); };
      const updAct = (type, val) => { keepOpen(); const c = [...this._config.controls]; const old = c[i][type] || {}; c[i] = { ...c[i], [type]: { ...old, action: val } }; this._fire({ ...this._config, controls: c }); this.renBtn(); };
      box.querySelector(".u").onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (i > 0) { const c = [...this._config.controls];[c[i], c[i - 1]] = [c[i - 1], c[i]]; this._fire({ ...this._config, controls: c }); this.renBtn(); } };
      box.querySelector(".d").onclick = (e) => { e.preventDefault(); e.stopPropagation(); if (i < this._config.controls.length - 1) { const c = [...this._config.controls];[c[i], c[i + 1]] = [c[i + 1], c[i]]; this._fire({ ...this._config, controls: c }); this.renBtn(); } };
      box.querySelector(".u").onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (i > 0) {
          const c = [...this._config.controls];
          [c[i], c[i - 1]] = [c[i - 1], c[i]];
          const ids = [...this._controlIds];
          [ids[i], ids[i - 1]] = [ids[i - 1], ids[i]];
          this._controlIds = ids;
          this._fire({ ...this._config, controls: c });
          this.renBtn();
        }
      };
      box.querySelector(".d").onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (i < this._config.controls.length - 1) {
          const c = [...this._config.controls];
          [c[i], c[i + 1]] = [c[i + 1], c[i]];
          const ids = [...this._controlIds];
          [ids[i], ids[i + 1]] = [ids[i + 1], ids[i]];
          this._controlIds = ids;
          this._fire({ ...this._config, controls: c });
          this.renBtn();
        }
      };
      box.querySelector(".del").onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        const c = [...this._config.controls];
        c.splice(i, 1);
        this._controlIds.splice(i, 1);
        this._fire({ ...this._config, controls: c });
        this.renBtn();
        this._updateBulkToggleButton();
      };
      const rt = box.querySelector(".rt");
      if (rt) {
        rt.hass = h;
        rt.selector = { select: { mode: "dropdown", options: [
          { value: "entity", label: getTranslation(h, "type_entity") },
          { value: "template", label: getTranslation(h, "type_template") }
        ] } };
        rt.value = isTemplate ? "template" : "entity";
        rt.addEventListener("value-changed", e => {
          e.stopPropagation();
          const val = e.detail?.value;
          const c = [...this._config.controls];
          const next = { ...c[i] };
          if (val === "template") {
            next.type = "template";
            next.tap_action = { action: "none" };
            next.hold_action = { action: "none" };
            next.double_tap_action = { action: "none" };
          } else {
            delete next.type;
          }
          c[i] = next; this._fire({ ...this._config, controls: c }); this.renBtn();
        });
      }
      const ep = box.querySelector(".ep"); if (ep) { ep.hass = h; ep.value = ctrl.entity; ep.addEventListener("value-changed", e => {
        const val = e.detail.value; const st = h.states[val]; const c = [...this._config.controls]; let changes = { entity: val };
        if (st?.attributes?.icon) changes.icon = st.attributes.icon; else changes.icon = this._iconForEntity(val);
        if (st?.attributes?.friendly_name) changes.name = st.attributes.friendly_name;
        keepOpen(); c[i] = { ...c[i], ...changes }; this._fire({ ...this._config, controls: c }); this.renBtn();
      }); }
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
          keepOpen(); c[i] = next; this._fire({ ...this._config, controls: c }); this.renBtn();
        });
        dvWrap.appendChild(dv);
      }
      const nm = box.querySelector(".nm"); if (nm) { nm.value = ctrl.name || ""; nm.addEventListener("change", e => upd("name", e.target.value)); }
      const fc = box.querySelector(".fc"); if (fc) { fc.checked = ctrl.force_color === true; fc.addEventListener("change", e => { upd("force_color", e.target.checked); this.renBtn(); }); }
      const cl = box.querySelector(".cl"); if (cl) { cl.value = ctrl.color || ""; cl.addEventListener("change", e => upd("color", e.target.value)); }
      const clp = box.querySelector(".cl-p"); if (clp) { clp.value = ctrl.color || "#000000"; clp.addEventListener("change", e => upd("color", e.target.value)); }
      const ic = box.querySelector(".ic"); if (ic) { ic.value = ctrl.icon || ""; ic.addEventListener("value-changed", e => { e.stopPropagation(); upd("icon", e.detail.value); }); }
      const tc = box.querySelector(".tc"); if (tc) { tc.value = ctrl.content || ""; tc.addEventListener("change", e => { upd("content", e.target.value); this.renBtn(); }); }
      const ti = box.querySelector(".ti"); if (ti) { ti.value = ctrl.icon || ""; ti.addEventListener("change", e => { upd("icon", e.target.value); this.renBtn(); }); }
      const tcl = box.querySelector(".tcl"); if (tcl) { tcl.value = ctrl.color || ""; tcl.addEventListener("change", e => { upd("color", e.target.value); this.renBtn(); }); }
      const ts = box.querySelector(".ts"); if (ts) { ts.value = ctrl.state || ""; ts.addEventListener("change", e => { upd("state", e.target.value); this.renBtn(); }); }
      const ht = box.querySelector(".ht"); ht.hass = h; ht.selector = { number: { min: 40, max: 250, mode: "box", unit_of_measurement: "px" } };
      ht.value = ctrl.height || 60; ht.addEventListener("value-changed", e => { e.stopPropagation(); upd("height", Number(e.detail.value)); });
      const wd = box.querySelector(".wd"); wd.hass = h; wd.selector = { select: { mode: "dropdown", options: [{ value: "60", label: "1/1" }, { value: "40", label: "2/3" }, { value: "30", label: "1/2" }, { value: "20", label: "1/3" }, { value: "15", label: "1/4" }, { value: "12", label: "1/5" }, { value: "10", label: "1/6" }] } };
      wd.value = String(ctrl.width || 15); wd.addEventListener("value-changed", e => { e.stopPropagation(); upd("width", parseInt(e.detail.value)); });
      const al = box.querySelector(".al"); al.hass = h; al.selector = { select: { mode: "dropdown", options: [{ value: "left", label: getTranslation(h, "left") }, { value: "center", label: getTranslation(h, "center") }, { value: "right", label: getTranslation(h, "right") }] } };
      al.value = ctrl.align || "center"; al.addEventListener("value-changed", e => { e.stopPropagation(); upd("align", e.detail.value); });
      const lp = box.querySelector(".lp"); if (lp) {
        lp.hass = h;
        lp.selector = { select: { mode: "dropdown", options: [
          { value: "global", label: getTranslation(h, "use_global") },
          { value: "right", label: getTranslation(h, "pos_right") },
          { value: "bottom", label: getTranslation(h, "pos_bottom") },
          { value: "top", label: getTranslation(h, "pos_top") },
          { value: "left", label: getTranslation(h, "pos_left") }
        ] } };
        lp.value = ctrl.label_position || "global";
        lp.addEventListener("value-changed", e => { e.stopPropagation(); upd("label_position", e.detail.value || "global"); this.renBtn(); });
      }
      const tl = box.querySelector(".tl"); if (tl) {
        tl.hass = h;
        tl.selector = { select: { mode: "dropdown", options: [
          { value: "state", label: getTranslation(h, "primary_state") },
          { value: "name", label: getTranslation(h, "primary_name") }
        ] } };
        tl.value = ctrl.state_first === true ? "state" : "name";
        tl.addEventListener("value-changed", e => { e.stopPropagation(); upd("state_first", e.detail.value === "state"); });
      }
      const ss = box.querySelector(".ss"); ss.checked = ctrl.show_state !== false; ss.addEventListener("change", e => { e.stopPropagation(); upd("show_state", e.target.checked); });
      const sl = box.querySelector(".sl"); sl.checked = ctrl.show_label !== false; sl.addEventListener("change", e => { e.stopPropagation(); upd("show_label", e.target.checked); });
      const si = box.querySelector(".si"); si.checked = ctrl.show_icon !== false; si.addEventListener("change", e => { e.stopPropagation(); upd("show_icon", e.target.checked); });
      const hd = box.querySelector(".hd"); hd.checked = !ctrl.hide; hd.addEventListener("change", e => { e.stopPropagation(); upd("hide", !e.target.checked); });
      const tap = box.querySelector(".tap"); if (tap) { tap.hass = h; tap.selector = { select: { mode: "dropdown", options: actOpts } };
      tap.value = ctrl.tap_action?.action || "more-info"; tap.addEventListener("value-changed", e => { e.stopPropagation(); updAct("tap_action", e.detail.value); }); }
      const tapNav = box.querySelector(".tap-nav"); if (tapNav) {
        tapNav.value = ctrl.tap_action?.navigation_path || ""; tapNav.addEventListener("change", e => {
          const c = [...this._config.controls];
          const action = e.target.value ? { action: "navigate", navigation_path: e.target.value } : { action: "more-info" };
          c[i] = { ...c[i], tap_action: action };
          this._fire({ ...this._config, controls: c });
        });
      }
      const hold = box.querySelector(".hold"); if (hold) { hold.hass = h; hold.selector = { select: { mode: "dropdown", options: actOpts } };
      hold.value = ctrl.hold_action?.action || "toggle"; hold.addEventListener("value-changed", e => { e.stopPropagation(); updAct("hold_action", e.detail.value); }); }
      const dbl = box.querySelector(".dbl"); if (dbl) { dbl.hass = h; dbl.selector = { select: { mode: "dropdown", options: actOpts } };
      dbl.value = ctrl.double_tap_action?.action || "none"; dbl.addEventListener("value-changed", e => { e.stopPropagation(); updAct("double_tap_action", e.detail.value); }); }
      const tpIcon = box.querySelector(".tp-ic");
      const tpText = box.querySelector(".tp-tx");
      if (tpIcon && tpText && isTemplate) {
        const prev = this._resolveTemplateCtrl(ctrl, h);
        tpIcon.icon = prev.icon || "mdi:circle";
        if (prev.color) tpIcon.style.setProperty("--icon-color", prev.color);
        const previewText = [prev.content || "—", prev.state || ""].filter(Boolean).join(" | ");
        tpText.textContent = previewText || "—";
      }
      div.appendChild(box);
    });
    });
  }

  updVal() {
    if (!this._config) return;
    this.shadowRoot.querySelectorAll(".i").forEach(e => {
      const k = e.getAttribute("cfg");
      let v = k === "nav_path" ? this._config.tap_action?.navigation_path || "" : this._config[k] ?? "";
      if (k === "humidity_warning_threshold") v = this._config[k] ?? 60;
      if (e.value !== v) e.value = v;
    });
    const nav = this.shadowRoot.getElementById("nav-path");
    if (nav && nav.value !== (this._config.tap_action?.navigation_path || "")) {
      nav.value = this._config.tap_action?.navigation_path || "";
    }
    const livePreviewToggle = this.shadowRoot.getElementById("live-preview-toggle");
    if (livePreviewToggle && livePreviewToggle.checked !== (this._livePreview !== false)) {
      livePreviewToggle.checked = this._livePreview !== false;
    }
    const headerForceToggle = this.shadowRoot.getElementById("header-force-color");
    const headerColorRow = this.shadowRoot.getElementById("header-color-row");
    const headerForceEnabled = isHeaderForceColorEnabled(this._config);
    if (headerForceToggle && headerForceToggle.checked !== headerForceEnabled) {
      headerForceToggle.checked = headerForceEnabled;
    }
    if (headerColorRow) {
      headerColorRow.classList.toggle("hidden", !headerForceEnabled);
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
  const methods = ["render", "updVal", "updCp", "renBtn", "setConfig", "_fire", "_handleUpload", "updPreview", "connectedCallback", "disconnectedCallback", "_ensureEditorState", "_emitConfigNow", "_flushPendingConfig", "_handlePrimarySave"];
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
