const VERSION = "1.2.4";
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
    show_name: "Show Title", header_badges: "Extra Header Info", badge_add: "Add Info Entry", badge_label: "Label (optional)", badge_background: "Background (rgba)", standard_badge_background: "Main Climate Badge Background (rgba)",
    migration_title: "Action Required",
    migration_text: "Card renamed to <b>oneline-room-card</b> to avoid conflicts.<br>Please change <code>type: custom:room-card</code> to <code>type: custom:oneline-room-card</code> in your YAML.",
    control_mode: "Control Mode", ctrl_default: "Default", ctrl_slider: "Inline Slider", ctrl_buttons: "Inline Buttons (Cover)",
    collapsible: "Collapsible", default_state: "Default State", state_expanded: "Expanded", state_collapsed: "Collapsed",
    header_height: "Header Height (px)",
    typography: "Header Typography", name_font: "Room Name Font", info_font: "Info Line Font",
    font_size: "Size (px)", font_weight: "Weight", font_style: "Style", font_color: "Color", badge_bg: "Badge Background",
    card_behavior: "Card Behavior", header: "Header", configuration: "Configuration",
    color_map: "State Colors", color_map_add: "Add State Color", color_map_state: "State",
    window_always_show: "Always Show (incl. closed)", window_open_color: "Open Color", window_closed_color: "Closed Color",
    sensors: "Sensors",
    icon_size: "Icon Size", global_icon_size: "Global Icon Size (px)",
    header_info_offset: "Info Line Position",
    header_name_offset: "Title Position",
    header_sync_offsets: "Synchronize Positions",
    global_button_bg: "Global Button Background",
    button_bg: "Button Background"
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
    show_name: "Titel anzeigen", header_badges: "Zusätzliche Header-Info", badge_add: "Info-Eintrag hinzufügen", badge_label: "Bezeichnung (optional)", badge_background: "Hintergrund (rgba)", standard_badge_background: "Hauptklima-Badge-Hintergrund (rgba)",
    migration_title: "Handlung erforderlich",
    migration_text: "Karte wurde in <b>oneline-room-card</b> umbenannt.<br>Bitte ändere <code>type: custom:room-card</code> zu <code>type: custom:oneline-room-card</code> in deiner YAML-Konfiguration.",
    control_mode: "Steuerungsmodus", ctrl_default: "Standard", ctrl_slider: "Inline-Slider", ctrl_buttons: "Inline-Buttons (Rollladen)",
    collapsible: "Einklappbar", default_state: "Standardzustand", state_expanded: "Ausgeklappt", state_collapsed: "Eingeklappt",
    header_height: "Kopfzeilenhöhe (px)",
    typography: "Header Typografie", name_font: "Raumname Schrift", info_font: "Info-Zeile Schrift",
    font_size: "Größe (px)", font_weight: "Gewicht", font_style: "Stil", font_color: "Farbe", badge_bg: "Badge Hintergrund",
    card_behavior: "Kartenverhalten", header: "Header", configuration: "Konfiguration",
    color_map: "Zustandsfarben", color_map_add: "Farbe hinzufügen", color_map_state: "Zustand",
    window_always_show: "Immer anzeigen (auch geschlossen)", window_open_color: "Farbe geöffnet", window_closed_color: "Farbe geschlossen",
    sensors: "Sensoren",
    icon_size: "Icon-Größe", global_icon_size: "Globale Icon-Größe (px)",
    header_info_offset: "Info-Zeile Position",
    header_name_offset: "Titel Position",
    header_sync_offsets: "Synchron Bewegen",
    global_button_bg: "Globaler Button Hintergrund",
    button_bg: "Button Hintergrund"
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
    show_name: "Afficher le titre", header_badges: "Infos d'en-tête supplémentaires", badge_add: "Ajouter une entrée", badge_label: "Libellé (optionnel)", badge_background: "Arrière-plan (rgba)", standard_badge_background: "Fond du badge climat principal (rgba)",
    migration_title: "Action requise",
    migration_text: "Carte renommée en <b>oneline-room-card</b> pour éviter les conflits.<br>Veuillez changer <code>type: custom:room-card</code> en <code>type: custom:oneline-room-card</code>.",
    control_mode: "Mode de contrôle", ctrl_default: "Défaut", ctrl_slider: "Curseur intégré", ctrl_buttons: "Boutons intégrés (Volet)",
    collapsible: "Rétractable", default_state: "État par défaut", state_expanded: "Déplié", state_collapsed: "Replié",
    header_height: "Hauteur de l'en-tête (px)",
    typography: "Typographie de l'en-tête", name_font: "Police du nom", info_font: "Police des infos",
    font_size: "Taille (px)", font_weight: "Poids", font_style: "Style", font_color: "Couleur", badge_bg: "Fond du badge",
    card_behavior: "Comportement de la carte", header: "En-tête", configuration: "Configuration",
    color_map: "Couleurs par état", color_map_add: "Ajouter couleur", color_map_state: "État",
    window_always_show: "Toujours afficher (incl. fermé)", window_open_color: "Couleur ouvert", window_closed_color: "Couleur fermé",
    sensors: "Capteurs",
    icon_size: "Taille icône", global_icon_size: "Taille icône globale (px)",
    header_info_offset: "Position ligne info",
    header_name_offset: "Position titre",
    header_sync_offsets: "Synchroniser les positions",
    global_button_bg: "Fond du bouton global",
    button_bg: "Fond du bouton"
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

const hexToRgba = (hex, alpha = 0.35) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(trimStr(hex) || "");
  if (!m) return "";
  const raw = m[1];
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const parseColorToPickerHex = (color) => {
  const value = trimStr(color) || "";
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) return `#${hex[1]}`;
  const rgba = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:\d*\.?\d+))?\s*\)$/i.exec(value);
  if (!rgba) return "#000000";
  const clamp = (n) => Math.max(0, Math.min(255, Number(n) || 0)).toString(16).padStart(2, "0");
  return `#${clamp(rgba[1])}${clamp(rgba[2])}${clamp(rgba[3])}`;
};

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
  light:         { on: "mdi:lightbulb",              off: "mdi:lightbulb-outline" },
  switch:        { on: "mdi:toggle-switch",           off: "mdi:toggle-switch-off-outline" },
  input_boolean: { on: "mdi:toggle-switch",           off: "mdi:toggle-switch-off-outline" },
  fan:           { on: "mdi:fan",                     off: "mdi:fan-off" },
  lock:          { locked: "mdi:lock",                unlocked: "mdi:lock-open-outline" },
  cover: {
    open: "mdi:window-shutter-open",    closed: "mdi:window-shutter",
    opening: "mdi:window-shutter-open", closing: "mdi:window-shutter"
  },
  media_player:  { playing: "mdi:cast-connected", paused: "mdi:cast-connected", idle: "mdi:cast", off: "mdi:cast-off" },
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

const evalTemplateString = (tpl, h, ctrl) => {
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
};

const resolveTemplateCtrl = (ctrl, h) => {
  const content = evalTemplateString(ctrl.content, h, ctrl);
  const icon = trimStr(evalTemplateString(ctrl.icon, h, ctrl));
  const color = trimStr(evalTemplateString(ctrl.color, h, ctrl));
  const state = evalTemplateString(ctrl.state, h, ctrl);
  return { content, icon, color, state };
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
    this._cachedEntityIds = null;
    this._activeTimers = new Set();
  }

  disconnectedCallback() {
    this._activeTimers.forEach(clearTimeout);
    this._activeTimers.clear();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) this.render();
    if (!this._shouldUpdateFromHass(hass)) return;
    this._updateContentState();
    this._captureStateSnapshot(hass);
  }

  setConfig(config) {
    const prevKey = this._collapseKey;
    this.config = config;
    this._collapseKey = `oneline-room-card-collapsed:${config.name || config.entity || ""}`;
    if (this._collapseKey !== prevKey) {
      const stored = localStorage.getItem(this._collapseKey);
      this._collapsed = stored !== null ? stored === "1" : config.default_state === "collapsed";
    }
    this._configChanged = true;
    this._lastStates = new Map();
    this._lastRenderMetaSig = "";
    this._cachedEntityIds = null;
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
        .overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 12px; box-sizing: border-box; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); display: flex; align-items: center; gap: 12px; }
        .text { display: flex; flex: 1; min-width: 0; flex-direction: column; align-items: flex-start; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
        ha-icon { color: var(--icon-color, white); }
        .primary { display: block; max-width: 100%; font-weight: var(--rc-header-name-weight, bold); font-size: var(--rc-header-name-size, 14px); font-style: var(--rc-header-name-style, normal); color: var(--rc-header-name-color, white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .secondary { max-width: 100%; min-width: 0; font-weight: var(--rc-header-info-weight, normal); font-size: var(--rc-header-info-size, 12px); font-style: var(--rc-header-info-style, normal); color: var(--rc-header-info-color, white); opacity: 0.9; display: flex; flex-wrap: nowrap; gap: 6px; align-items: center; overflow: hidden; }
        .info-item { display: inline-flex; align-items: center; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .info-item.badge { padding: 2px 6px; border-radius: 999px; }
        .chips { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 2; }
        .chip { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; background: #FFF8E1; color: #FFA000; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .chip.alert { background: #FFEBEE; color: #D32F2F; }
        .chip.humidity { background: #E3F2FD; color: #1976D2; }
        .chip.info { background: #E3F2FD; color: #1976D2; }
        .chip.custom { background: var(--chip-bg); color: var(--chip-color); }
        .controls { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; }
        .btn { position: relative; display: flex; align-items: center; gap: 10px; padding: 0 10px; border-radius: 12px; cursor: pointer; background: var(--rc-btn-bg, var(--btn-bg, var(--card-background-color, rgba(128,128,128,0.05)))); border: 1px solid transparent; flex-grow: 1; flex-shrink: 1; min-width: 0; overflow: hidden; box-sizing: border-box; transition: background 0.2s; user-select: none; -webkit-user-select: none; flex-basis: var(--btn-flex-basis, auto); height: var(--btn-height, 60px); justify-content: var(--btn-justify, center); }
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
        .btn:hover { background: var(--rc-btn-bg-hover, rgba(128,128,128,0.1)); border-color: rgba(128,128,128,0.2); }
        .btn:active { background: var(--rc-btn-bg-active, rgba(128,128,128,0.15)); }
        .btn.state-unavailable { opacity: 0.56; }
        .btn.state-unavailable:hover,
        .btn.state-unavailable:active { background: var(--rc-btn-bg, var(--btn-bg, var(--card-background-color, rgba(128,128,128,0.05)))); border-color: transparent; }
        .btn.state-unavailable .btn-name,
        .btn.state-unavailable .btn-state,
        .btn.state-unavailable ha-icon { color: var(--disabled-text-color, var(--secondary-text-color)); }
        .icon-box { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; background: var(--icon-bg, transparent); }
        .btn-txt { display: flex; flex-direction: column; text-align: left; overflow: hidden; min-width: 0; flex: initial; max-width: 100%; }
        .btn ha-icon { color: var(--rc-icon-color, var(--icon-color, grey)); --mdc-icon-size: 20px; }
        .btn-name { font-size: 13px; font-weight: 600; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .btn-state { font-size: 11px; color: var(--secondary-text-color); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .warn { position: absolute; top: 4px; right: 4px; color: #d32f2f; --mdc-icon-size: 16px; background: rgba(255,255,255,0.8); border-radius: 50%; padding: 1px; }
        .warn.warn-offline { color: var(--warning-color, var(--secondary-text-color)); background: var(--card-background-color, rgba(255,255,255,0.85)); }
        .btn.has-inline-ctrl { flex-direction: column; align-items: stretch; padding: 6px 10px; gap: 4px; height: auto; min-height: var(--btn-height, 60px); }
        .btn.has-inline-ctrl .btn-top { display: flex; align-items: center; gap: 10px; width: 100%; flex: 0 0 auto; }
        .btn.has-inline-ctrl .btn-txt { flex: 1; min-width: 0; }
        .btn-slider-wrap { width: 100%; flex: 0 0 auto; padding: 0 2px 4px; }
        .btn-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; background: linear-gradient(to right, var(--icon-color, #ff9800) 0%, var(--icon-color, #ff9800) var(--slider-pct, 0%), rgba(128,128,128,0.3) var(--slider-pct, 0%), rgba(128,128,128,0.3) 100%); }
        .btn-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--icon-color, #ff9800); cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .btn-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--icon-color, #ff9800); cursor: pointer; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .btn-cover-actions { display: flex; gap: 4px; width: 100%; flex: 0 0 auto; padding-bottom: 4px; }
        .cover-action-btn { flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(128,128,128,0.1); border-radius: 6px; padding: 4px 2px; cursor: pointer; transition: background 0.15s; }
        .cover-action-btn:hover { background: rgba(128,128,128,0.22); }
        .cover-action-btn ha-icon { --mdc-icon-size: 16px; color: var(--primary-text-color); }
        .controls { transition: max-height 0.35s ease, padding 0.35s ease; overflow: hidden; max-height: 2000px; }
        .controls.collapsed { max-height: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }
        .collapse-btn { position: absolute; bottom: 8px; right: 8px; z-index: 3; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.38); display: none; align-items: center; justify-content: center; cursor: pointer; }
        .collapse-btn ha-icon { --mdc-icon-size: 18px; color: white; transition: transform 0.35s ease; }
        .collapse-btn.open ha-icon { transform: rotate(180deg); }
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
            <div id="collapse-btn" class="collapse-btn"><ha-icon icon="mdi:chevron-down"></ha-icon></div>
          </div>
          <div id="ctrls" class="controls"></div>
        </div>
      </ha-card>`;

    this.content = this.shadowRoot.querySelector(".container");
    this.controls = this.shadowRoot.getElementById("ctrls");
    this.shadowRoot.querySelector(".img-box").addEventListener("click", () => {
      if (this.config?.collapsible === true) { this._toggleCollapse(); return; }
      this._nav();
    });

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
    (Array.isArray(cfg.header_badges) ? cfg.header_badges : []).forEach((b) => add(b?.entity));
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
    if (!this._cachedEntityIds) this._cachedEntityIds = this._getRelevantEntityIds();
    const next = new Map();
    this._cachedEntityIds.forEach((id) => next.set(id, this._getStateSignature(states[id])));
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
    const imgBox = this.shadowRoot.querySelector(".img-box");
    if (imgBox) {
      const hh = c.header_height !== undefined ? Number(c.header_height) : NaN;
      imgBox.style.height = (Number.isFinite(hh) && hh >= 0) ? hh + "px" : "120px";
    }
    const nameEl = this.shadowRoot.getElementById("name");
    nameEl.innerText = c.name || "Room";
    nameEl.style.display = c.show_name === false ? "none" : "";
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

    const infoEl = this.shadowRoot.getElementById("info");
    const infoParts = [];
    const standardHeaderBadgeBackground = trimStr(c.header_info_background);
    if (t != null && t !== "-" && !isNaN(parseFloat(t))) {
      // --- NEW: USE DYNAMIC UNIT ---
      let tStr = t + unit;
      if (tar != null && tar !== "-") tStr += " (" + tar + unit + ")";
      infoParts.push({ text: tStr, background: standardHeaderBadgeBackground });
    }
    if (hm != null && hm !== "-" && !isNaN(parseFloat(hm))) infoParts.push({ text: hm + "%", background: standardHeaderBadgeBackground });

    (Array.isArray(c.header_badges) ? c.header_badges : []).forEach(badge => {
      if (!badge?.entity) return;
      const st = h.states[badge.entity];
      if (!st) return;
      const val = st.state;
      if (val === "unavailable" || val === "unknown") return;
      const unit = st.attributes.unit_of_measurement || "";
      const showBadgeName = badge.show_name !== false;
      const displayLabel = badge.label || st.attributes.friendly_name || badge.entity;
      infoParts.push({
        text: showBadgeName
          ? `${displayLabel}: ${val}${unit ? " " + unit : ""}`
          : `${val}${unit ? " " + unit : ""}`,
        background: trimStr(badge.background)
      });
    });
    infoEl.replaceChildren();
    infoParts.forEach((part, idx) => {
      const span = document.createElement("span");
      span.className = `info-item${part.background ? " badge" : ""}`;
      span.textContent = part.text;
      if (part.background) span.style.background = part.background;
      infoEl.appendChild(span);
      if (idx < infoParts.length - 1) {
        const sep = document.createElement("span");
        sep.className = "info-item";
        sep.textContent = "|";
        infoEl.appendChild(sep);
      }
    });

    const textEl = this.shadowRoot.querySelector(".text");
    const nameOffset = Number(c.header_name_offset ?? 0);
    const infoOffset = Number(c.header_info_offset ?? 0);
    if (textEl) textEl.style.flex = (nameOffset > 0 || infoOffset > 0) ? "1" : "";

    // Title horizontal offset
    this._applyHeaderOffset(nameEl, nameOffset, textEl);

    // Info line horizontal offset
    this._applyHeaderOffset(infoEl, infoOffset, textEl);

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
    const windowAlwaysShow = c.window_always_show === true;
    const windowOpenColor = trimStr(c.window_open_color) || "#FFA000";
    const windowClosedColor = trimStr(c.window_closed_color) || "#9E9E9E";
    (Array.isArray(effectiveWindowSensors) ? effectiveWindowSensors : []).forEach(s => {
      const st = h.states[s];
      if (!st) return;
      const isOpen = isEntityOn(st);
      if (!isOpen && !windowAlwaysShow) return;
      const chipColor = isOpen ? windowOpenColor : windowClosedColor;
      const isHex = /^#[0-9A-F]{6}$/i.test(chipColor);
      const chipBg = isHex ? chipColor + "33" : `color-mix(in srgb, ${chipColor} 20%, transparent)`;
      const icon = isOpen ? "mdi:window-open-variant" : "mdi:window-shutter";
      const label = st.attributes.friendly_name || getTranslation(h, "window");
      ch.innerHTML += `<div class="chip" style="background:${chipBg};color:${chipColor}"><ha-icon icon="${icon}" style="--mdc-icon-size:14px"></ha-icon> ${label}</div>`;
    });

    const cardEl = this.shadowRoot.querySelector("ha-card");
    if (cardEl) {
      cardEl.classList.toggle("warning-battery", batteryWarn);
      cardEl.classList.toggle("warning-humidity", !batteryWarn && humidityWarn);
      
      const setPxProp = (k, v, def) => {
        if (v !== undefined && v !== null && v !== "") {
          const num = Number(v);
          cardEl.style.setProperty(k, Number.isFinite(num) ? num + "px" : String(v));
        } else {
          cardEl.style.setProperty(k, def);
        }
      };
      const setStrProp = (k, v, def) => cardEl.style.setProperty(k, (v !== undefined && v !== null && v !== "") ? String(v) : def);
      setPxProp("--rc-header-name-size", c.header_name_size, "14px");
      setStrProp("--rc-header-name-weight", c.header_name_weight, "bold");
      setStrProp("--rc-header-name-style", c.header_name_style, "normal");
      setStrProp("--rc-header-name-color", c.header_name_color, "white");
      setPxProp("--rc-header-info-size", c.header_info_size, "12px");
      setStrProp("--rc-header-info-weight", c.header_info_weight, "normal");
      setStrProp("--rc-header-info-style", c.header_info_style, "normal");
      setStrProp("--rc-header-info-color", c.header_info_color, "white");
    }

    const collapseBtn = this.shadowRoot.getElementById("collapse-btn");
    if (collapseBtn) {
      const isCollapsible = c.collapsible === true;
      collapseBtn.style.display = isCollapsible ? "flex" : "none";
      collapseBtn.classList.toggle("open", !this._collapsed);
      this.controls.classList.toggle("collapsed", isCollapsible && this._collapsed);
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

  _getSafeHeaderOffset(requestedPercent, containerEl, itemEl) {
    const requested = clampNum(requestedPercent, 0, 100, 0);
    if (!containerEl || !itemEl || requested <= 0) return 0;
    const containerWidth = containerEl.clientWidth || 0;
    const itemWidth = Math.ceil(itemEl.scrollWidth || itemEl.getBoundingClientRect().width || 0);
    if (containerWidth <= 0 || itemWidth <= 0) return 0;
    const maxPercent = Math.max(0, ((containerWidth - itemWidth) / containerWidth) * 100);
    return (requested / 100) * maxPercent;
  }

  _applyHeaderOffset(itemEl, requestedPercent, containerEl) {
    if (!itemEl) return;
    const apply = () => {
      itemEl.style.marginLeft = "";
      itemEl.style.marginRight = "";
      const safeOffset = this._getSafeHeaderOffset(requestedPercent, containerEl, itemEl);
      if (safeOffset <= 0) return;
      if (safeOffset >= 99.5) {
        itemEl.style.marginLeft = "auto";
        return;
      }
      itemEl.style.marginLeft = `${safeOffset}%`;
    };
    apply();
    requestAnimationFrame(() => requestAnimationFrame(apply));
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
      tpl = resolveTemplateCtrl(ctrl, h);
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
      // color_map: per-state color override (lower priority than force_color)
      if (!ctrl.force_color && ctrl.color_map && !isUnavail) {
        const normMap = Object.fromEntries(
          Object.entries(ctrl.color_map).map(([k, v]) => [
            k === true ? "on" : k === false ? "off" : String(k), v
          ])
        );
        const mappedColor = trimStr(normMap[s] ?? normMap.default ?? "");
        if (mappedColor) {
          col = mappedColor;
          const isHex = /^#[0-9A-F]{6}$/i.test(mappedColor);
          bg = isHex ? mappedColor + "33" : `color-mix(in srgb, ${mappedColor} 20%, transparent)`;
        }
      }
    }
    
    // Override with manual background configuration if provided
    const manualBg = ctrl.button_background || this.config?.global_button_background || "";
    if (manualBg) bg = manualBg;

    const nameTxt = isTemplate
      ? (tpl?.content || ctrl.name || "")
      : (ctrl.name !== undefined ? ctrl.name : "Dev");
    const unavailableText = getTranslation(h, "device_unavailable");
    let badge = "";
    if (isUnavail) badge = `<ha-icon class="warn warn-offline" icon="mdi:lan-disconnect" title="${unavailableText}"></ha-icon>`;

    // --- NEW: USE DYNAMIC UNIT IN TEMPLATE ---
    const climateHasSlider = typ === "climate" && ctrl.control_mode === "slider";
    const stateText = isTemplate
      ? (tpl?.state || "")
      : (typ === "climate"
        ? (() => {
            const cur = st?.attributes?.current_temperature;
            const tar = st?.attributes?.temperature;
            if (climateHasSlider && cur != null && tar != null) return `${cur}${unit} → ${tar}${unit}`;
            if (climateHasSlider && tar != null) return tar + unit;
            if (cur != null) return cur + unit;
            return s;
          })()
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

    const resolvedIcon = isTemplate
      ? (tpl?.icon || ctrl.icon || "mdi:circle")
      : (() => {
          if (ctrl.icon_map) {
            // YAML parses unquoted `on`/`off` as booleans — normalise keys to strings
            const normMap = Object.fromEntries(
              Object.entries(ctrl.icon_map).map(([k, v]) => [
                k === true ? "on" : k === false ? "off" : String(k), v
              ])
            );
            const mapped = normMap[s] ?? normMap.default;
            if (mapped) return mapped;
          }
          return ctrl.icon || DOMAIN_STATE_ICON_MAPS[domain]?.[s] || st?.attributes?.icon || "mdi:circle";
        })();
    const iconSizePx = (() => {
      const raw = trimStr(ctrl.icon_size) || trimStr(this.config?.global_icon_size) || "";
      if (!raw) return "20px";
      return /^\d+(\.\d+)?$/.test(raw) ? raw + "px" : raw;
    })();
    const iconHtml = showIcon
      ? `<div class="icon-box">
        <ha-icon icon="${resolvedIcon}" style="--mdc-icon-size:${iconSizePx}"></ha-icon>
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

    // Inline controls (slider / cover buttons)
    const controlMode = ctrl.control_mode;
    const hasSlider = controlMode === "slider" && !isUnavail && (domain === "light" || domain === "cover" || domain === "climate");
    const hasCoverBtns = controlMode === "buttons" && !isUnavail && domain === "cover";

    if (hasSlider || hasCoverBtns) {
      btn.classList.add("has-inline-ctrl");
      const topDiv = document.createElement("div");
      topDiv.className = "btn-top";
      while (btn.firstChild) topDiv.appendChild(btn.firstChild);
      btn.appendChild(topDiv);

      if (hasSlider) {
        let sliderMin = 0, sliderMax = 100, sliderStep = 1, sliderValue, sliderPct;
        if (domain === "light") {
          sliderValue = st?.attributes?.brightness != null ? Math.round((st.attributes.brightness / 255) * 100) : 0;
          sliderPct = sliderValue;
        } else if (domain === "climate") {
          sliderMin = st?.attributes?.min_temp ?? 5;
          sliderMax = st?.attributes?.max_temp ?? 35;
          sliderStep = 0.5;
          sliderValue = st?.attributes?.temperature ?? sliderMin;
          sliderPct = ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100;
        } else {
          sliderValue = st?.attributes?.current_position ?? 0;
          sliderPct = sliderValue;
        }
        const wrap = document.createElement("div");
        wrap.className = "btn-slider-wrap";
        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "btn-slider";
        slider.min = sliderMin; slider.max = sliderMax; slider.step = sliderStep; slider.value = sliderValue;
        slider.style.setProperty("--slider-pct", `${sliderPct}%`);
        slider.addEventListener("pointerdown", e => e.stopPropagation());
        slider.addEventListener("click", e => e.stopPropagation());
        slider.addEventListener("input", e => {
          const v = +e.target.value;
          const pct = domain === "climate"
            ? ((v - sliderMin) / (sliderMax - sliderMin)) * 100
            : v;
          e.target.style.setProperty("--slider-pct", `${pct}%`);
          if (domain === "climate") {
            const stateEl = topDiv.querySelector(".btn-state");
            if (stateEl) {
              const cur = st?.attributes?.current_temperature;
              stateEl.textContent = cur != null ? `${cur}${unit} → ${v}${unit}` : `${v}${unit}`;
            }
          }
        });
        slider.addEventListener("change", e => {
          const v = +e.target.value;
          if (domain === "light") {
            this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, brightness: Math.round(v * 2.55) });
          } else if (domain === "climate") {
            this._hass.callService("climate", "set_temperature", { entity_id: ctrl.entity, temperature: v });
          } else {
            this._hass.callService("cover", "set_cover_position", { entity_id: ctrl.entity, position: v });
          }
        });
        wrap.appendChild(slider);
        btn.appendChild(wrap);
      }

      if (hasCoverBtns) {
        const actDiv = document.createElement("div");
        actDiv.className = "btn-cover-actions";
        [
          { icon: "mdi:arrow-up-bold", svc: "open_cover" },
          { icon: "mdi:stop", svc: "stop_cover" },
          { icon: "mdi:arrow-down-bold", svc: "close_cover" }
        ].forEach(({ icon, svc }) => {
          const b = document.createElement("div");
          b.className = "cover-action-btn";
          b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>`;
          b.addEventListener("pointerdown", e => e.stopPropagation());
          b.addEventListener("click", e => {
            e.stopPropagation();
            if (!this._isEntityUnavailable(ctrl.entity)) {
              this._hass.callService("cover", svc, { entity_id: ctrl.entity });
            }
          });
          actDiv.appendChild(b);
        });
        btn.appendChild(actDiv);
      }
    } else {
      btn.classList.remove("has-inline-ctrl");
    }
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
    const trackTimeout = (fn, ms) => {
      const id = setTimeout(() => { this._activeTimers.delete(id); fn(); }, ms);
      this._activeTimers.add(id);
      return id;
    };
    const cancelTimeout = (id) => { clearTimeout(id); this._activeTimers.delete(id); };
    node.addEventListener("pointerdown", () => {
      if (this._isEntityUnavailable(ctrl.entity)) return;
      held = false;
      holdTimer = trackTimeout(() => { held = true; this._fireAction("hold", config); }, 500);
    });
    const cancel = () => { if (holdTimer) { cancelTimeout(holdTimer); holdTimer = null; } };
    node.addEventListener("pointerup", cancel);
    node.addEventListener("pointerleave", cancel);
    node.addEventListener("pointercancel", cancel);
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._isEntityUnavailable(ctrl.entity)) return;
      if (held) return;
      if (config.double_tap_action.action !== "none") {
        if (timer) { cancelTimeout(timer); timer = null; this._fireAction("double_tap", config); }
        else { timer = trackTimeout(() => { timer = null; this._fireAction("tap", config); }, 250); }
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

  _toggleCollapse() {
    this._collapsed = !this._collapsed;
    if (this._collapseKey) localStorage.setItem(this._collapseKey, this._collapsed ? "1" : "0");
    const collapseBtn = this.shadowRoot.getElementById("collapse-btn");
    if (collapseBtn) collapseBtn.classList.toggle("open", !this._collapsed);
    this.controls.classList.toggle("collapsed", this._collapsed);
  }

  _iconForBadgeDomain(entityId) {
    const domain = entityId?.split(".")[0] || "";
    const defaults = { light: "mdi:lightbulb", switch: "mdi:toggle-switch", binary_sensor: "mdi:checkbox-marked-circle-outline", motion: "mdi:motion-sensor", door: "mdi:door", window: "mdi:window-open-variant", sensor: "mdi:gauge", lock: "mdi:lock", cover: "mdi:window-shutter" };
    return defaults[domain] || "mdi:information-outline";
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
    this._sensorsSectionOpen = false;
    this._imageSectionOpen = false;
    this._typoSectionOpen = false;
    this._badgesSectionOpen = false;
    this._cardBehaviorOpen = true;
    this._headerSectionOpen = true;
    this._activeTab = "config";
    this._controlIds = [];
    this._nextControlId = 1;
    this._livePreview = true;
    this._pendingConfig = null;
    this._controlTemplatesCache = null;
    this._quickAddType = "light";
    this._quickAddEntity = "";
    this._quickAddSelectReady = false;
    this._lastInteractedControlId = "";
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
    if (upd) { this._controlTemplatesCache = null; this._navOptionsLoaded = false; this.render(); return; }
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-selector,ha-entity-picker,ha-icon-picker,ha-textfield,ha-switch").forEach(e => {
        if (e.hass !== hass) e.hass = hass;
      });
      // After a hot-reload patch, new DOM elements may be missing from the old shadow DOM.
      // Force a full re-render once so the new static HTML (including any new toggles) is applied.
      if (this._config && (!this.shadowRoot.getElementById("show-name-toggle") || !this.shadowRoot.getElementById("typo-sec"))) {
        this.shadowRoot.innerHTML = "";
        this.render();
        return;
      }
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

  _getScrollParents() {
    const out = [];
    const seen = new Set();
    let el = this;
    while (el) {
      if (el !== this && el instanceof Element) {
        const style = getComputedStyle(el);
        const oy = style.overflowY;
        if ((oy === "auto" || oy === "scroll") && !seen.has(el)) {
          seen.add(el);
          out.push(el);
        }
      }
      const parent = el.parentElement || el.assignedSlot || null;
      if (parent) {
        el = parent;
      } else {
        const root = el.getRootNode?.();
        if (root instanceof ShadowRoot && root.host && !seen.has(root.host)) {
          el = root.host;
        } else {
          break;
        }
      }
    }
    const docScroller = this.ownerDocument?.scrollingElement;
    if (docScroller && !seen.has(docScroller)) out.push(docScroller);
    return out;
  }

  _withScrollRestore(fn) {
    const scrollParents = this._getScrollParents();
    const primaryScroller = scrollParents[0] || null;
    const scrollTops = scrollParents.map((el) => ({ el, top: el.scrollTop }));
    const activeEl = this.shadowRoot?.activeElement;
    const activeBox = activeEl?.closest?.(".box");
    const anchorId = activeBox?.dataset?.controlId || this._lastInteractedControlId || "";
    const anchorBox = anchorId
      ? this.shadowRoot?.querySelector(`.box[data-control-id="${anchorId}"]`)
      : activeBox;
    const anchorOffset = (primaryScroller && activeBox)
      ? activeBox.getBoundingClientRect().top - primaryScroller.getBoundingClientRect().top
      : (primaryScroller && anchorBox)
        ? anchorBox.getBoundingClientRect().top - primaryScroller.getBoundingClientRect().top
      : null;

    // Verhindert das Einklappen des Editors während des Renderings
    const oldHeight = this.offsetHeight;
    if (oldHeight > 0) this.style.minHeight = `${oldHeight}px`;

    fn();

    if (scrollParents.length > 0) {
      const restoreTop = () => {
        const primaryTop = scrollTops[0]?.top ?? 0;
        if (!anchorId || anchorOffset === null || !primaryScroller) return primaryTop;
        const nextBox = this.shadowRoot?.querySelector(`.box[data-control-id="${anchorId}"]`);
        if (!nextBox) return primaryTop;
        const nextOffset = nextBox.getBoundingClientRect().top - primaryScroller.getBoundingClientRect().top;
        return primaryTop + (nextOffset - anchorOffset);
      };
      const restoreScrollParents = () => {
        scrollTops.forEach(({ el, top }, idx) => {
          el.scrollTop = idx === 0 ? restoreTop() : top;
        });
        if (anchorId) {
          const nextBox = this.shadowRoot?.querySelector(`.box[data-control-id="${anchorId}"]`);
          nextBox?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
        }
      };
      restoreScrollParents();
      let frames = 6;
      const restore = () => {
        restoreScrollParents();
        if (--frames > 0) requestAnimationFrame(restore);
        else this.style.minHeight = ""; // Zurücksetzen, wenn fertig
      };
      requestAnimationFrame(restore);
    } else {
      this.style.minHeight = "";
    }
  }

  _areAllButtonsExpanded() {
    const controls = Array.isArray(this._config?.controls) ? this._config.controls : [];
    if (controls.length === 0) return false;
    this._collapsedState = this._collapsedState || {};
    return controls.every((_ctrl, i) => {
      const key = this._controlIds[i];
      if (!key) return true;
      return this._collapsedState[key] !== true;
    });
  }

  _toggleAllButtonsExpanded(expand) {
    const controls = Array.isArray(this._config?.controls) ? this._config.controls : [];
    this._collapsedState = this._collapsedState || {};
    controls.forEach((_ctrl, i) => {
      const key = this._controlIds[i];
      if (key) this._collapsedState[key] = !expand;
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

  _getControlTemplates() {
    const lang = this._hass?.language?.split("-")[0] || "en";
    if (this._controlTemplatesCache?.lang === lang) return this._controlTemplatesCache.templates;
    const h = this._hass;
    const templates = [
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
    this._controlTemplatesCache = { lang, templates };
    return templates;
  }

  _getTemplateById(templateId) {
    const templates = this._getControlTemplates();
    return templates.find((t) => t.id === templateId);
  }

  _buildControlFromTemplate(template, entityId) {
    const st = this._hass?.states?.[entityId];
    const name = st?.attributes?.friendly_name || "";
    const domain = entityId?.split(".")[0] || "";
    const defaults = template?.defaults || {};
    // Only store a static icon for domains without built-in state maps — otherwise _updateBtnState resolves dynamically
    const iconField = DOMAIN_STATE_ICON_MAPS[domain]
      ? {}
      : { icon: st?.attributes?.icon || template?.defaults?.icon || this._iconForEntity(entityId) };
    return {
      entity: entityId || "",
      name,
      ...iconField,
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
    const domVersion = this.shadowRoot.querySelector("[data-rc-version]")?.dataset?.rcVersion;
    if (alreadyRendered && domVersion === VERSION) { this.updVal(); this.renBtn(); this._applyNavSelectorOptions(); this._ensureNavOptions(); this._updateSensorsSectionUI(); this._updateImageSectionUI(); this._updateBadgesUI(); this._updateTypographyUI(); this._updateCardBehaviorUI(); this._updateHeaderSectionUI(); this._updateTabUI(); return; }
    // Force full re-render if DOM is stale or from old version
    this.shadowRoot.innerHTML = "";
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
        .badges-sec { border: 1px solid var(--divider-color); border-radius: 8px; background: var(--secondary-background-color); padding: 6px 10px; margin-bottom: 8px; }
        .badges-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer; user-select: none; padding: 4px 0; }
        .badges-title { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .badges-chev { --mdc-icon-size: 18px; opacity: 0.7; transition: transform 0.15s ease; }
        .badges-sec.open .badges-chev { transform: rotate(90deg); }
        .badges-content { margin-top: 6px; }
        .badges-content[hidden] { display: none; }
        .badge-box { border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; background: var(--card-background-color, var(--primary-background-color)); }
        .badge-head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .badge-entity-label { font-size: 12px; font-weight: 600; opacity: 0.7; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .badge-del-btn { background: none; border: 0; cursor: pointer; padding: 2px; display: inline-flex; color: #d32f2f; --mdc-icon-size: 18px; }
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
        .qa-native-select { width: 100%; height: 56px; padding: 0 36px 0 16px; border: 1px solid var(--divider-color, rgba(0,0,0,0.38)); border-radius: 4px; background: transparent; color: var(--primary-text-color); font-size: 16px; font-family: var(--mdc-typography-body1-font-family, var(--mdc-typography-font-family, Roboto, sans-serif)); cursor: pointer; box-sizing: border-box; appearance: auto; -webkit-appearance: auto; outline: none; transition: border-color 0.15s ease; }
        .qa-native-select:hover { border-color: var(--primary-text-color, rgba(0,0,0,0.87)); }
        .qa-native-select:focus { border: 2px solid var(--mdc-theme-primary, var(--primary-color)); padding: 0 35px 0 15px; }
        .tab-bar { display: flex; border-bottom: 2px solid var(--divider-color); margin-bottom: 4px; }
        .tab-btn { flex: 1; background: none; border: none; border-bottom: 3px solid transparent; padding: 10px 0; font-size: 14px; font-weight: 600; color: var(--secondary-text-color); cursor: pointer; margin-bottom: -2px; transition: color 0.15s, border-color 0.15s; }
        .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        #tab-buttons-panel[hidden] { display: none; }
        #tab-config-panel[hidden] { display: none; }
      </style>
      <span data-rc-version="${VERSION}" style="display:none"></span>
      <div id="tab-bar" class="tab-bar">
        <button id="tab-config-btn" class="tab-btn">${getTranslation(h, "configuration")}</button>
        <button id="tab-buttons-btn" class="tab-btn">${getTranslation(h, "buttons")}</button>
      </div>
      <div id="tab-config-panel">
      <div class="sec">
        <div id="card-beh-head" class="sec-head" style="cursor:pointer;user-select:none;padding:4px 0">
          <h3>${getTranslation(h, "card_behavior")}</h3>
          <ha-icon id="card-beh-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
        </div>
        <div id="card-beh-content">
        <div class="row" style="margin-top:8px; align-items:center">
          <ha-formfield label="${getTranslation(h, "live_preview")}">
            <ha-switch id="live-preview-toggle" checked></ha-switch>
          </ha-formfield>
        </div>
        <ha-textfield label="${getTranslation(h, "name")}" cfg="name" class="i"></ha-textfield>
        <div class="row" style="margin-top:4px; align-items:center; margin-bottom:8px">
          <ha-formfield label="${getTranslation(h, "show_name")}">
            <ha-switch id="show-name-toggle" checked></ha-switch>
          </ha-formfield>
          <ha-formfield label="${getTranslation(h, "collapsible")}">
            <ha-switch id="collapsible-toggle"></ha-switch>
          </ha-formfield>
        </div>
        <div id="default-state-row" class="row hidden">
          <ha-selector id="default-state-sel" label="${getTranslation(h, "default_state")}"></ha-selector>
        </div>
        <ha-selector id="nav-path" label="${getTranslation(h, "path")}" style="margin-top:12px"></ha-selector>
        </div>
      </div>
      <div class="sec">
        <div id="header-sec-head" class="sec-head" style="cursor:pointer;user-select:none;padding:4px 0">
          <h3>${getTranslation(h, "header")}</h3>
          <ha-icon id="header-sec-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
        </div>
        <div id="header-sec-content">
        <ha-textfield label="${getTranslation(h, "header_height")}" cfg="header_height" class="i" type="number" min="0" max="400" style="width:100%;margin-top:4px" placeholder="120"></ha-textfield>
        <div id="typo-sec" class="manual-sec" style="margin-top:8px">
          <div id="typo-head" class="manual-head">
            <span id="typo-title" class="manual-title" style="display:flex;align-items:center;gap:6px"><ha-icon icon="mdi:format-text" style="--mdc-icon-size:16px;opacity:0.7"></ha-icon>${getTranslation(h, "typography")}</span>
            <ha-icon id="typo-chev" class="manual-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="typo-content" class="manual-content" hidden>
            <div class="image-title" style="margin-bottom:8px">${getTranslation(h, "name_font")}</div>
            <div class="row">
              <ha-textfield label="${getTranslation(h, "font_size")}" cfg="header_name_size" class="i" type="number" placeholder="14"></ha-textfield>
              <ha-selector id="header-name-weight-sel" label="${getTranslation(h, "font_weight")}"></ha-selector>
            </div>
            <div class="row">
              <ha-selector id="header-name-style-sel" label="${getTranslation(h, "font_style")}"></ha-selector>
              <div class="cl-row">
                <ha-textfield id="header-name-color" label="${getTranslation(h, "font_color")}" placeholder="#ffffff"></ha-textfield>
                <input type="color" id="header-name-color-picker" class="cp" value="#ffffff">
              </div>
            </div>
            <div class="image-title" style="margin:12px 0 8px">${getTranslation(h, "info_font")}</div>
            <div class="row">
              <ha-textfield label="${getTranslation(h, "font_size")}" cfg="header_info_size" class="i" type="number" placeholder="12"></ha-textfield>
              <ha-selector id="header-info-weight-sel" label="${getTranslation(h, "font_weight")}"></ha-selector>
            </div>
            <div class="row">
              <ha-selector id="header-info-style-sel" label="${getTranslation(h, "font_style")}"></ha-selector>
              <div class="cl-row">
                <ha-textfield id="header-info-color" label="${getTranslation(h, "font_color")}" placeholder="#ffffff"></ha-textfield>
                <input type="color" id="header-info-color-picker" class="cp" value="#ffffff">
              </div>
            </div>
            <div class="image-title" style="margin:12px 0 8px">${getTranslation(h, "badge_bg")}</div>
            <div class="cl-row">
              <ha-textfield id="standard-badge-bg" label="${getTranslation(h, "standard_badge_background")}"></ha-textfield>
              <input type="color" id="standard-badge-bg-picker" class="cp">
            </div>
          </div>
        </div>
        <div class="row" style="margin-top:10px; align-items:center; margin-bottom: 4px;">
          <ha-formfield label="${getTranslation(h, "header_sync_offsets")}">
            <ha-switch id="sync-offsets-toggle"></ha-switch>
          </ha-formfield>
        </div>
        <div style="margin-top:10px">
          <div class="image-title" style="margin-bottom:4px">${getTranslation(h, "header_name_offset")}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="range" id="name-offset-slider" min="0" max="100" step="1" style="flex:1;cursor:pointer;accent-color:var(--primary-color)">
            <span id="name-offset-value" style="min-width:30px;text-align:right;font-size:12px;opacity:0.8;"></span>
          </div>
          <div style="display:flex;font-size:10px;opacity:0.55;margin-top:2px;pointer-events:none;margin-right:38px">
            <span style="flex:1;text-align:left">&#9664; Links</span><span style="flex:1;text-align:center">Mitte</span><span style="flex:1;text-align:right">Rechts &#9654;</span>
          </div>
        </div>
        <div style="margin-top:10px">
          <div class="image-title" style="margin-bottom:4px">${getTranslation(h, "header_info_offset")}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="range" id="info-offset-slider" min="0" max="100" step="1" style="flex:1;cursor:pointer;accent-color:var(--primary-color)">
            <span id="info-offset-value" style="min-width:30px;text-align:right;font-size:12px;opacity:0.8;"></span>
          </div>
          <div style="display:flex;font-size:10px;opacity:0.55;margin-top:2px;pointer-events:none;margin-right:38px">
            <span style="flex:1;text-align:left">&#9664; Links</span><span style="flex:1;text-align:center">Mitte</span><span style="flex:1;text-align:right">Rechts &#9654;</span>
          </div>
        </div>
        <ha-entity-picker label="${getTranslation(h, "main_climate")}" cfg="entity" class="i" include-domains='["climate"]' style="margin-top:8px"></ha-entity-picker>
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
        <div id="badges-sec" class="badges-sec">
          <div id="badges-head" class="badges-head">
            <span id="badges-title" class="badges-title"></span>
            <ha-icon id="badges-chev" class="badges-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="badges-content" class="badges-content" hidden>
            <div id="badges-list"></div>
            <mwc-button id="add-badge" raised>
              <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
            </mwc-button>
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
        </div>
      </div>
      <div class="sec">
        <div id="sensors-sec" class="manual-sec">
          <div id="sensors-head" class="manual-head">
            <span id="sensors-title" class="manual-title"></span>
            <ha-icon id="sensors-chev" class="manual-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="sensors-content" class="manual-content" hidden>
            <div class="image-title" style="font-size:11px;font-weight:600;opacity:0.6;margin-bottom:6px">${getTranslation(h, "sensors_manual")}</div>
            <ha-entity-picker label="${getTranslation(h, "temp_label")}" cfg="temp_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <ha-entity-picker label="${getTranslation(h, "target_temp_label")}" cfg="target_temp_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <ha-entity-picker label="${getTranslation(h, "humid_label")}" cfg="humid_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <ha-textfield label="${getTranslation(h, "humid_warn_threshold")}" cfg="humidity_warning_threshold" class="i" type="number"></ha-textfield>
            <ha-selector cfg="window_sensors" class="i" label="${getTranslation(h, "window_label")}"></ha-selector>
            <ha-formfield id="window-always-show-field" label="${getTranslation(h, "window_always_show")}" style="display:flex;align-items:center;margin:4px 0">
              <ha-switch id="window-always-show"></ha-switch>
            </ha-formfield>
            <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
              <ha-textfield id="window-open-color" cfg="window_open_color" class="i" label="${getTranslation(h, "window_open_color")}" style="flex:1" placeholder="#FFA000"></ha-textfield>
              <input type="color" id="window-open-color-picker" class="cp">
            </div>
            <div id="window-closed-color-row" style="display:flex;gap:8px;align-items:center;margin-top:4px">
              <ha-textfield id="window-closed-color" cfg="window_closed_color" class="i" label="${getTranslation(h, "window_closed_color")}" style="flex:1" placeholder="#9E9E9E"></ha-textfield>
              <input type="color" id="window-closed-color-picker" class="cp">
            </div>
            <div style="border-top:1px solid var(--divider-color);margin:10px 0 8px"></div>
            <div class="image-title" style="font-size:11px;font-weight:600;opacity:0.6;margin-bottom:6px">${getTranslation(h, "battery_label")}</div>
            <ha-selector cfg="battery_sensors" class="i" label="${getTranslation(h, "battery_label")}"></ha-selector>
          </div>
        </div>
      </div>
      </div>
      <div id="tab-buttons-panel">
      <div class="sec">
        <div class="sec-head">
          <h3>${getTranslation(h, "buttons")}</h3>
        </div>
        <div class="row">
          <ha-selector id="global-label-pos" label="${getTranslation(h, "label_position_all")}"></ha-selector>
          <ha-textfield id="global-icon-size" label="${getTranslation(h, "global_icon_size")}" type="number" style="max-width:140px" placeholder="20"></ha-textfield>
        </div>
        <div class="cl-row" style="margin-top: 8px">
          <ha-textfield id="global-btn-bg" cfg="global_button_background" label="${getTranslation(h, "global_button_bg")}" class="i"></ha-textfield>
          <input type="color" id="global-btn-bg-picker" class="cp i-cp" cfg="global_button_background" style="margin-right: 0px">
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
                  <select id="tmpl-select" class="qa-native-select" aria-label="${getTranslation(h, "quick_add_entity_type_label")}"></select>
                </div>
                <div class="quick-add-helper">${getTranslation(h, "quick_add_entity_type_help")}</div>
              </div>
              <div class="quick-add-col">
                <div class="quick-add-label">${getTranslation(h, "quick_add_entity_label")}</div>
                <div class="quick-add-field">
                  <ha-selector id="tmpl-entity" aria-label="${getTranslation(h, "quick_add_entity_label")}"></ha-selector>
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
      </div>
      </div>`;

    const tabConfigBtn = this.shadowRoot.getElementById("tab-config-btn");
    const tabButtonsBtn = this.shadowRoot.getElementById("tab-buttons-btn");
    if (tabConfigBtn) {
      tabConfigBtn.addEventListener("click", () => {
        this._activeTab = "config";
        this._updateTabUI();
      });
    }
    if (tabButtonsBtn) {
      tabButtonsBtn.addEventListener("click", () => {
        this._activeTab = "buttons";
        this._updateTabUI();
      });
    }
    this._updateTabUI();
    const fileInput = this.shadowRoot.getElementById("file-upload");
    const uploadBtn = this.shadowRoot.getElementById("upload-btn");
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => this._handleUpload(e));
    }
    const cardBehHead = this.shadowRoot.getElementById("card-beh-head");
    if (cardBehHead) {
      cardBehHead.addEventListener("click", () => {
        this._cardBehaviorOpen = !this._cardBehaviorOpen;
        this._updateCardBehaviorUI();
      });
    }
    const headerSecHead = this.shadowRoot.getElementById("header-sec-head");
    if (headerSecHead) {
      headerSecHead.addEventListener("click", () => {
        this._headerSectionOpen = !this._headerSectionOpen;
        this._updateHeaderSectionUI();
      });
    }
    const imageHead = this.shadowRoot.getElementById("image-head");
    if (imageHead) {
      imageHead.addEventListener("click", () => {
        this._imageSectionOpen = !this._imageSectionOpen;
        this._updateImageSectionUI();
      });
    }
    const typoHead = this.shadowRoot.getElementById("typo-head");
    if (typoHead) {
      typoHead.addEventListener("click", () => {
        this._typoSectionOpen = !this._typoSectionOpen;
        this._updateTypographyUI();
      });
    }

    const weightOptions = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"].map(v => ({ value: v, label: v }));
    const styleOptions = [{ value: "normal", label: "Normal" }, { value: "italic", label: "Italic" }];

    ["name", "info"].forEach(type => {
      const weightSel = this.shadowRoot.getElementById(`header-${type}-weight-sel`);
      if (weightSel) {
        weightSel.hass = h;
        weightSel.selector = { select: { mode: "dropdown", options: weightOptions } };
        weightSel.value = this._config[`header_${type}_weight`] || (type === "name" ? "bold" : "normal");
        weightSel.addEventListener("value-changed", ev => {
          ev.stopPropagation();
          this._fire({ ...this._config, [`header_${type}_weight`]: ev.detail.value });
        });
      }
      const styleSel = this.shadowRoot.getElementById(`header-${type}-style-sel`);
      if (styleSel) {
        styleSel.hass = h;
        styleSel.selector = { select: { mode: "dropdown", options: styleOptions } };
        styleSel.value = this._config[`header_${type}_style`] || "normal";
        styleSel.addEventListener("value-changed", ev => {
          ev.stopPropagation();
          this._fire({ ...this._config, [`header_${type}_style`]: ev.detail.value });
        });
      }
      // Color text + picker
      const colorField = this.shadowRoot.getElementById(`header-${type}-color`);
      const colorPicker = this.shadowRoot.getElementById(`header-${type}-color-picker`);
      if (colorField) {
        colorField.value = this._config[`header_${type}_color`] || "";
        colorField.addEventListener("change", ev => {
          ev.stopPropagation();
          const val = trimStr(ev.target.value || "");
          const next = { ...this._config };
          if (val) next[`header_${type}_color`] = val;
          else delete next[`header_${type}_color`];
          this._fire(next);
          if (colorPicker) colorPicker.value = parseColorToPickerHex(val || "#ffffff");
        });
      }
      if (colorPicker) {
        colorPicker.value = parseColorToPickerHex(this._config[`header_${type}_color`] || "#ffffff");
        colorPicker.addEventListener("change", ev => {
          ev.stopPropagation();
          const val = ev.target.value;
          const next = { ...this._config, [`header_${type}_color`]: val };
          this._fire(next);
          if (colorField) colorField.value = val;
        });
      }
    });

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
        } else if (k === "header_height") {
          const raw = String(v ?? "").trim();
          if (raw === "") { delete c[k]; }
          else { const num = Number(raw); c[k] = Number.isFinite(num) && num >= 0 ? Math.round(num) : 120; }
        } else if (k === "header_name_size" || k === "header_info_size") {
          const raw = String(v ?? "").trim();
          if (raw === "") { delete c[k]; }
          else { const num = Number(raw); c[k] = Number.isFinite(num) && num > 0 ? Math.round(num) : undefined; if (c[k] === undefined) delete c[k]; }
        } else {
          c[k] = v;
        }
        this._fire(c);
        if (k === "color") this.updCp();
        if (k === "image") this.updPreview();
      });
    });
    const sensorsHead = this.shadowRoot.getElementById("sensors-head");
    if (sensorsHead) {
      sensorsHead.addEventListener("click", () => {
        this._sensorsSectionOpen = !this._sensorsSectionOpen;
        this._updateSensorsSectionUI();
      });
    }
    const windowAlwaysShowToggle = this.shadowRoot.getElementById("window-always-show");
    const windowClosedColorRow = this.shadowRoot.getElementById("window-closed-color-row");
    const syncWindowClosedRow = () => {
      if (windowClosedColorRow) windowClosedColorRow.style.display = (this._config?.window_always_show === true) ? "flex" : "none";
    };
    if (windowAlwaysShowToggle) {
      windowAlwaysShowToggle.checked = this._config?.window_always_show === true;
      syncWindowClosedRow();
      windowAlwaysShowToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        if (ev.target.checked) next.window_always_show = true;
        else delete next.window_always_show;
        this._fire(next);
        syncWindowClosedRow();
      });
    }
    const windowOpenColorField = this.shadowRoot.getElementById("window-open-color");
    const windowOpenColorPicker = this.shadowRoot.getElementById("window-open-color-picker");
    if (windowOpenColorField) {
      windowOpenColorField.value = this._config?.window_open_color || "";
      windowOpenColorField.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const val = trimStr(ev.target.value || "");
        const next = { ...this._config };
        if (val) next.window_open_color = val; else delete next.window_open_color;
        this._fire(next);
        if (windowOpenColorPicker) windowOpenColorPicker.value = parseColorToPickerHex(val || "#FFA000");
      });
    }
    if (windowOpenColorPicker) {
      windowOpenColorPicker.value = parseColorToPickerHex(this._config?.window_open_color || "#FFA000");
      windowOpenColorPicker.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const val = ev.target.value;
        this._fire({ ...this._config, window_open_color: val });
        if (windowOpenColorField) windowOpenColorField.value = val;
      });
    }
    const windowClosedColorField = this.shadowRoot.getElementById("window-closed-color");
    const windowClosedColorPicker = this.shadowRoot.getElementById("window-closed-color-picker");
    if (windowClosedColorField) {
      windowClosedColorField.value = this._config?.window_closed_color || "";
      windowClosedColorField.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const val = trimStr(ev.target.value || "");
        const next = { ...this._config };
        if (val) next.window_closed_color = val; else delete next.window_closed_color;
        this._fire(next);
        if (windowClosedColorPicker) windowClosedColorPicker.value = parseColorToPickerHex(val || "#9E9E9E");
      });
    }
    if (windowClosedColorPicker) {
      windowClosedColorPicker.value = parseColorToPickerHex(this._config?.window_closed_color || "#9E9E9E");
      windowClosedColorPicker.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const val = ev.target.value;
        this._fire({ ...this._config, window_closed_color: val });
        if (windowClosedColorField) windowClosedColorField.value = val;
      });
    }
    const badgesHead = this.shadowRoot.getElementById("badges-head");
    if (badgesHead) {
      badgesHead.addEventListener("click", () => {
        this._badgesSectionOpen = !this._badgesSectionOpen;
        this._updateBadgesUI();
      });
    }
    const nameOffsetSlider = this.shadowRoot.getElementById("name-offset-slider");
    if (nameOffsetSlider) {
      const INFO_SNAP = [0, 50, 100];
      const nameOffsetValue = this.shadowRoot.getElementById("name-offset-value");
      const INFO_SNAP_THRESHOLD = 5;
      nameOffsetSlider.value = String(this._config?.header_name_offset ?? 0);
      nameOffsetSlider.addEventListener("input", (ev) => {
        ev.stopPropagation();
        let val = parseInt(ev.target.value, 10);
        for (const p of INFO_SNAP) {
          if (Math.abs(val - p) <= INFO_SNAP_THRESHOLD) { val = p; break; }
        }
        ev.target.value = String(val);
        if (nameOffsetValue) nameOffsetValue.textContent = `${val}%`;
        const next = { ...this._config };
        if (val > 0) next.header_name_offset = val; else delete next.header_name_offset;
        if (this._config?.header_sync_offsets) {
          const infS = this.shadowRoot.getElementById("info-offset-slider");
          const infV = this.shadowRoot.getElementById("info-offset-value");
          if (infS) infS.value = String(val);
          if (infV) infV.textContent = `${val}%`;
          if (val > 0) next.header_info_offset = val; else delete next.header_info_offset;
        }
        this._fire(next);
      });
    }
    const infoOffsetSlider = this.shadowRoot.getElementById("info-offset-slider");
    if (infoOffsetSlider) {
      const infoOffsetValue = this.shadowRoot.getElementById("info-offset-value");
      const INFO_SNAP = [0, 50, 100];
      const INFO_SNAP_THRESHOLD = 5;
      infoOffsetSlider.value = String(this._config?.header_info_offset ?? 0);
      infoOffsetSlider.addEventListener("input", (ev) => {
        ev.stopPropagation();
        let val = parseInt(ev.target.value, 10);
        for (const p of INFO_SNAP) {
          if (Math.abs(val - p) <= INFO_SNAP_THRESHOLD) { val = p; break; }
        }
        ev.target.value = String(val);
        if (infoOffsetValue) infoOffsetValue.textContent = `${val}%`;
        const next = { ...this._config };
        if (val > 0) next.header_info_offset = val; else delete next.header_info_offset;
        if (this._config?.header_sync_offsets) {
          const namS = this.shadowRoot.getElementById("name-offset-slider");
          const namV = this.shadowRoot.getElementById("name-offset-value");
          if (namS) namS.value = String(val);
          if (namV) namV.textContent = `${val}%`;
          if (val > 0) next.header_name_offset = val; else delete next.header_name_offset;
        }
        this._fire(next);
      });
    }
    const syncOffsetsToggle = this.shadowRoot.getElementById("sync-offsets-toggle");
    if (syncOffsetsToggle) {
      syncOffsetsToggle.checked = this._config?.header_sync_offsets === true;
      syncOffsetsToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        if (ev.target.checked) {
          next.header_sync_offsets = true;
          // Auto-sync line to name position when turning on
          const val = this._config?.header_name_offset ?? 0;
          if (val > 0) next.header_info_offset = val; else delete next.header_info_offset;
        } else {
          delete next.header_sync_offsets;
        }
        this._fire(next);
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
    const showNameToggleEl = this.shadowRoot.getElementById("show-name-toggle");
    if (showNameToggleEl) {
      showNameToggleEl.checked = this._config?.show_name !== false;
      showNameToggleEl.addEventListener("change", (ev) => {
        ev.stopPropagation();
        this._fire({ ...this._config, show_name: ev.target.checked !== false });
      });
    }
    const collapsibleToggle = this.shadowRoot.getElementById("collapsible-toggle");
    const defaultStateRow = this.shadowRoot.getElementById("default-state-row");
    const defaultStateSel = this.shadowRoot.getElementById("default-state-sel");
    const updateDefaultStateVisibility = () => {
      if (!defaultStateRow) return;
      defaultStateRow.classList.toggle("hidden", !(this._config?.collapsible === true));
    };
    if (collapsibleToggle) {
      collapsibleToggle.checked = this._config?.collapsible === true;
      updateDefaultStateVisibility();
      collapsibleToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const enabled = ev.target.checked === true;
        this._fire({ ...this._config, collapsible: enabled || undefined });
        updateDefaultStateVisibility();
      });
    }
    if (defaultStateSel) {
      defaultStateSel.hass = h;
      defaultStateSel.selector = { select: { mode: "dropdown", options: [
        { value: "expanded", label: getTranslation(h, "state_expanded") },
        { value: "collapsed", label: getTranslation(h, "state_collapsed") }
      ] } };
      defaultStateSel.value = this._config?.default_state || "expanded";
      defaultStateSel.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const v = ev.detail?.value || "expanded";
        const next = { ...this._config };
        if (v === "collapsed") next.default_state = "collapsed";
        else delete next.default_state;
        this._fire(next);
      });
    }
    const standardBadgeBg = this.shadowRoot.getElementById("standard-badge-bg");
    const standardBadgeBgPicker = this.shadowRoot.getElementById("standard-badge-bg-picker");
    if (standardBadgeBg) {
      standardBadgeBg.value = this._config?.header_info_background || "";
      if (this._hass) standardBadgeBg.hass = this._hass;
      standardBadgeBg.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        const value = trimStr(ev.target.value || "");
        if (value) next.header_info_background = value;
        else delete next.header_info_background;
        this._fire(next);
        if (standardBadgeBgPicker) standardBadgeBgPicker.value = parseColorToPickerHex(value);
      });
    }
    if (standardBadgeBgPicker) {
      standardBadgeBgPicker.value = parseColorToPickerHex(this._config?.header_info_background);
      standardBadgeBgPicker.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const value = hexToRgba(ev.target.value, 0.35);
        const next = { ...this._config, header_info_background: value };
        this._fire(next);
        if (standardBadgeBg) standardBadgeBg.value = value;
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
    const globalIconSize = this.shadowRoot.getElementById("global-icon-size");
    if (globalIconSize) {
      const raw = trimStr(this._config?.global_icon_size) || "";
      globalIconSize.value = /^\d+(\.\d+)?(px)?$/.test(raw) ? raw.replace("px", "") : raw;
      globalIconSize.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const v = ev.target.value.trim();
        const next = { ...this._config };
        if (v) next.global_icon_size = v; else delete next.global_icon_size;
        this._fire(next);
        this.renBtn();
      });
    }
    const globalBtnBg = this.shadowRoot.getElementById("global-btn-bg");
    const globalBtnBgPicker = this.shadowRoot.getElementById("global-btn-bg-picker");
    if (globalBtnBg) {
      globalBtnBg.value = this._config?.global_button_background || "";
      globalBtnBg.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const v = ev.target.value.trim();
        const next = { ...this._config };
        if (v) next.global_button_background = v; else delete next.global_button_background;
        this._fire(next);
        this.renBtn();
      });
      if (globalBtnBgPicker) {
        globalBtnBgPicker.value = parseColorToPickerHex(this._config?.global_button_background || "#ffffff");
        globalBtnBgPicker.addEventListener("input", (ev) => {
          ev.stopPropagation();
          const v = ev.target.value;
          if (globalBtnBg.value !== v) globalBtnBg.value = v;
          const next = { ...this._config, global_button_background: v };
          this._fire(next);
          this.renBtn();
        });
      }
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
      // Native <select>: immune to ha-selector/hass-update resets
      tmplSelect.innerHTML = this._getControlTemplates()
        .map((t) => `<option value="${t.id}">${t.label}</option>`)
        .join("");
      tmplSelect.value = this._quickAddType;
      tmplSelect.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const tid = ev.target.value;
        if (!tid) return;
        this._quickAddType = tid;
        const template = this._getTemplateById(tid);
        const domains = template?.domains || [];
        this._quickAddEntity = "";
        if (tmplEntity) { tmplEntity.selector = domains.length > 0 ? { entity: { domain: domains } } : { entity: {} }; }
        updateQuickAddHints();
      });
    }
    if (tmplEntity && this._hass) tmplEntity.hass = this._hass;
    if (tmplEntity) {
      const template = this._getTemplateById(this._quickAddType);
      const domains = template?.domains || [];
      tmplEntity.selector = domains.length > 0 ? { entity: { domain: domains } } : { entity: {} };
      tmplEntity.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._quickAddEntity = ev.detail?.value ?? "";
        updateQuickAddHints();
      });
      updateQuickAddHints();
    }
    const addTemplateBtn = this.shadowRoot.getElementById("add-template");
    if (addTemplateBtn) {
      addTemplateBtn.addEventListener("click", () => {
        const tid = this._quickAddType || "light";
        const ent = this._quickAddEntity || "";
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
      let ent = "", n = "";
      if (c.length === 0 && this._config.entity) {
        ent = this._config.entity;
        if (this._hass?.states[ent]) {
          n = this._hass.states[ent].attributes.friendly_name || "";
        }
      }
      const addDomain = ent.split(".")[0];
      const newCtrl = { entity: ent, name: n, width: w, height: 60 };
      if (!DOMAIN_STATE_ICON_MAPS[addDomain]) {
        newCtrl.icon = this._hass?.states[ent]?.attributes?.icon || this._iconForEntity(ent) || "mdi:lightbulb";
      }
      c.push(newCtrl);
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
    this._updateSensorsSectionUI();
    this._updateImageSectionUI();
    this._updateTypographyUI();
    this._updateBadgesUI();
    this._updateCardBehaviorUI();
    this._updateHeaderSectionUI();
  }

  _updateTabUI() {
    const configPanel = this.shadowRoot?.getElementById("tab-config-panel");
    const buttonsPanel = this.shadowRoot?.getElementById("tab-buttons-panel");
    const configBtn = this.shadowRoot?.getElementById("tab-config-btn");
    const buttonsBtn = this.shadowRoot?.getElementById("tab-buttons-btn");
    const isConfig = this._activeTab !== "buttons";
    if (configPanel) configPanel.hidden = !isConfig;
    if (buttonsPanel) buttonsPanel.hidden = isConfig;
    if (configBtn) configBtn.classList.toggle("active", isConfig);
    if (buttonsBtn) buttonsBtn.classList.toggle("active", !isConfig);
  }

  _updateCardBehaviorUI() {
    const content = this.shadowRoot?.getElementById("card-beh-content");
    const chev = this.shadowRoot?.getElementById("card-beh-chev");
    if (content) content.hidden = !this._cardBehaviorOpen;
    if (chev) chev.style.transform = this._cardBehaviorOpen ? "rotate(90deg)" : "";
  }

  _updateHeaderSectionUI() {
    const content = this.shadowRoot?.getElementById("header-sec-content");
    const chev = this.shadowRoot?.getElementById("header-sec-chev");
    if (content) content.hidden = !this._headerSectionOpen;
    if (chev) chev.style.transform = this._headerSectionOpen ? "rotate(90deg)" : "";
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

  _updateSensorsSectionUI() {
    const sec = this.shadowRoot?.getElementById("sensors-sec");
    const content = this.shadowRoot?.getElementById("sensors-content");
    const title = this.shadowRoot?.getElementById("sensors-title");
    if (!sec || !content || !title) return;
    const c = this._config || {};
    const count = [
      c.temp_sensor,
      c.target_temp_sensor,
      c.humid_sensor,
      ...(Array.isArray(c.window_sensors) ? c.window_sensors : []),
      ...(Array.isArray(c.battery_sensors) ? c.battery_sensors : [])
    ].filter((v) => v && String(v).trim() !== "").length;
    const label = getTranslation(this._hass, "sensors");
    title.textContent = count > 0 ? `${label} (${count})` : label;
    sec.classList.toggle("open", this._sensorsSectionOpen);
    content.hidden = !this._sensorsSectionOpen;
  }

  _updateBadgesUI() {
    const sec = this.shadowRoot?.getElementById("badges-sec");
    const content = this.shadowRoot?.getElementById("badges-content");
    const title = this.shadowRoot?.getElementById("badges-title");
    if (!sec || !content || !title) return;

    const h = this._hass;
    const badges = Array.isArray(this._config?.header_badges) ? this._config.header_badges : [];
    const sectionLabel = getTranslation(h, "header_badges");
    title.textContent = badges.length > 0 ? `${sectionLabel} (${badges.length})` : sectionLabel;
    sec.classList.toggle("open", this._badgesSectionOpen);
    content.hidden = !this._badgesSectionOpen;

    const addBtn = content.querySelector("#add-badge");
    if (addBtn) addBtn.label = getTranslation(h, "badge_add");

    if (!this._badgesSectionOpen) return;

    const list = content.querySelector("#badges-list");
    if (!list) return;

    const updBadge = (idx, key, val) => {
      const arr = [...(this._config?.header_badges || [])];
      arr[idx] = { ...arr[idx], [key]: val };
      this._fire({ ...this._config, header_badges: arr });
      this._updateBadgesUI();
    };
    const delBadge = (idx) => {
      const arr = [...(this._config?.header_badges || [])];
      arr.splice(idx, 1);
      const next = { ...this._config };
      if (arr.length > 0) next.header_badges = arr; else delete next.header_badges;
      this._fire(next);
      this._updateBadgesUI();
    };

    list.replaceChildren();

    badges.forEach((badge, idx) => {
      const box = document.createElement("div");
      box.className = "badge-box";

      const headRow = document.createElement("div");
      headRow.className = "badge-head-row";
      const entityLabel = document.createElement("span");
      entityLabel.className = "badge-entity-label";
      entityLabel.textContent = badge.entity || `Info ${idx + 1}`;
      const delBtn = document.createElement("button");
      delBtn.className = "badge-del-btn";
      delBtn.type = "button";
      delBtn.innerHTML = `<ha-icon icon="mdi:delete-outline"></ha-icon>`;
      delBtn.addEventListener("click", () => delBadge(idx));
      headRow.appendChild(entityLabel);
      headRow.appendChild(delBtn);
      box.appendChild(headRow);

      const ep = document.createElement("ha-entity-picker");
      ep.label = getTranslation(h, "entity");
      ep.value = badge.entity || "";
      if (h) ep.hass = h;
      ep.style.cssText = "width:100%;display:block;margin-bottom:8px;";
      ep.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        updBadge(idx, "entity", ev.detail?.value ?? "");
      });
      box.appendChild(ep);

      const lf = document.createElement("ha-textfield");
      lf.label = getTranslation(h, "badge_label");
      lf.placeholder = h?.states[badge.entity]?.attributes?.friendly_name || "";
      lf.value = badge.label || "";
      lf.style.cssText = "width:100%;display:block;margin-bottom:8px;";
      lf.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const v = ev.target.value || "";
        const arr = [...(this._config?.header_badges || [])];
        const next = { ...arr[idx] };
        if (v) next.label = v; else delete next.label;
        arr[idx] = next;
        this._fire({ ...this._config, header_badges: arr });
      });
      box.appendChild(lf);

      const bgRow = document.createElement("div");
      bgRow.className = "cl-row";
      bgRow.style.marginBottom = "8px";

      const bgField = document.createElement("ha-textfield");
      bgField.label = getTranslation(h, "badge_background");
      bgField.placeholder = "rgba(255,255,255,0.25)";
      bgField.value = badge.background || "";
      bgField.style.flex = "1";
      bgField.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const v = trimStr(ev.target.value || "");
        const arr = [...(this._config?.header_badges || [])];
        const next = { ...arr[idx] };
        if (v) next.background = v; else delete next.background;
        arr[idx] = next;
        this._fire({ ...this._config, header_badges: arr });
      });
      bgRow.appendChild(bgField);

      const bgPicker = document.createElement("input");
      bgPicker.type = "color";
      bgPicker.className = "cp";
      bgPicker.value = parseColorToPickerHex(badge.background);
      bgPicker.addEventListener("change", (ev) => {
        ev.stopPropagation();
        updBadge(idx, "background", hexToRgba(ev.target.value, 0.35));
      });
      bgRow.appendChild(bgPicker);

      box.appendChild(bgRow);

      const showNameWrap = document.createElement("div");
      showNameWrap.style.cssText = "margin-top:4px;";
      const showNameField = document.createElement("ha-formfield");
      showNameField.label = getTranslation(h, "show_name");
      const showNameToggle = document.createElement("ha-switch");
      showNameToggle.checked = badge.show_name !== false;
      showNameToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        updBadge(idx, "show_name", ev.target.checked !== false);
      });
      showNameField.appendChild(showNameToggle);
      showNameWrap.appendChild(showNameField);
      box.appendChild(showNameWrap);

      list.appendChild(box);
    });

    // Wire up add-badge button using onclick to avoid listener accumulation
    if (addBtn) {
      addBtn.onclick = () => {
        const arr = [...(this._config?.header_badges || [])];
        arr.push({ entity: "", show_name: true });
        this._badgesSectionOpen = true;
        this._fire({ ...this._config, header_badges: arr });
        this._updateBadgesUI();
      };
    }
  }

  _updateTypographyUI() {
    const sec = this.shadowRoot?.getElementById("typo-sec");
    const content = this.shadowRoot?.getElementById("typo-content");
    if (!sec || !content) return;
    sec.classList.toggle("open", this._typoSectionOpen === true);
    content.hidden = this._typoSectionOpen !== true;
    // Sync weight/style/color to current config
    ["name", "info"].forEach(type => {
      const w = this.shadowRoot.getElementById(`header-${type}-weight-sel`);
      if (w) {
        const val = this._config?.[`header_${type}_weight`] || (type === "name" ? "bold" : "normal");
        if (w.value !== val) w.value = val;
      }
      const s = this.shadowRoot.getElementById(`header-${type}-style-sel`);
      if (s) {
        const val = this._config?.[`header_${type}_style`] || "normal";
        if (s.value !== val) s.value = val;
      }
      const cf = this.shadowRoot.getElementById(`header-${type}-color`);
      if (cf) {
        const val = this._config?.[`header_${type}_color`] || "";
        if (cf.value !== val) cf.value = val;
      }
      const cp = this.shadowRoot.getElementById(`header-${type}-color-picker`);
      if (cp) {
        const val = parseColorToPickerHex(this._config?.[`header_${type}_color`] || "#ffffff");
        if (cp.value !== val) cp.value = val;
      }
    });
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
      box.dataset.controlId = key;
      box.addEventListener("pointerdown", () => { this._lastInteractedControlId = key; });
      box.addEventListener("focusin", () => { this._lastInteractedControlId = key; });
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
          <div class="cl-row"><ha-textfield class="bg-txt" label="${getTranslation(h, "button_bg")}"></ha-textfield><input type="color" class="cp bg-cp"></div>
        </div>
        <details class="tmpl-only tmpl-details ${showTemplate}" ${isTemplate ? "open" : ""}>
          <summary>${getTranslation(h, "type_template")}</summary>
          <ha-textfield class="tc" label="${getTranslation(h, "tmpl_content")}"></ha-textfield>
          <div class="row"><ha-textfield class="ti" label="${getTranslation(h, "tmpl_icon")}"></ha-textfield><ha-textfield class="tcl" label="${getTranslation(h, "tmpl_color")}"></ha-textfield></div>
          <ha-textfield class="ts" label="${getTranslation(h, "tmpl_state")}"></ha-textfield>
          <div class="tmpl-preview"><span>${getTranslation(h, "tmpl_preview")}:</span> <ha-icon class="tp-ic"></ha-icon> <span class="tp-tx"></span></div>
        </details>
        <div class="row" style="margin-top:8px; align-items:center"><ha-selector class="al" label="${getTranslation(h, "align")}"></ha-selector><ha-selector class="lp" label="${getTranslation(h, "label_position")}"></ha-selector><ha-selector class="tl" label="${getTranslation(h, "text_layout")}"></ha-selector><ha-formfield label="${getTranslation(h, "show_state")}"><ha-switch class="ss" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_label")}"><ha-switch class="sl" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_icon")}"><ha-switch class="si" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "visible")}"><ha-switch class="hd" checked></ha-switch></ha-formfield></div>
        <div class="entity-only ${hideEntity}" style="margin-top:12px; border-top:1px solid var(--divider-color); padding-top:12px"><ha-textfield class="isz" label="${getTranslation(h, "icon_size")}" type="number" style="max-width:120px" placeholder="20"></ha-textfield><ha-selector class="cm" label="${getTranslation(h, "control_mode")}"></ha-selector><ha-selector class="tap" label="${getTranslation(h, "tap_action")}"></ha-selector><ha-textfield class="tap-nav ${showNav}" label="Nav Pfad"></ha-textfield><ha-selector class="hold" label="${getTranslation(h, "hold_action")}"></ha-selector><ha-selector class="dbl" label="${getTranslation(h, "double_tap_action")}"></ha-selector></div>
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
        const val = e.detail.value; const st = h.states[val]; const c = [...this._config.controls];
        const epDomain = val?.split(".")[0] || "";
        let next = { ...c[i], entity: val };
        if (st?.attributes?.friendly_name) next.name = st.attributes.friendly_name;
        if (DOMAIN_STATE_ICON_MAPS[epDomain]) {
          delete next.icon; // clear static icon — let domain state map resolve dynamically
        } else {
          next.icon = st?.attributes?.icon || this._iconForEntity(val);
        }
        keepOpen(); c[i] = next; this._fire({ ...this._config, controls: c }); this.renBtn();
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
      const clp = box.querySelector(".cl-p"); if (clp) { clp.value = parseColorToPickerHex(ctrl.color || "#000000"); clp.addEventListener("input", e => { if (cl) cl.value = e.target.value; upd("color", e.target.value); }); }
      const bgTxt = box.querySelector(".bg-txt"); if (bgTxt) { bgTxt.value = ctrl.button_background || ""; bgTxt.addEventListener("change", e => { upd("button_background", e.target.value); this.renBtn(); }); }
      const bgCp = box.querySelector(".bg-cp"); if (bgCp) { bgCp.value = parseColorToPickerHex(ctrl.button_background || "#ffffff"); bgCp.addEventListener("input", e => { if (bgTxt) bgTxt.value = e.target.value; upd("button_background", e.target.value); this.renBtn(); }); }
      const isz = box.querySelector(".isz"); if (isz) {
        const rawIsz = trimStr(ctrl.icon_size) || "";
        isz.value = /^\d+(\.\d+)?(px)?$/.test(rawIsz) ? rawIsz.replace("px", "") : rawIsz;
        isz.addEventListener("change", e => { e.stopPropagation(); const v = e.target.value.trim(); upd("icon_size", v || undefined); this.renBtn(); });
      }
      // Color Map section
      if (!isTemplate) {
        const entityOnly = box.querySelector(".entity-only");
        if (entityOnly) {
          const cmSec = document.createElement("div");
          cmSec.style.cssText = "margin-top:8px;border-top:1px solid var(--divider-color);padding-top:8px;";
          const cmTitle = document.createElement("div");
          cmTitle.className = "tmpl-label";
          cmTitle.style.marginBottom = "6px";
          cmTitle.textContent = getTranslation(h, "color_map");
          cmSec.appendChild(cmTitle);
          const cmList = document.createElement("div");
          cmSec.appendChild(cmList);
          const normMap = ctrl.color_map
            ? Object.fromEntries(Object.entries(ctrl.color_map).map(([k, v]) => [k === true ? "on" : k === false ? "off" : String(k), v]))
            : {};
          Object.entries(normMap).forEach(([state, color]) => {
            const row = document.createElement("div");
            row.className = "cl-row";
            row.style.cssText = "margin-bottom:6px;align-items:center;";
            const stateField = document.createElement("ha-textfield");
            stateField.label = getTranslation(h, "color_map_state");
            stateField.value = state;
            stateField.style.cssText = "flex:1;margin-bottom:0;";
            stateField.addEventListener("change", ev => {
              ev.stopPropagation();
              const newKey = ev.target.value.trim();
              const c = [...this._config.controls];
              const oldMap = Object.fromEntries(Object.entries(c[i]?.color_map || {}).map(([k, v]) => [k === true ? "on" : k === false ? "off" : String(k), v]));
              const colorVal = oldMap[state] ?? color;
              delete oldMap[state];
              if (newKey) oldMap[newKey] = colorVal;
              const next = { ...c[i] };
              if (Object.keys(oldMap).length > 0) next.color_map = oldMap; else delete next.color_map;
              c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c }); this.renBtn();
            });
            const colorField = document.createElement("ha-textfield");
            colorField.label = getTranslation(h, "color");
            colorField.value = typeof color === "string" ? color : "";
            colorField.style.cssText = "flex:1;margin-bottom:0;";
            colorField.addEventListener("change", ev => {
              ev.stopPropagation();
              const c = [...this._config.controls];
              const newMap = Object.fromEntries(Object.entries(c[i]?.color_map || {}).map(([k, v]) => [k === true ? "on" : k === false ? "off" : String(k), v]));
              newMap[state] = ev.target.value;
              c[i] = { ...c[i], color_map: newMap }; keepOpen(); this._fire({ ...this._config, controls: c });
              if (cmPicker) cmPicker.value = parseColorToPickerHex(ev.target.value);
            });
            const cmPicker = document.createElement("input");
            cmPicker.type = "color";
            cmPicker.className = "cp";
            cmPicker.value = parseColorToPickerHex(typeof color === "string" ? color : "#000000");
            cmPicker.addEventListener("change", ev => {
              ev.stopPropagation();
              const c = [...this._config.controls];
              const newMap = Object.fromEntries(Object.entries(c[i]?.color_map || {}).map(([k, v]) => [k === true ? "on" : k === false ? "off" : String(k), v]));
              newMap[state] = ev.target.value;
              c[i] = { ...c[i], color_map: newMap }; keepOpen(); this._fire({ ...this._config, controls: c });
              colorField.value = ev.target.value;
            });
            const delCmBtn = document.createElement("button");
            delCmBtn.type = "button";
            delCmBtn.className = "badge-del-btn";
            delCmBtn.innerHTML = `<ha-icon icon="mdi:delete-outline"></ha-icon>`;
            delCmBtn.addEventListener("click", ev => {
              ev.stopPropagation();
              const c = [...this._config.controls];
              const newMap = Object.fromEntries(Object.entries(c[i]?.color_map || {}).map(([k, v]) => [k === true ? "on" : k === false ? "off" : String(k), v]));
              delete newMap[state];
              const next = { ...c[i] };
              if (Object.keys(newMap).length > 0) next.color_map = newMap; else delete next.color_map;
              c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c }); this.renBtn();
            });
            row.appendChild(stateField); row.appendChild(colorField); row.appendChild(cmPicker); row.appendChild(delCmBtn);
            cmList.appendChild(row);
          });
          const addCmBtn = document.createElement("mwc-button");
          addCmBtn.setAttribute("raised", "");
          addCmBtn.setAttribute("label", getTranslation(h, "color_map_add"));
          addCmBtn.innerHTML = `<ha-icon icon="mdi:plus" slot="icon"></ha-icon>`;
          addCmBtn.addEventListener("click", ev => {
            ev.stopPropagation();
            const c = [...this._config.controls];
            const newMap = Object.fromEntries(Object.entries(c[i]?.color_map || {}).map(([k, v]) => [k === true ? "on" : k === false ? "off" : String(k), v]));
            let newKey = "state"; let idx = 1;
            while (newKey in newMap) { newKey = `state${idx++}`; }
            newMap[newKey] = "#ffffff";
            c[i] = { ...c[i], color_map: newMap }; keepOpen(); this._fire({ ...this._config, controls: c }); this.renBtn();
          });
          cmSec.appendChild(addCmBtn);
          entityOnly.appendChild(cmSec);
        }
      }
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
      const cm = box.querySelector(".cm"); if (cm) { cm.hass = h; cm.selector = { select: { mode: "dropdown", options: [
        { value: "none", label: getTranslation(h, "ctrl_default") },
        { value: "slider", label: getTranslation(h, "ctrl_slider") },
        { value: "buttons", label: getTranslation(h, "ctrl_buttons") }
      ] } };
      cm.value = ctrl.control_mode || "none"; cm.addEventListener("value-changed", e => { e.stopPropagation(); const v = e.detail.value; const cc = [...this._config.controls]; const nn = { ...cc[i] }; if (v && v !== "none") nn.control_mode = v; else delete nn.control_mode; cc[i] = nn; keepOpen(); this._fire({ ...this._config, controls: cc }); }); }
      const tpIcon = box.querySelector(".tp-ic");
      const tpText = box.querySelector(".tp-tx");
      if (tpIcon && tpText && isTemplate) {
        const prev = resolveTemplateCtrl(ctrl, h);
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
    const showNameToggle = this.shadowRoot.getElementById("show-name-toggle");
    if (showNameToggle) {
      const v = this._config?.show_name !== false;
      if (showNameToggle.checked !== v) showNameToggle.checked = v;
    }
    const standardBadgeBg = this.shadowRoot.getElementById("standard-badge-bg");
    if (standardBadgeBg) {
      const v = this._config?.header_info_background || "";
      if (standardBadgeBg.value !== v) standardBadgeBg.value = v;
    }
    const standardBadgeBgPicker = this.shadowRoot.getElementById("standard-badge-bg-picker");
    if (standardBadgeBgPicker) {
      const v = parseColorToPickerHex(this._config?.header_info_background);
      if (standardBadgeBgPicker.value !== v) standardBadgeBgPicker.value = v;
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
    const collapsibleToggle = this.shadowRoot.getElementById("collapsible-toggle");
    if (collapsibleToggle) {
      const v = this._config?.collapsible === true;
      if (collapsibleToggle.checked !== v) collapsibleToggle.checked = v;
    }
    const defaultStateRow = this.shadowRoot.getElementById("default-state-row");
    if (defaultStateRow) defaultStateRow.classList.toggle("hidden", !(this._config?.collapsible === true));
    const defaultStateSel = this.shadowRoot.getElementById("default-state-sel");
    if (defaultStateSel) {
      const v = this._config?.default_state || "expanded";
      if (defaultStateSel.value !== v) defaultStateSel.value = v;
    }
    ["name", "info"].forEach(type => {
        const w = this.shadowRoot.getElementById(`header-${type}-weight-sel`);
        if (w) w.value = this._config[`header_${type}_weight`] || (type === "name" ? "bold" : "normal");
        const s = this.shadowRoot.getElementById(`header-${type}-style-sel`);
        if (s) s.value = this._config[`header_${type}_style`] || "normal";
        const cf = this.shadowRoot.getElementById(`header-${type}-color`);
        if (cf) { const v = this._config[`header_${type}_color`] || ""; if (cf.value !== v) cf.value = v; }
        const cp = this.shadowRoot.getElementById(`header-${type}-color-picker`);
        if (cp) { const v = parseColorToPickerHex(this._config[`header_${type}_color`] || "#ffffff"); if (cp.value !== v) cp.value = v; }
    });
    const windowAlwaysShowToggle = this.shadowRoot.getElementById("window-always-show");
    if (windowAlwaysShowToggle) {
      const v = this._config?.window_always_show === true;
      if (windowAlwaysShowToggle.checked !== v) windowAlwaysShowToggle.checked = v;
      const cr = this.shadowRoot.getElementById("window-closed-color-row");
      if (cr) cr.style.display = v ? "flex" : "none";
    }
    const windowOpenColorPicker = this.shadowRoot.getElementById("window-open-color-picker");
    if (windowOpenColorPicker) {
      const v = parseColorToPickerHex(this._config?.window_open_color || "#FFA000");
      if (windowOpenColorPicker.value !== v) windowOpenColorPicker.value = v;
    }
    const windowClosedColorPicker = this.shadowRoot.getElementById("window-closed-color-picker");
    if (windowClosedColorPicker) {
      const v = parseColorToPickerHex(this._config?.window_closed_color || "#9E9E9E");
      if (windowClosedColorPicker.value !== v) windowClosedColorPicker.value = v;
    }
    const infoOffsetSlider = this.shadowRoot.getElementById("info-offset-slider");
    if (infoOffsetSlider) {
      const infoOffsetValue = this.shadowRoot.getElementById("info-offset-value");
      const v = String(this._config?.header_info_offset ?? 0);
      if (infoOffsetSlider.value !== v) infoOffsetSlider.value = v;
      if (infoOffsetValue) infoOffsetValue.textContent = `${v}%`;
    }
    const nameOffsetSlider = this.shadowRoot.getElementById("name-offset-slider");
    if (nameOffsetSlider) {
      const nameOffsetValue = this.shadowRoot.getElementById("name-offset-value");
      const v = String(this._config?.header_name_offset ?? 0);
      if (nameOffsetSlider.value !== v) nameOffsetSlider.value = v;
      if (nameOffsetValue) nameOffsetValue.textContent = `${v}%`;
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
  const methods = ["render", "updVal", "updCp", "renBtn", "setConfig", "_fire", "_handleUpload", "updPreview", "connectedCallback", "disconnectedCallback", "_ensureEditorState", "_emitConfigNow", "_flushPendingConfig", "_handlePrimarySave", "_updateBadgesUI", "_updateTypographyUI", "_updateCardBehaviorUI", "_updateHeaderSectionUI", "_updateTabUI", "_updateSensorsSectionUI", "_areAllButtonsExpanded", "_toggleAllButtonsExpanded"];
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

window.customCards = window.customCards || [];
window.customCards.push({
  type: "oneline-room-card",
  name: "OneLine Room Card",
  preview: true,
  description: "Minimalist Room Card for Home Assistant"
});
