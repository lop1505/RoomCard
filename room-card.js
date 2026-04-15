const VERSION = "1.2.5";
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
    show_state: "Show State", show_label: "Show Label", show_icon: "Show Icon", show_last_changed: "Last Changed", lc_just_now: "just now", state_first: "State First", text_layout: "Text Order", primary_text: "First line", primary_state: "State / value first", primary_name: "Name first",
    height: "Height", width: "Width", align: "Align", visible: "Visible", left: "Left", center: "Center", right: "Right",
    tap_action: "Tap Action", hold_action: "Hold Action", double_tap_action: "Double Tap Action",
    actions: "Actions",
    act_more: "Details (Default)", act_toggle: "Toggle", act_navigate: "Navigate", act_call_service: "Action (service)", act_none: "None",
    service: "Service (domain.service)", service_data: "Service Data (JSON)", target_entity: "Target entity",
    live_preview: "Live preview",
    upload_btn: "Upload Image", uploading: "Uploading...", upload_success: "Done!",
    show_name: "Show Title", header_badges: "Badge", badge_add: "Add Info Entry", badge_label: "Label (optional)", badge_background: "Background (rgba)", standard_badge_background: "Standard Badge Background (rgba)", badge_auto_climate_btn: "Automatically add climate control button",
    visibility: "Visibility", visibility_cond: "Conditional Visibility", vis_entity: "Condition Entity", vis_state: "Show if state is", vis_invert: "Invert Logic (Hide if state corresponds)",
    migration_title: "Action Required",
    migration_text: "Card renamed to <b>oneline-room-card</b> to avoid conflicts.<br>Please change <code>type: custom:room-card</code> to <code>type: custom:oneline-room-card</code> in your YAML.",
    control_mode: "Control Mode", ctrl_default: "Default", ctrl_slider: "Inline Slider", ctrl_buttons: "Inline Buttons",
    slider_mode: "Slider Mode", slider_mode_brightness: "Brightness", slider_mode_color_temp: "Color Temperature",
    slider_style: "Slider Style", style_inline: "Inline", style_bg: "Background",
    collapsible: "Collapsible", default_state: "Default State", state_expanded: "Expanded", state_collapsed: "Collapsed",
    header_height: "Header Height (px)",
    typography: "Header Typography", name_font: "Room Name Font", info_font: "Info Line Font",
    font_size: "Size (px)", font_weight: "Weight", font_style: "Style", font_color: "Color", badge_bg: "Badge Background",
    card_behavior: "Card Behavior", behavior: "Collapse Mode", behavior_fixed: "Disabled", behavior_collapsed: "Collapsed", behavior_expanded: "Expanded", behavior_remember: "Remember",
    header: "Header", configuration: "Configuration",
    color_map: "State Colors", color_map_add: "Add State Color", color_map_state: "State",
    window_always_show: "Always Show (incl. closed)", window_open_color: "Open Color", window_closed_color: "Closed Color",
    sensors: "Sensors",
    icon_size: "Icon Size", global_icon_size: "Global Icon Size (px)",
    header_info_offset: "Info Line Position",
    header_name_offset: "Title Position",
    header_sync_offsets: "Synchronize Positions",
    global_button_bg: "Global Button Background",
    button_bg: "Button Background Color",
    show_cover_presets: "Position Presets",
    cover_presets_label: "Preset Values (comma-separated)",
    show_climate_presets: "Temperature Presets",
    climate_presets_label: "Temperatures (comma-separated)",
    show_color_favorites: "Color Favorites",
    color_favorites_label: "Colors ('#hex' or 'r,g,b', comma-separated)",
    sub_chips: "Sub-Chips", chip_add: "Add Chip", chip_entity: "Entity", chip_attribute: "Attribute (optional)", chip_icon: "Icon (optional)", chip_label: "Label (optional)", chips_position: "Chip Position", chips_top: "Above title", chips_bottom: "Below title",
    vis_add: "Add Condition", vis_eq: "State is equal", vis_neq: "State is not equal", vis_above: "State is strictly greater than", vis_below: "State is strictly less than",
    info_line_position: "Info Line Position", info_position_header: "Inside header (default)", info_position_below: "Below header",
    last_activity_title: "Last Activity", last_activity_show: "Show last activity"
  },
  de: {
    empty: "Leer", low: "Niedrig", critical: "Kritisch", window: "Fenster", general: "Allgemein",
    sensors_manual: "Sensoren (Manuell)", buttons: "Buttons", button: "Button", add_button: "Button hinzufügen",
    main_climate: "Haupt-Klima-Gerät", climate_info: "Füllt Temp/Feuchtigkeit automatisch, wenn unten leer.",
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
    tmpl_content: "Text (Template)", tmpl_icon: "Icon (Template)", tmpl_color: "Farbe (Template)", tmpl_status: "Status (Template)", tmpl_preview: "Vorschau",
    tmpl_light: "Licht", tmpl_switch: "Schalter / Steckdose", tmpl_climate: "Klima", tmpl_cover: "Rollladen / Abdeckung", tmpl_media: "Media Player",
    show_state: "Status anzeigen", show_label: "Bezeichnung anzeigen", show_icon: "Icon anzeigen", show_last_changed: "Letzte Änderung", lc_just_now: "gerade eben", state_first: "Wert zuerst", text_layout: "Text-Reihenfolge", primary_text: "Erste Zeile", primary_state: "Wert zuerst", primary_name: "Name zuerst",
    height: "Höhe", width: "Breite", align: "Ausrichtung", visible: "Sichtbar", left: "Links", center: "Mitte", right: "Rechts",
    tap_action: "Antippen", hold_action: "Gedrückt halten", double_tap_action: "Doppelklick",
    actions: "Aktionen",
    act_more: "Details (Standard)", act_toggle: "Umschalten", act_navigate: "Navigieren", act_call_service: "Aktion (service)", act_none: "Nichts",
    service: "Service (domain.service)", service_data: "Service Daten (JSON)", target_entity: "Ziel-Entität",
    live_preview: "Live-Vorschau",
    upload_btn: "Bild hochladen", uploading: "Wird hochgeladen...", upload_success: "Fertig!",
    show_name: "Titel anzeigen", header_badges: "Badge", badge_add: "Info-Eintrag hinzufügen", badge_label: "Bezeichnung (optional)", badge_background: "Hintergrund (rgba)", standard_badge_background: "Standard Badge Hintergrund (rgba)", badge_auto_climate_btn: "Klima-Steuerungs-Button automatisch hinzufügen",
    visibility: "Sichtbarkeit", visibility_cond: "Bedingte Sichtbarkeit", vis_entity: "Bedingungs-Entität", vis_state: "Anzeigen falls Status gleich", vis_invert: "Logik umkehren (Ausblenden falls entsprechend)",
    migration_title: "Handlung erforderlich",
    migration_text: "Karte wurde in <b>oneline-room-card</b> umbenannt.<br>Bitte ändere <code>type: custom:room-card</code> zu <code>type: custom:oneline-room-card</code> in deiner YAML-Konfiguration.",
    control_mode: "Steuerungsmodus", ctrl_default: "Standard", ctrl_slider: "Inline-Slider", ctrl_buttons: "Inline-Buttons",
    slider_mode: "Slider Modus", slider_mode_brightness: "Helligkeit", slider_mode_color_temp: "Farbtemperatur",
    slider_style: "Slider Stil", style_inline: "Inline", style_bg: "Hintergrund",
    collapsible: "Einklappbar", default_state: "Standardzustand", state_expanded: "Ausgeklappt", state_collapsed: "Eingeklappt",
    header_height: "Kopfzeilenhöhe (px)",
    typography: "Header Typografie", name_font: "Raumname Schrift", info_font: "Info-Zeile Schrift",
    font_size: "Größe (px)", font_weight: "Gewicht", font_style: "Stil", font_color: "Farbe", badge_bg: "Badge Hintergrund",
    card_behavior: "Kartenverhalten", behavior: "Einklapp-Modus",
    behavior_fixed: "Deaktiviert",
    behavior_collapsed: "Eingeklappt",
    behavior_expanded: "Ausgeklappt",
    behavior_remember: "Remember",
    header: "Header", configuration: "Konfiguration",
    color_map: "Zustandsfarben", color_map_add: "Farbe hinzufügen", color_map_state: "Zustand",
    window_always_show: "Immer anzeigen (auch geschlossen)", window_open_color: "Farbe geöffnet", window_closed_color: "Farbe geschlossen",
    sensors: "Sensoren",
    icon_size: "Icon-Größe", global_icon_size: "Globale Icon-Größe (px)",
    header_info_offset: "Info-Zeile Position",
    header_name_offset: "Titel Position",
    header_sync_offsets: "Synchron Bewegen",
    global_button_bg: "Globaler Button Hintergrund",
    button_bg: "Button Hintergrund Farbe",
    show_cover_presets: "Positions-Voreinstellungen",
    cover_presets_label: "Voreinstellungen (kommagetrennt)",
    show_climate_presets: "Temperatur-Voreinstellungen",
    climate_presets_label: "Temperaturen (kommagetrennt)",
    show_color_favorites: "Lieblings-Farben",
    color_favorites_label: "Farben ('#hex' oder 'r,g,b', kommagetrennt)",
    sub_chips: "Sub-Chips", chip_add: "Chip hinzufügen", chip_entity: "Entität", chip_attribute: "Attribut (optional)", chip_icon: "Icon (optional)", chip_label: "Bezeichnung (optional)", chips_position: "Chip-Position", chips_top: "Über dem Titel", chips_bottom: "Unter dem Titel",
    vis_add: "Bedingung hinzufügen", vis_eq: "Zustand ist gleich", vis_neq: "Zustand ist nicht gleich", vis_above: "Numerisch größer als", vis_below: "Numerisch kleiner als",
    info_line_position: "Info-Zeile Position", info_position_header: "Im Header (Standard)", info_position_below: "Unter dem Header",
    last_activity_title: "Letzte Aktivität", last_activity_show: "Letzte Aktivität anzeigen"
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
    show_state: "Afficher l’état", show_label: "Afficher le libellé", show_icon: "Afficher l’icône", show_last_changed: "Dernier changement", lc_just_now: "à l’instant", state_first: "Valeur d’abord", text_layout: "Ordre du texte", primary_text: "Première ligne", primary_state: "Valeur d’abord", primary_name: "Nom d’abord",
    height: "Hauteur", width: "Largeur", align: "Alignement", visible: "Visible", left: "Gauche", center: "Centre", right: "Droite",
    tap_action: "Appui court", hold_action: "Appui long", double_tap_action: "Double appui",
    actions: "Actions",
    act_more: "Détails (Défaut)", act_toggle: "Basculer", act_navigate: "Navigation", act_call_service: "Action (service)", act_none: "Rien",
    service: "Service (domain.service)", service_data: "Données du service (JSON)", target_entity: "Entité cible",
    live_preview: "Aperçu en direct",
    upload_btn: "Télécharger une image", uploading: "Téléchargement...", upload_success: "Terminé!",
    show_name: "Afficher le titre", header_badges: "Infos d'en-tête supplémentaires", badge_add: "Ajouter une entrée", badge_label: "Libellé (optionnel)", badge_background: "Arrière-plan (rgba)", standard_badge_background: "Fond du badge climat principal (rgba)",
    migration_title: "Action requise",
    migration_text: "Carte renommée en <b>oneline-room-card</b> pour éviter les conflits.<br>Veuillez changer <code>type: custom:room-card</code> en <code>type: custom:oneline-room-card</code>.",
    control_mode: "Mode de contrôle", ctrl_default: "Défaut", ctrl_slider: "Curseur", ctrl_buttons: "Boutons",
    slider_mode: "Mode Curseurs", slider_mode_brightness: "Luminosité", slider_mode_color_temp: "Température de couleur",
    slider_style: "Style de curseur", style_inline: "Intégré", style_bg: "Arrière-plan",
    collapsible: "Rétractable", default_state: "État par défaut", state_expanded: "Déplié", state_collapsed: "Replié",
    header_height: "Hauteur de l'en-tête (px)",
    typography: "Typographie de l'en-tête", name_font: "Police du nom", info_font: "Police des infos",
    font_size: "Taille (px)", font_weight: "Poids", font_style: "Style", font_color: "Couleur", badge_bg: "Fond du badge",
    card_behavior: "Comportement de la carte", behavior: "Mode repli", behavior_fixed: "Désactivé", behavior_collapsed: "Replié", behavior_expanded: "Déplié", behavior_remember: "Remember",
    header: "En-tête", configuration: "Configuration",
    color_map: "Couleurs par état", color_map_add: "Ajouter couleur", color_map_state: "État",
    window_always_show: "Toujours afficher (incl. fermé)", window_open_color: "Couleur ouvert", window_closed_color: "Couleur fermé",
    sensors: "Capteurs",
    icon_size: "Taille icône", global_icon_size: "Taille icône globale (px)",
    header_info_offset: "Position ligne info",
    header_name_offset: "Position titre",
    header_sync_offsets: "Synchroniser les positions",
    global_button_bg: "Fond du bouton global",
    button_bg: "Fond du bouton",
    show_cover_presets: "Préréglages de position",
    cover_presets_label: "Valeurs (séparées par virgule)",
    show_climate_presets: "Préréglages de température",
    climate_presets_label: "Températures (séparées par virgule)",
    show_color_favorites: "Couleurs favorites",
    color_favorites_label: "Couleurs ('#hex' ou 'r,g,b', virgule)",
    info_line_position: "Position ligne info", info_position_header: "Dans l'en-tête (défaut)", info_position_below: "Sous l'en-tête",
    last_activity_title: "Dernière activité", last_activity_show: "Afficher la dernière activité"
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
  light: { on: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
  switch: { on: "mdi:toggle-switch", off: "mdi:toggle-switch-off-outline" },
  input_boolean: { on: "mdi:toggle-switch", off: "mdi:toggle-switch-off-outline" },
  fan: { on: "mdi:fan", off: "mdi:fan-off" },
  lock: { locked: "mdi:lock", unlocked: "mdi:lock-open-outline" },
  cover: {
    open: "mdi:window-shutter-open", closed: "mdi:window-shutter",
    opening: "mdi:window-shutter-open", closing: "mdi:window-shutter"
  },
  media_player: { playing: "mdi:cast-connected", paused: "mdi:cast-connected", idle: "mdi:cast", off: "mdi:cast-off" },
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

const isHeaderManualColorEnabled = (config) => !!trimStr(config?.color);

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
// LAST CHANGED HELPER
// =============================================================================
function formatLastChanged(lastChanged, hass) {
  if (!lastChanged) return "";
  const elapsedSec = Math.floor((Date.now() - new Date(lastChanged)) / 1000);
  if (elapsedSec < 60) return getTranslation(hass, "lc_just_now");
  const elapsedMin = Math.floor(elapsedSec / 60);
  if (elapsedMin < 60) return `${elapsedMin} min`;
  const elapsedHours = Math.floor(elapsedMin / 60);
  const remMin = elapsedMin % 60;
  if (elapsedHours < 24) return remMin > 0 ? `${elapsedHours}h ${remMin}min` : `${elapsedHours}h`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays}d`;
}

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
    this._lastChangedInterval = null;
  }

  disconnectedCallback() {
    this._activeTimers.forEach(clearTimeout);
    this._activeTimers.clear();
    if (this._lastChangedInterval) {
      clearInterval(this._lastChangedInterval);
      this._lastChangedInterval = null;
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) this.render();
    if (!this._shouldUpdateFromHass(hass)) return;
    this._updateContentState();
    this._captureStateSnapshot(hass);
  }

  _getCollapseUniqueId(config) {
    if (config.entity) return config.entity;
    if (config.name) return config.name;
    const sig = (config.controls || []).map(c => c.entity || "").join("");
    return sig || "default";
  }

  setConfig(config) {
    const prevKey = this._collapseKey;
    this.config = config;
    this._collapseKey = `oneline-room-card-collapsed:${this._getCollapseUniqueId(config)}`;
    if (this._collapseKey !== prevKey) {
      const stored = config.remember_state !== false ? localStorage.getItem(this._collapseKey) : null;
      this._collapsed = stored !== null ? stored === "1" : (config.default_state === "collapsed");
    }
    this._configChanged = true;
    this._lastStates = new Map();
    this._lastRenderMetaSig = "";
    this._cachedEntityIds = null;
    if (!this.content) this.render();
    this.updateContent();
    this._setupLastChangedInterval();
  }

  _setupLastChangedInterval() {
    if (this._lastChangedInterval) {
      clearInterval(this._lastChangedInterval);
      this._lastChangedInterval = null;
    }
    const hasLastChanged = (this.config?.controls || []).some(c => c.show_last_changed === true);
    const hasCardLastActivity = this.config?.show_card_last_activity === true;
    if (hasLastChanged || hasCardLastActivity) {
      this._lastChangedInterval = setInterval(() => { this.updateContent(); }, 60000);
    }
  }

  getCardSize() {
    const c = this.config?.controls;
    return 3 + Math.ceil((Array.isArray(c) ? c.length : 0) / 2.5);
  }

  static getStubConfig(hass) {
    return { name: "", entity: "", collapsible: true, controls: [] };
  }

  render() {
    if (!this.config) return;
    const actOpts = [
      { value: "more-info", label: getTranslation(this._hass, "act_more") || "Details (Default)" },
      { value: "toggle", label: getTranslation(this._hass, "act_toggle") || "Toggle" },
      { value: "navigate", label: getTranslation(this._hass, "act_navigate") || "Navigate" },
      { value: "none", label: getTranslation(this._hass, "act_none") || "None" }
    ];
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
        .btn { position: relative; display: flex; align-items: center; gap: 10px; padding: 0 10px; border-radius: 12px; cursor: pointer; background: var(--rc-btn-bg, var(--btn-bg, var(--card-background-color, rgba(128,128,128,0.05)))); border: 1px solid transparent; flex-grow: 1; flex-shrink: 1; min-width: 0; overflow: hidden; box-sizing: border-box; transition: background 0.2s; user-select: none; -webkit-user-select: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent; flex-basis: var(--btn-flex-basis, auto); height: var(--btn-height, 60px); justify-content: var(--btn-justify, center); }
        .btn.label-right { flex-direction: row; align-items: center; justify-content: var(--btn-justify, center); gap: 10px; padding: 0 10px; }
        .btn.label-left { flex-direction: row-reverse; align-items: center; justify-content: var(--btn-justify, center); gap: 10px; padding: 0 10px; }
        .btn.label-bottom { flex-direction: column; justify-content: flex-start; align-items: center; gap: 1px; padding: 2px 4px; overflow: hidden; }
        .btn.label-top { flex-direction: column-reverse; justify-content: center; gap: 4px; padding: 6px 8px; overflow: hidden; }
        .btn.has-inline-ctrl.label-bottom,
        .btn.has-inline-ctrl.label-top { align-items: center; }
        .btn.has-inline-ctrl.label-bottom .btn-top,
        .btn.has-inline-ctrl.label-top .btn-top { align-items: center; width: 100%; }
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
        .cover-action-btn { flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(128,128,128,0.1); border-radius: 6px; padding: 4px 2px; cursor: pointer; transition: background 0.15s; touch-action: manipulation; }
        .cover-action-btn:hover { background: rgba(128,128,128,0.22); }
        .cover-action-btn ha-icon { --mdc-icon-size: 16px; color: var(--primary-text-color); }
        .btn-cover-presets { display: flex; gap: 4px; width: 100%; flex: 0 0 auto; padding-bottom: 4px; }
        .preset-btn { flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(128,128,128,0.1); border-radius: 6px; padding: 3px 4px; cursor: pointer; transition: background 0.15s, color 0.15s; font-size: 11px; font-weight: 600; color: var(--secondary-text-color); white-space: nowrap; touch-action: manipulation; }
        .preset-btn:hover { background: rgba(128,128,128,0.22); color: var(--primary-text-color); }
        .preset-btn.active { background: var(--icon-color, var(--primary-color, #ff9800)); color: #fff; }
        .btn-color-favorites { display: flex; gap: 6px; width: 100%; flex: 0 0 auto; padding-bottom: 4px; flex-wrap: wrap; }
        .color-swatch { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; flex-shrink: 0; border: 2px solid transparent; transition: transform 0.15s, border-color 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.25); touch-action: manipulation; }
        .color-swatch:hover { transform: scale(1.2); }
        .color-swatch.active { border-color: var(--primary-text-color); transform: scale(1.15); }
        .controls { transition: max-height 0.35s ease, padding 0.35s ease; overflow: hidden; max-height: 2000px; }
        .controls.collapsed { max-height: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }
        .collapse-btn { position: absolute; bottom: 8px; right: 8px; z-index: 3; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.38); display: none; align-items: center; justify-content: center; cursor: pointer; }
        .collapse-btn ha-icon { --mdc-icon-size: 18px; color: white; transition: transform 0.35s ease; }
        .collapse-btn.open ha-icon { transform: rotate(180deg); }
        .btn-chips { display: flex; flex-direction: row; flex-wrap: wrap; gap: 2px; align-items: center; max-width: 100%; margin-top: 2px; }
        .btn-chips.chips-top { margin-top: 0; margin-bottom: 2px; }
        .btn.has-inline-ctrl .btn-chips { margin-top: 4px; padding-bottom: 2px; }
        .btn.has-inline-ctrl .btn-chips.chips-top { margin-top: 0; margin-bottom: 4px; padding-bottom: 0; padding-top: 2px; }
        .btn-chip { display: inline-flex; align-items: center; gap: 2px; padding: 2px 5px; background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12); color: var(--secondary-text-color, rgba(0,0,0,0.6)); border-radius: 6px; max-width: 100%; box-sizing: border-box; }
        .btn-chip span { font-size: 9px; line-height: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .btn-chip ha-icon { --mdc-icon-size: 11px; }
        .info-bar { display: none; flex-wrap: nowrap; gap: 6px; padding: 4px 12px 6px; align-items: center; overflow: hidden; font-size: var(--rc-header-info-size, 12px); font-weight: var(--rc-header-info-weight, normal); font-style: var(--rc-header-info-style, normal); color: var(--rc-header-info-color, var(--secondary-text-color)); }
        .info-bar.active { display: flex; }
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
          <div id="info-bar" class="info-bar"></div>
          <div id="ctrls" class="controls"></div>
        </div>
      </ha-card>`;

    this.content = this.shadowRoot.querySelector(".container");
    this.controls = this.shadowRoot.getElementById("ctrls");
    const imageBox = this.shadowRoot.querySelector(".img-box");
    if (imageBox) this._attachHeaderActions(imageBox);

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
    (Array.isArray(cfg.controls) ? cfg.controls : []).forEach((ctrl) => {
      add(ctrl?.entity);
      if (Array.isArray(ctrl.visibility)) {
        const extract = (conds) => {
          conds.forEach(c => {
            if (c.entity) add(c.entity);
            if (Array.isArray(c.conditions)) extract(c.conditions);
          });
        };
        extract(ctrl.visibility);
      }
      if (Array.isArray(ctrl.sub_chips)) {
        ctrl.sub_chips.forEach(chip => add(chip.entity));
      }
    });
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
      attrs.current_position ?? "",
      attrs.color_temp ?? "",
      attrs.brightness ?? "",
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
    const headerManualColor = isHeaderManualColorEnabled(c);
    const headerColors = this._resolveEntityIconColors(effectiveEntity, h, {
      defaultColor: "",
      defaultBg: "transparent",
      forceColor: headerManualColor ? c.color : ""
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

    const infoPos = c.info_line_position || "header";
    const infoEl = this.shadowRoot.getElementById("info");
    const infoBarEl = this.shadowRoot.getElementById("info-bar");
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
      const isLastChanged = badge.show_last_changed === true && st.last_changed;
      const displayVal = isLastChanged ? formatLastChanged(st.last_changed, h) : `${val}${unit ? " " + unit : ""}`;
      infoParts.push({
        text: showBadgeName
          ? `${displayLabel}${isLastChanged ? " · " : ": "}${displayVal}`
          : displayVal,
        background: trimStr(badge.background) || standardHeaderBadgeBackground
      });
    });
    if (c.show_card_last_activity === true) {
      const controls = Array.isArray(c.controls) ? c.controls : [];
      let latestChanged = null;
      let latestTime = 0;
      controls.forEach(ctrl => {
        if (!ctrl?.entity) return;
        const st = h.states[ctrl.entity];
        if (!st?.last_changed) return;
        const t = new Date(st.last_changed).getTime();
        if (t > latestTime) { latestTime = t; latestChanged = st; }
      });
      if (latestChanged) {
        const elapsed = formatLastChanged(latestChanged.last_changed, h);
        infoParts.push({ text: elapsed, background: standardHeaderBadgeBackground });
      }
    }

    infoEl.replaceChildren();
    if (infoBarEl) infoBarEl.replaceChildren();

    const target = (infoPos === "below_header" && infoBarEl) ? infoBarEl : infoEl;
    infoParts.forEach((part, idx) => {
      const span = document.createElement("span");
      span.className = `info-item${part.background ? " badge" : ""}`;
      span.textContent = part.text;
      if (part.background) span.style.background = part.background;
      target.appendChild(span);
      if (idx < infoParts.length - 1) {
        const sep = document.createElement("span");
        sep.className = "info-item";
        sep.textContent = "|";
        target.appendChild(sep);
      }
    });

    if (infoBarEl) infoBarEl.classList.toggle("active", infoPos === "below_header" && infoParts.length > 0);

    const textEl = this.shadowRoot.querySelector(".text");
    const nameOffset = Number(c.header_name_offset ?? 0);
    const infoOffset = infoPos === "header" ? Number(c.header_info_offset ?? 0) : 0;
    if (textEl) textEl.style.flex = (nameOffset > 0 || infoOffset > 0) ? "1" : "";

    // Title horizontal offset
    this._applyHeaderOffset(nameEl, nameOffset, textEl);

    // Info line horizontal offset (only relevant when inside the header)
    if (infoPos === "header") this._applyHeaderOffset(infoEl, infoOffset, textEl);

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

    let visibleCtrls = (c.controls || []).filter(ctrl => {
      if (ctrl.hide) return false;
      if (Array.isArray(ctrl.visibility) && ctrl.visibility.length > 0) {
        if (!this._checkConditions(ctrl.visibility, h)) return false;
      }
      return (ctrl.entity || ctrl.type === "template");
    });

    if (c.auto_climate_button && c.entity && getEntityDomain(c.entity) === "climate") {
      const alreadyPresent = visibleCtrls.some(ctrl => ctrl.entity === c.entity);
      if (!alreadyPresent) {
        const climateState = h.states[c.entity];
        visibleCtrls = [{ entity: c.entity, name: climateState?.attributes?.friendly_name || "", width: 60, height: 60 }, ...visibleCtrls];
      }
    }

    const controlsSig = JSON.stringify(visibleCtrls.map(ct => ct.entity + (ct.type || "")));

    if (this._configChanged || this._lastControlsSig !== controlsSig) {
      this._lastControlsSig = controlsSig;
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
    if (ctrl.entity) btn.setAttribute("data-entity", ctrl.entity);
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

  _checkConditions(conditions, h) {
    if (!Array.isArray(conditions) || conditions.length === 0) return true;
    return conditions.every(c => this._checkCondition(c, h));
  }

  _checkCondition(c, h) {
    if (!c || !c.condition) return true;
    const type = c.condition;

    if (type === "state") {
      if (!c.entity) return true; // Incomplete condition — treat as always visible
      const st = h.states[c.entity]?.state;
      if (c.state_not !== undefined) return st !== c.state_not;
      return st === c.state;
    }

    if (type === "numeric_state") {
      if (!c.entity) return true; // Incomplete condition
      const val = parseFloat(h.states[c.entity]?.state);
      if (isNaN(val)) return false;
      if (c.above !== undefined && val <= parseFloat(c.above)) return false;
      if (c.below !== undefined && val >= parseFloat(c.below)) return false;
      return true;
    }

    if (type === "screen") {
      if (!c.media_query) return true;
      return window.matchMedia(c.media_query).matches;
    }

    if (type === "user") {
      if (!Array.isArray(c.users) || !h.user) return true;
      return c.users.includes(h.user.id);
    }

    if (type === "and") {
      if (!Array.isArray(c.conditions)) return true;
      return c.conditions.every(cond => this._checkCondition(cond, h));
    }

    if (type === "or") {
      if (!Array.isArray(c.conditions)) return true;
      return c.conditions.some(cond => this._checkCondition(cond, h));
    }

    if (type === "not") {
      if (!Array.isArray(c.conditions)) return true;
      return c.conditions.every(cond => !this._checkCondition(cond, h));
    }

    return true;
  }

  _getSliderCapabilities(domain, st, ctrl) {
    let supported = false, min = 0, max = 100, step = 1, value = 0, pct = 0, action = null;
    if (!st || this._isEntityUnavailable(ctrl.entity)) return { supported };

    if (domain === "light") {
      const supp = st.attributes?.supported_color_modes || [];
      const hasColorTemp = supp.includes("color_temp") || st.attributes?.color_temp !== undefined || st.attributes?.color_temp_kelvin !== undefined;
      const isColorTemp = ctrl.slider_mode === "color_temp" && hasColorTemp;
      supported = true;
      if (isColorTemp) {
        if (st.attributes?.min_color_temp_kelvin !== undefined) {
          min = st.attributes.min_color_temp_kelvin;
          max = st.attributes.max_color_temp_kelvin;
          value = st.attributes.color_temp_kelvin ?? min;
          action = "color_temp_kelvin";
        } else {
          min = st.attributes?.min_mireds ?? 153;
          max = st.attributes?.max_mireds ?? 500;
          value = st.attributes?.color_temp ?? min;
          action = "color_temp";
        }
      } else {
        value = st.attributes?.brightness != null ? Math.round((st.attributes.brightness / 255) * 100) : 0;
        min = 0; max = 100; step = 1;
        action = "brightness";
      }
    } else if (domain === "cover") {
      supported = true;
      value = st.attributes?.current_position ?? 0;
      action = "position";
    } else if (domain === "climate") {
      supported = true;
      min = st.attributes?.min_temp ?? 5;
      max = st.attributes?.max_temp ?? 35;
      step = 0.5;
      value = st.attributes?.temperature ?? min;
      action = "temperature";
    } else if (domain === "fan") {
      supported = true;
      step = parseInt(st.attributes?.percentage_step ?? 1);
      value = st.attributes?.percentage ?? 0;
      action = "percentage";
    } else if (domain === "media_player") {
      supported = true;
      value = st.attributes?.volume_level != null ? Math.round(st.attributes.volume_level * 100) : 0;
      action = "volume_level";
    } else if (domain === "number" || domain === "input_number") {
      supported = true;
      min = parseFloat(st.attributes?.min ?? 0);
      max = parseFloat(st.attributes?.max ?? 100);
      step = parseFloat(st.attributes?.step ?? 1);
      value = parseFloat(st.state) || min;
      action = "value";
    }
    pct = ((Math.max(min, Math.min(max, value)) - min) / (max - min)) * 100;
    return { supported, min, max, step, value, pct, action };
  }

  _getInlineButtons(domain) {
    if (domain === "cover") return [
      { icon: "mdi:arrow-up-bold", action: "service", service: "cover.open_cover" },
      { icon: "mdi:stop", action: "service", service: "cover.stop_cover" },
      { icon: "mdi:arrow-down-bold", action: "service", service: "cover.close_cover" }
    ];
    if (domain === "climate") return [
      { icon: "mdi:minus", action: "custom", custom: "temp_down" },
      { icon: "mdi:power", action: "custom", custom: "toggle_hvac" },
      { icon: "mdi:plus", action: "custom", custom: "temp_up" }
    ];
    if (domain === "light") return [
      { icon: "mdi:brightness-5", action: "custom", custom: "dim_down" },
      { icon: "mdi:power", action: "service", service: "light.toggle" },
      { icon: "mdi:brightness-7", action: "custom", custom: "dim_up" }
    ];
    if (domain === "fan") return [
      { icon: "mdi:minus", action: "service", service: "fan.decrease_speed" },
      { icon: "mdi:power", action: "service", service: "fan.toggle" },
      { icon: "mdi:plus", action: "service", service: "fan.increase_speed" }
    ];
    if (domain === "media_player") return [
      { icon: "mdi:skip-previous", action: "service", service: "media_player.media_previous_track" },
      { icon: "mdi:play-pause", action: "service", service: "media_player.media_play_pause" },
      { icon: "mdi:skip-next", action: "service", service: "media_player.media_next_track" }
    ];
    return [];
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
        forceColor: ctrl.color || ""
      });
      col = resolved.color;
      bg = resolved.bg;
      isUnavail = resolved.isUnavailable;
      // color_map: per-state color override (lower priority than manual color)
      if (!ctrl.color && ctrl.color_map && !isUnavail) {
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
    const showLastChanged = ctrl.show_last_changed === true && !isTemplate && !!st?.last_changed;
    const elapsedText = showLastChanged ? formatLastChanged(st.last_changed, h) : "";
    const stateHtml = (() => {
      if (showState && showLastChanged) return `<span class="btn-state">${stateText} · ${elapsedText}</span>`;
      if (showState) return `<span class="btn-state">${stateText}</span>`;
      if (showLastChanged) return `<span class="btn-state">${elapsedText}</span>`;
      return "";
    })();
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

    const chipsPos = ctrl.chips_position === "top" ? "top" : "bottom";
    let chipsHtml = "";
    if (Array.isArray(ctrl.sub_chips) && ctrl.sub_chips.length > 0) {
      chipsHtml = `<div class="btn-chips${chipsPos === "top" ? " chips-top" : ""}">`;
      for (const chip of ctrl.sub_chips) {
        if (!chip.entity || !h?.states?.[chip.entity]) continue;
        const chipSt = h.states[chip.entity];
        let val;
        if (chip.attribute) {
          val = chipSt.attributes[chip.attribute];
        } else {
          val = h.formatEntityState ? h.formatEntityState(chipSt) : chipSt.state;
        }
        const displayVal = val != null ? String(val) : "";
        let label = chip.label || "";
        if (label && label.includes("{state}")) {
          label = label.replace("{state}", displayVal);
        } else if (label && displayVal) {
          label = `${label}: ${displayVal}`;
        } else if (!chip.label && displayVal) {
          label = displayVal;
        }
        const txtHtml = label ? `<span style="margin-left: ${chip.icon ? '4px' : '0'};">${label}</span>` : "";
        const icnHtml = chip.icon ? `<ha-icon icon="${chip.icon}"></ha-icon>` : "";
        chipsHtml += `<div class="btn-chip">${icnHtml}${txtHtml}</div>`;
      }
      chipsHtml += `</div>`;
    }

    btn.innerHTML = chipsPos === "top"
      ? `${iconHtml}<div class="btn-txt">${chipsHtml}${textHtml}</div>${badge}`
      : `${iconHtml}<div class="btn-txt">${textHtml}${chipsHtml}</div>${badge}`;

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

    // Inline controls
    const controlMode = ctrl.control_mode;
    const sliderCaps = this._getSliderCapabilities(domain, st, ctrl);
    const inlineBtns = this._getInlineButtons(domain);
    const isBgSlider = controlMode === "slider" && ctrl.slider_style === "background" && !isUnavail && sliderCaps.supported;
    const isInlineSlider = controlMode === "slider" && ctrl.slider_style !== "background" && !isUnavail && sliderCaps.supported;
    const hasInlineBtns = controlMode === "buttons" && !isUnavail && inlineBtns.length > 0;
    const hasCoverPresets = ctrl.show_cover_presets === true && domain === "cover" && !isUnavail;
    const hasClimatePresets = ctrl.show_climate_presets === true && domain === "climate" && !isUnavail;
    const hasColorFavorites = ctrl.show_color_favorites === true && domain === "light" && !isUnavail;

    if (isBgSlider) {
      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.style.touchAction = "pan-y";
      const bgSlider = document.createElement("div");
      bgSlider.className = "bg-slider-fill";
      bgSlider.style.position = "absolute";
      bgSlider.style.top = "0";
      bgSlider.style.left = "0";
      bgSlider.style.height = "100%";
      bgSlider.style.width = `${sliderCaps.pct}%`;
      bgSlider.style.zIndex = "0";
      bgSlider.style.pointerEvents = "none";
      bgSlider.style.opacity = "0.2";
      if (sliderCaps.action === "color_temp") {
        bgSlider.style.background = `linear-gradient(to right, #a2c8ff 0%, #ffcf91 100%)`;
      } else if (sliderCaps.action === "color_temp_kelvin") {
        bgSlider.style.background = `linear-gradient(to right, #ffcf91 0%, #a2c8ff 100%)`;
      } else {
        bgSlider.style.background = "var(--icon-color)";
      }
      Array.from(btn.children).forEach(c => { c.style.position = "relative"; c.style.zIndex = "1"; });
      btn.insertBefore(bgSlider, btn.firstChild);
    }

    if (isInlineSlider || hasInlineBtns || hasCoverPresets || hasClimatePresets || hasColorFavorites) {
      btn.classList.add("has-inline-ctrl");
      const topDiv = document.createElement("div");
      topDiv.className = "btn-top";
      while (btn.firstChild) {
        if (btn.firstChild.className === "bg-slider-fill") break; // Keep background behind topDiv if they somehow co-exist
        topDiv.appendChild(btn.firstChild);
      }
      btn.appendChild(topDiv);

      if (isInlineSlider) {
        const wrap = document.createElement("div");
        wrap.className = "btn-slider-wrap";
        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "btn-slider";
        slider.min = sliderCaps.min; slider.max = sliderCaps.max; slider.step = sliderCaps.step; slider.value = sliderCaps.value;
        slider.style.setProperty("--slider-pct", `${sliderCaps.pct}%`);
        if (sliderCaps.action === "color_temp") {
          slider.style.background = `linear-gradient(to right, #a2c8ff 0%, #ffcf91 100%)`;
          slider.style.boxShadow = `inset 0 0 0 1px rgba(128,128,128,0.2)`;
        } else if (sliderCaps.action === "color_temp_kelvin") {
          slider.style.background = `linear-gradient(to right, #ffcf91 0%, #a2c8ff 100%)`;
          slider.style.boxShadow = `inset 0 0 0 1px rgba(128,128,128,0.2)`;
        }
        slider.addEventListener("pointerdown", e => e.stopPropagation());
        slider.addEventListener("click", e => e.stopPropagation());
        slider.addEventListener("input", e => {
          const v = +e.target.value;
          const pct = ((v - sliderCaps.min) / (sliderCaps.max - sliderCaps.min)) * 100;
          e.target.style.setProperty("--slider-pct", `${pct}%`);
          if (domain === "climate") {
            const stateEl = topDiv.querySelector(".btn-state");
            if (stateEl) {
              const cur = st?.attributes?.current_temperature;
              stateEl.textContent = cur != null ? `${cur}${unit} → ${v}${unit}` : `${v}${unit}`;
            }
          } else if (sliderCaps.action === "color_temp") {
            const stateEl = topDiv.querySelector(".btn-state");
            if (stateEl) {
              const k = Math.round(1000000 / v);
              stateEl.textContent = `${k} K`;
            }
          } else if (sliderCaps.action === "color_temp_kelvin") {
            const stateEl = topDiv.querySelector(".btn-state");
            if (stateEl) stateEl.textContent = `${Math.round(v)} K`;
          }
        });
        slider.addEventListener("change", e => {
          const v = +e.target.value;
          if (sliderCaps.action === "color_temp") {
            this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, color_temp_kelvin: Math.round(1000000 / v) });
          } else if (sliderCaps.action === "color_temp_kelvin") {
            this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, color_temp_kelvin: Math.round(v) });
          } else if (sliderCaps.action === "brightness") {
            this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, brightness: Math.round(v * 2.55) });
          } else if (sliderCaps.action === "temperature") {
            this._hass.callService("climate", "set_temperature", { entity_id: ctrl.entity, temperature: v });
          } else if (sliderCaps.action === "position") {
            this._hass.callService("cover", "set_cover_position", { entity_id: ctrl.entity, position: v });
          } else if (sliderCaps.action === "percentage") {
            this._hass.callService("fan", "set_percentage", { entity_id: ctrl.entity, percentage: v });
          } else if (sliderCaps.action === "volume_level") {
            this._hass.callService("media_player", "volume_set", { entity_id: ctrl.entity, volume_level: v / 100 });
          } else if (sliderCaps.action === "value") {
            this._hass.callService(domain, "set_value", { entity_id: ctrl.entity, value: v });
          }
        });
        wrap.appendChild(slider);
        btn.appendChild(wrap);
      }

      if (hasInlineBtns) {
        const actDiv = document.createElement("div");
        actDiv.className = "btn-cover-actions";
        inlineBtns.forEach(({ icon, action, service, custom }) => {
          const b = document.createElement("div");
          b.className = "cover-action-btn";
          b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>`;
          b.addEventListener("pointerdown", e => e.stopPropagation());
          b.addEventListener("click", e => {
            e.stopPropagation();
            if (this._isEntityUnavailable(ctrl.entity)) return;
            if (action === "service") {
              const [d, s] = service.split(".");
              this._hass.callService(d, s, { entity_id: ctrl.entity });
            } else if (action === "custom") {
              if (custom === "dim_down") this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, brightness_step_pct: -10 });
              else if (custom === "dim_up") this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, brightness_step_pct: 10 });
              else if (custom === "temp_down") this._hass.callService("climate", "set_temperature", { entity_id: ctrl.entity, temperature: (st?.attributes?.temperature || 20) - 0.5 });
              else if (custom === "temp_up") this._hass.callService("climate", "set_temperature", { entity_id: ctrl.entity, temperature: (st?.attributes?.temperature || 20) + 0.5 });
              else if (custom === "toggle_hvac") {
                const isOff = ["off", "idle"].includes(st?.state);
                this._hass.callService("climate", isOff ? "turn_on" : "set_hvac_mode", isOff ? { entity_id: ctrl.entity } : { entity_id: ctrl.entity, hvac_mode: "off" });
              }
            }
          });
          actDiv.appendChild(b);
        });
        btn.appendChild(actDiv);
      }

      // Cover position presets
      if (domain === "cover" && ctrl.show_cover_presets === true) {
        const rawPresets = Array.isArray(ctrl.cover_presets) ? ctrl.cover_presets
          : typeof ctrl.cover_presets === "string" ? ctrl.cover_presets.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
            : [0, 50, 100];
        const currentPos = st?.attributes?.current_position ?? -1;
        const presetsDiv = document.createElement("div");
        presetsDiv.className = "btn-cover-presets";
        rawPresets.forEach(pos => {
          const pb = document.createElement("div");
          pb.className = "preset-btn";
          pb.textContent = `${pos}%`;
          const isActive = Math.abs(currentPos - pos) < 2;
          if (isActive) pb.classList.add("active");
          pb.addEventListener("pointerdown", e => e.stopPropagation());
          pb.addEventListener("click", e => {
            e.stopPropagation();
            if (!this._isEntityUnavailable(ctrl.entity)) {
              this._hass.callService("cover", "set_cover_position", { entity_id: ctrl.entity, position: pos });
            }
          });
          presetsDiv.appendChild(pb);
        });
        btn.appendChild(presetsDiv);
      }

      // Climate temperature presets
      if (domain === "climate" && ctrl.show_climate_presets === true) {
        const tempUnit = this._hass?.config?.unit_system?.temperature || "°C";
        const rawPresets = Array.isArray(ctrl.climate_presets) ? ctrl.climate_presets
          : typeof ctrl.climate_presets === "string"
            ? ctrl.climate_presets.split(",").map(v => {
              const t = v.trim().toLowerCase();
              if (t === "auto" || t === "max") return t;
              const n = parseFloat(t);
              return isNaN(n) ? null : n;
            }).filter(v => v !== null)
            : [0, 18, 20, 22];
        const currentTarget = st?.attributes?.temperature ?? -999;
        const maxTemp = st?.attributes?.max_temp ?? null;
        const presetsDiv = document.createElement("div");
        presetsDiv.className = "btn-cover-presets";
        rawPresets.forEach(val => {
          const pb = document.createElement("div");
          pb.className = "preset-btn";
          let label, isActive;
          if (val === "auto") {
            label = "Auto";
            isActive = st?.state === "auto" || st?.attributes?.hvac_mode === "auto";
          } else if (val === "max") {
            label = "Max";
            isActive = maxTemp != null && Math.abs(currentTarget - maxTemp) < 0.5;
          } else if (val === 0) {
            label = "Off";
            isActive = st?.state === "off";
          } else {
            label = `${val}${tempUnit}`;
            isActive = Math.abs(currentTarget - val) < 0.5;
          }
          pb.textContent = label;
          if (isActive) pb.classList.add("active");
          pb.addEventListener("pointerdown", e => e.stopPropagation());
          pb.addEventListener("click", e => {
            e.stopPropagation();
            if (!this._isEntityUnavailable(ctrl.entity)) {
              if (val === "auto") {
                this._hass.callService("climate", "set_hvac_mode", { entity_id: ctrl.entity, hvac_mode: "auto" });
              } else if (val === "max") {
                if (maxTemp != null) this._hass.callService("climate", "set_temperature", { entity_id: ctrl.entity, temperature: maxTemp });
              } else if (val === 0) {
                this._hass.callService("climate", "turn_off", { entity_id: ctrl.entity });
              } else {
                this._hass.callService("climate", "set_temperature", { entity_id: ctrl.entity, temperature: val });
              }
            }
          });
          presetsDiv.appendChild(pb);
        });
        btn.appendChild(presetsDiv);
      }

      // Light color favorites
      if (domain === "light" && ctrl.show_color_favorites === true) {
        // Read from HA entity attribute first, then fall back to manual config
        const entityFavorites = st?.attributes?.light_color_favorites;
        const manualFavorites = ctrl.color_favorites;
        let favorites = [];
        const parseColor = (raw) => {
          if (typeof raw === "string") {
            const t = raw.trim();
            if (/^#[0-9a-f]{6}$/i.test(t)) {
              const r = parseInt(t.slice(1, 3), 16), g = parseInt(t.slice(3, 5), 16), b = parseInt(t.slice(5, 7), 16);
              return [r, g, b];
            }
            const parts = t.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v) && v >= 0 && v <= 255);
            if (parts.length === 3) return parts;
          } else if (Array.isArray(raw) && raw.length === 3) {
            return raw.map(Number);
          }
          return null;
        };
        if (Array.isArray(entityFavorites) && entityFavorites.length) {
          favorites = entityFavorites.map(parseColor).filter(Boolean);
        }
        if (!favorites.length && Array.isArray(manualFavorites) && manualFavorites.length) {
          favorites = manualFavorites.map(parseColor).filter(Boolean);
        }
        if (!favorites.length && typeof manualFavorites === "string") {
          favorites = manualFavorites.split(";").map(s => parseColor(s.trim())).filter(Boolean);
        }
        if (favorites.length) {
          const currentRgb = st?.attributes?.rgb_color;
          const swatchRow = document.createElement("div");
          swatchRow.className = "btn-color-favorites";
          favorites.forEach(rgb => {
            const sw = document.createElement("div");
            sw.className = "color-swatch";
            sw.style.background = `rgb(${rgb.join(",")})`;
            const isActive = Array.isArray(currentRgb)
              && Math.abs(currentRgb[0] - rgb[0]) < 8
              && Math.abs(currentRgb[1] - rgb[1]) < 8
              && Math.abs(currentRgb[2] - rgb[2]) < 8;
            if (isActive) sw.classList.add("active");
            sw.addEventListener("pointerdown", e => e.stopPropagation());
            sw.addEventListener("click", e => {
              e.stopPropagation();
              if (!this._isEntityUnavailable(ctrl.entity)) {
                this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, rgb_color: rgb });
              }
            });
            swatchRow.appendChild(sw);
          });
          btn.appendChild(swatchRow);
        }
      }
      // Move sub-chips out of btn-top to top or bottom of button based on chips_position
      const chipsEl = topDiv.querySelector(".btn-chips");
      if (chipsEl) {
        if (chipsPos === "top") {
          btn.insertBefore(chipsEl, topDiv);
        } else {
          btn.appendChild(chipsEl);
        }
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
    node.style.touchAction = "manipulation";
    let timer = null, held = false, holdTimer = null;
    let startX = 0, isDragging = false;
    const trackTimeout = (fn, ms) => {
      const id = setTimeout(() => { this._activeTimers.delete(id); fn(); }, ms);
      this._activeTimers.add(id);
      return id;
    };
    const cancelTimeout = (id) => { clearTimeout(id); this._activeTimers.delete(id); };
    node.addEventListener("pointerdown", (e) => {
      if (this._isEntityUnavailable(ctrl.entity)) return;
      startX = e.clientX;
      isDragging = false;
      held = false;
      holdTimer = trackTimeout(() => { if (!isDragging) { held = true; this._fireAction("hold", config); } }, 500);
    });
    node.addEventListener("pointermove", (e) => {
      if (!startX || !this._hass || this._isEntityUnavailable(ctrl.entity)) return;
      const domain = ctrl.entity.split(".")[0];
      const st = this._hass.states[ctrl.entity];
      const sliderCaps = this._getSliderCapabilities(domain, st, ctrl);
      const isBgSlider = ctrl.control_mode === "slider" && ctrl.slider_style === "background" && sliderCaps.supported;

      if (!isBgSlider) return;

      const dx = Math.abs(e.clientX - startX);
      if (dx > 10) {
        if (!isDragging) {
          isDragging = true;
          held = false;
          if (holdTimer) cancelTimeout(holdTimer);
        }
        const rect = node.getBoundingClientRect();
        let pct = ((e.clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        const bgNode = node.querySelector(".bg-slider-fill");
        if (bgNode) bgNode.style.width = `${pct}%`;
      }
    });

    const cancel = (e) => {
      if (holdTimer) { cancelTimeout(holdTimer); holdTimer = null; }
      if (isDragging && e && e.type === "pointerup" && this._hass && ctrl.control_mode === "slider" && ctrl.slider_style === "background") {
        const domain = ctrl.entity.split(".")[0];
        const st = this._hass.states[ctrl.entity];
        const sliderCaps = this._getSliderCapabilities(domain, st, ctrl);
        if (sliderCaps.supported) {
          const rect = node.getBoundingClientRect();
          let pct = ((e.clientX - rect.left) / rect.width);
          pct = Math.max(0, Math.min(1, pct));
          let v = sliderCaps.min + pct * (sliderCaps.max - sliderCaps.min);
          v = Math.round(v / sliderCaps.step) * sliderCaps.step;

          if (sliderCaps.action === "color_temp") {
            this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, color_temp_kelvin: Math.round(1000000 / v) });
          } else if (sliderCaps.action === "color_temp_kelvin") {
            this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, color_temp_kelvin: Math.round(v) });
          } else if (sliderCaps.action === "brightness") {
            this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, brightness: Math.round(v * 2.55) });
          } else if (sliderCaps.action === "temperature") {
            this._hass.callService("climate", "set_temperature", { entity_id: ctrl.entity, temperature: v });
          } else if (sliderCaps.action === "position") {
            this._hass.callService("cover", "set_cover_position", { entity_id: ctrl.entity, position: v });
          } else if (sliderCaps.action === "percentage") {
            this._hass.callService("fan", "set_percentage", { entity_id: ctrl.entity, percentage: v });
          } else if (sliderCaps.action === "volume_level") {
            this._hass.callService("media_player", "volume_set", { entity_id: ctrl.entity, volume_level: v / 100 });
          } else if (sliderCaps.action === "value") {
            this._hass.callService(domain, "set_value", { entity_id: ctrl.entity, value: v });
          }
        }
      }
      startX = 0;
      setTimeout(() => isDragging = false, 50);
    };
    node.addEventListener("pointerup", cancel);
    node.addEventListener("pointerleave", cancel);
    node.addEventListener("pointercancel", cancel);
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._isEntityUnavailable(ctrl.entity)) return;
      if (isDragging || held) return;
      if (config.double_tap_action.action !== "none") {
        if (timer) { cancelTimeout(timer); timer = null; this._fireAction("double_tap", config); }
        else { timer = trackTimeout(() => { timer = null; this._fireAction("tap", config); }, 250); }
      } else { this._fireAction("tap", config); }
    });
  }

  _attachHeaderActions(node) {
    const cfg = this.config || {};
    const config = {
      entity: cfg.entity,
      tap_action: cfg.tap_action,
      hold_action: cfg.hold_action || { action: "none" },
      double_tap_action: cfg.double_tap_action || { action: "none" }
    };
    node.style.touchAction = "manipulation";
    const explicitTap = cfg.tap_action !== undefined;
    let timer = null, held = false, holdTimer = null;
    const trackTimeout = (fn, ms) => {
      const id = setTimeout(() => { this._activeTimers.delete(id); fn(); }, ms);
      this._activeTimers.add(id);
      return id;
    };
    const cancelTimeout = (id) => { clearTimeout(id); this._activeTimers.delete(id); };
    const handleTap = () => {
      if (!explicitTap && cfg.collapsible === true) { this._toggleCollapse(); return; }
      this._fireAction("tap", config);
    };
    const cancel = () => {
      if (holdTimer) { cancelTimeout(holdTimer); holdTimer = null; }
    };
    node.addEventListener("pointerdown", () => {
      held = false;
      if (config.hold_action?.action !== "none") {
        holdTimer = trackTimeout(() => { held = true; this._fireAction("hold", config); }, 500);
      }
    });
    node.addEventListener("pointerup", (e) => {
      if (holdTimer) cancelTimeout(holdTimer);
      if (held) { held = false; return; }
      if (config.double_tap_action.action !== "none") {
        if (timer) { cancelTimeout(timer); timer = null; this._fireAction("double_tap", config); }
        else { timer = trackTimeout(() => { timer = null; handleTap(); }, 250); }
      } else { handleTap(); }
    });
    node.addEventListener("pointerleave", cancel);
    node.addEventListener("pointercancel", cancel);
  }

  _fireAction(type, config) {
    if (config.entity && this._isEntityUnavailable(config.entity)) return;
    const actionKey = `${type}_action`;
    let actionConfig = config[actionKey] || {};
    if (!actionConfig || typeof actionConfig !== 'object') actionConfig = { action: 'none' };
    if (!actionConfig.action) actionConfig.action = "none";
    if (actionConfig.action === "toggle" && config.entity) {
      const targetEntity = actionConfig.target?.entity_id || config.entity;
      const domain = targetEntity.split(".")[0];
      if (domain === "climate" && this._hass) {
        const state = this._hass.states[targetEntity];
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
    this.dispatchEvent(new CustomEvent("hass-action", { bubbles: true, composed: true, detail: eventDetail }));
  }

  _toggleCollapse() {
    this._collapsed = !this._collapsed;
    if (this._collapseKey && this.config?.remember_state !== false) localStorage.setItem(this._collapseKey, this._collapsed ? "1" : "0");
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
    this._actionsSectionOpen = false;
    this._headerSectionOpen = true;
    this._layoutSectionOpen = false;
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
    
    // FIX: Dropdowns zwingen, den neuen Wert optisch zu behalten
    this.addEventListener("value-changed", (ev) => {
      // ev.composedPath()[0] findet das ECHTE Element, auch tief im Shadow-DOM
      const target = ev.composedPath()[0];
      
      if (target && target.tagName) {
        const tag = target.tagName.toUpperCase();
        
        // Gilt für alle Selektoren und Picker in deiner Card
        if (tag === "HA-SELECTOR" || tag === "HA-ENTITY-PICKER" || tag === "HA-ICON-PICKER") {
          if (ev.detail && ev.detail.value !== undefined) {
            const newVal = ev.detail.value;
            
            // 1. Wert sofort hart setzen
            target.value = newVal;
            
            // 2. Den Wert im nächsten Frame nochmal setzen, 
            // falls das Lit-Framework ihn im Hintergrund überschreiben wollte
            requestAnimationFrame(() => {
              if (target.value !== newVal) {
                target.value = newVal;
              }
            });
          }
        }
      }
    }, true); // "true" fängt das Event ab, BEVOR es verarbeitet wird
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
    const incoming = config || {};
    const incomingSig = JSON.stringify(incoming);
    // Skip re-render if the config hasn't actually changed
    if (this._lastFiredConfigSig && incomingSig === this._lastFiredConfigSig) {
      this._config = incoming;
      if (!Array.isArray(this._config.controls)) this._config = { ...this._config, controls: [] };
      this._syncControlIds();

      this.updVal();
      return;
    }
    this._config = incoming;
    if (!Array.isArray(this._config.controls)) this._config = { ...this._config, controls: [] };
    this._syncControlIds();
    this.render();
  }

  set hass(hass) {
    const upd = this._hass?.language !== hass?.language;
    this._hass = hass;
    if (upd) { this._controlTemplatesCache = null; this._navOptionsLoaded = false; this.render(); return; }
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-selector,ha-entity-picker,ha-icon-picker,ha-textfield,ha-switch,ha-card-conditions-editor").forEach(e => {
        if (e.hass !== hass) e.hass = hass;
      });
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
    this._lastFiredConfigSig = JSON.stringify(config);
    if (!this._livePreview) {
      this._pendingConfig = config;
      return;
    }
    clearTimeout(this._tm);
    this._tm = setTimeout(() => {
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }, 100);
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
    const options = Array.isArray(this._navOptions) ? this._navOptions : [];
    const applyTo = (id, value) => {
      const nav = this.shadowRoot?.getElementById(id);
      if (!nav) return;
      nav.selector = { select: { mode: "dropdown", options, custom_value: true } };
      nav.value = value || "";
      if (this._hass && nav.hass !== this._hass) nav.hass = this._hass;
    };
    applyTo("tap-nav-path", this._config?.tap_action?.navigation_path);
    applyTo("hold-nav-path", this._config?.hold_action?.navigation_path);
    applyTo("dbl-nav-path", this._config?.double_tap_action?.navigation_path);
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
      const preferredDomains = ["light", "switch", "climate", "cover", "fan", "media_player", "lock", "input_boolean", "vacuum", "humidifier", "sensor", "binary_sensor"];
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

      try {
        const cfg = await this._hass.connection.sendMessagePromise({ type: "lovelace/config" });
        addPanelViews({ url_path: "lovelace", title: "Lovelace" }, cfg);
      } catch (err) {
        addOption("/lovelace", "Lovelace (/lovelace)");
      }

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
    if (alreadyRendered && domVersion === VERSION) { this.updVal(); if (JSON.stringify(this._config?.controls || []) !== this._lastRenderedControlsSig) this.renBtn(); this._applyNavSelectorOptions(); this._ensureNavOptions(); this._updateSensorsSectionUI(); this._updateImageSectionUI(); this._updateBadgesUI(); this._updateTypographyUI(); this._updateCardBehaviorUI(); this._updateActionsSectionUI(); this._updateHeaderSectionUI(); this._updateTabUI(); return; }
    
    this.shadowRoot.innerHTML = "";
    const h = this._hass;
    this.shadowRoot.innerHTML = `
      <style>
        .sec { padding: 12px 0; border-bottom: 1px solid var(--divider-color); }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .image-sec, .manual-sec, .badges-sec { border: 1px solid var(--divider-color); border-radius: 8px; background: var(--secondary-background-color); padding: 6px 10px; margin-bottom: 8px; }
        .image-head, .manual-head, .badges-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer; user-select: none; padding: 4px 0; }
        .image-title, .manual-title, .badges-title { font-size: 12px; font-weight: 600; opacity: 0.8; }
        .image-chev, .manual-chev, .badges-chev { --mdc-icon-size: 18px; opacity: 0.7; transition: transform 0.15s ease; }
        .image-sec.open .image-chev, .manual-sec.open .manual-chev, .badges-sec.open .badges-chev { transform: rotate(90deg); }
        .image-content, .manual-content, .badges-content { margin-top: 6px; }
        .image-content[hidden], .manual-content[hidden], .badges-content[hidden] { display: none; }
        .badge-box { border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; background: var(--card-background-color, var(--primary-background-color)); }
        .badge-head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .badge-entity-label { font-size: 12px; font-weight: 600; opacity: 0.7; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .badge-del-btn { background: none; border: 0; cursor: pointer; padding: 2px; display: inline-flex; color: #d32f2f; --mdc-icon-size: 18px; }
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
        .quick-add-field > ha-selector, .quick-add-field > ha-entity-picker { min-height: 56px; }
        .quick-add-field > ha-selector::part(form-field), .quick-add-field > ha-entity-picker::part(form-field) { min-height: 56px; }
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
        .cp-preview {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid var(--divider-color);
          position: relative;
          background-image: linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
          background-color: white;
          cursor: pointer;
        }
        .cp-preview div, .cp-inner { position: absolute; inset: 0; border-radius: 3px; pointer-events: none; }
        .color-container { position: relative; display: flex; align-items: flex-end; }
        .color-popover {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: #2c2c2c;
          color: white;
          padding: 8px;
          border-radius: 6px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          display: none;
          z-index: 1000;
          margin-bottom: 10px;
          border: 1px solid #444;
          width: 90px;
        }
        .color-container:hover .color-popover, .color-container:focus-within .color-popover { display: block; }
        .hidden { display: none !important; }
        .tab-bar { display: flex; border-bottom: 2px solid var(--divider-color); margin-bottom: 4px; }
        .tab-btn { flex: 1; background: none; border: none; border-bottom: 3px solid transparent; padding: 10px 0; font-size: 14px; font-weight: 600; color: var(--secondary-text-color); cursor: pointer; margin-bottom: -2px; transition: color 0.15s, border-color 0.15s; }
        .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        #tab-buttons-panel[hidden] { display: none; }
        #tab-config-panel[hidden] { display: none; }
        .bg-presets { display: flex; gap: 8px; margin-top: 4px; font-size: 11px; flex-wrap: wrap; }
        .bg-preset { cursor: pointer; opacity: 0.7; text-decoration: underline; background: none; border: none; padding: 0; color: inherit; font: inherit; }
        .bg-preset:hover { opacity: 1; text-decoration: none; }
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
        <div class="row" style="margin-bottom:12px; align-items:center">
          <ha-formfield label="${getTranslation(h, "live_preview")}">
            <ha-switch id="live-preview-toggle" checked></ha-switch>
          </ha-formfield>
        </div>
        <div style="display: flex; align-items: flex-end; gap: 12px;">
          <div style="position: relative; flex: 1.2; display: flex; align-items: flex-end;">
            <ha-textfield label="${getTranslation(h, "name")}" cfg="name" class="i" style="width: 100%;"></ha-textfield>
            <ha-switch id="show-name-toggle" checked title="${getTranslation(h, "show_name")}"
                       style="position: absolute; right: 8px; bottom: 28px; --mdc-switch-size: 20px; z-index: 1; transform: scale(0.8);"></ha-switch>
          </div>
          <div style="position:relative;width:180px;flex-shrink:0;">
            <ha-selector id="behavior-sel" label="${getTranslation(h, "behavior")}" style="width:100%;"></ha-selector>
          </div>
        </div>
        <div id="actions-sec" class="manual-sec" style="margin-top:12px">
          <div id="actions-head" class="manual-head">
            <span class="manual-title">${getTranslation(h, "actions")}</span>
            <ha-icon id="actions-chev" class="manual-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="actions-sec-content" class="manual-content" hidden>
            <div style="margin-top:12px">
              <ha-selector id="tap-action" label="${getTranslation(h, "tap_action")}"></ha-selector>
              <ha-textfield id="tap-service" label="${getTranslation(h, "service")}" placeholder="domain.service" style="margin-top:12px; width: 100%; display:none"></ha-textfield>
              <ha-textfield id="tap-service-data" label="${getTranslation(h, "service_data")}" placeholder='{"key":"value"}' style="margin-top:12px; width: 100%; display:none" multiline rows="4"></ha-textfield>
              <ha-entity-picker id="tap-target" style="margin-top:12px; width: 100%; display:none"></ha-entity-picker>
              <ha-selector id="tap-nav-path" label="${getTranslation(h, "path")}" placeholder="/lovelace/path" style="margin-top:12px; width: 100%; display:none"></ha-selector>
            </div>
            <div style="margin-top:12px">
              <ha-selector id="hold-action" label="${getTranslation(h, "hold_action")}"></ha-selector>
              <ha-textfield id="hold-service" label="${getTranslation(h, "service")}" placeholder="domain.service" style="margin-top:12px; width: 100%; display:none"></ha-textfield>
              <ha-textfield id="hold-service-data" label="${getTranslation(h, "service_data")}" placeholder='{"key":"value"}' style="margin-top:12px; width: 100%; display:none" multiline rows="4"></ha-textfield>
              <ha-entity-picker id="hold-target" style="margin-top:12px; width: 100%; display:none"></ha-entity-picker>
              <ha-selector id="hold-nav-path" label="${getTranslation(h, "path")}" placeholder="/lovelace/path" style="margin-top:12px; width: 100%; display:none"></ha-selector>
            </div>
            <div style="margin-top:12px">
              <ha-selector id="dbl-action" label="${getTranslation(h, "double_tap_action")}"></ha-selector>
              <ha-textfield id="dbl-service" label="${getTranslation(h, "service")}" placeholder="domain.service" style="margin-top:12px; width: 100%; display:none"></ha-textfield>
              <ha-textfield id="dbl-service-data" label="${getTranslation(h, "service_data")}" placeholder='{"key":"value"}' style="margin-top:12px; width: 100%; display:none" multiline rows="4"></ha-textfield>
              <ha-entity-picker id="dbl-target" style="margin-top:12px; width: 100%; display:none"></ha-entity-picker>
              <ha-selector id="dbl-nav-path" label="${getTranslation(h, "path")}" placeholder="/lovelace/path" style="margin-top:12px; width: 100%; display:none"></ha-selector>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div class="sec">
        <div id="header-sec-head" class="sec-head" style="cursor:pointer;user-select:none;padding:4px 0">
          <h3>${getTranslation(h, "header")}</h3>
          <ha-icon id="header-sec-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
        </div>
        <div id="header-sec-content">
        <div class="row" style="margin-top:4px; align-items: flex-end; gap: 12px;">
          <ha-textfield label="${getTranslation(h, "header_height")}" cfg="header_height" class="i" type="number" min="0" max="400" style="flex:1" placeholder="120"></ha-textfield>
          <div style="position: relative; flex: 1.2; display: flex; align-items: flex-end;">
            <ha-icon-picker label="${getTranslation(h, "icon")}" cfg="icon" class="i" style="width: 100%;"></ha-icon-picker>
            <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
               <div class="color-popover">
                  <ha-textfield cfg="color" class="i" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></ha-textfield>
               </div>
               <div class="cp-preview">
                 <div></div>
                 <input type="color" class="cl-p i" cfg="color" title="${getTranslation(h, "color")}" 
                        style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
               </div>
            </div>
          </div>
        </div>
        <div id="badges-sec" class="badges-sec">
          <div id="badges-head" class="badges-head">
            <span id="badges-title" class="badges-title"></span>
            <ha-icon id="badges-chev" class="badges-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
          </div>
          <div id="badges-content" class="badges-content" hidden>
            <div class="image-title" style="margin-bottom:8px">${getTranslation(h, "main_climate")}</div>
            <ha-entity-picker label="${getTranslation(h, "entity")}" cfg="entity" class="i" include-domains='["climate"]' style="width:100%"></ha-entity-picker>
            <div class="row" style="margin-top:8px; align-items:center;">
              <ha-formfield label="${getTranslation(h, "badge_auto_climate_btn")}">
                <ha-switch id="auto-climate-btn-toggle"></ha-switch>
              </ha-formfield>
            </div>
            
            <div style="margin-bottom:8px; width:100%;">
              <ha-selector id="info-line-pos-sel" cfg="info_line_position" label="${getTranslation(h, "info_line_position")}" style="width:100%;"></ha-selector>
            </div>
            <div class="image-title" style="margin:12px 0 8px">${getTranslation(h, "badge_bg")}</div>
            <div style="position: relative; display: flex; align-items: flex-end;">
              <ha-textfield id="standard-badge-bg" label="${getTranslation(h, "standard_badge_background")}" cfg="header_info_background" class="i" style="width: 100%"></ha-textfield>
              <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                 <div class="color-popover">
                    <ha-textfield id="standard-badge-bg-popover" class="i" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></ha-textfield>
                 </div>
                 <div class="cp-preview">
                    <div></div>
                    <input type="color" id="standard-badge-bg-picker" class="cl-p i" cfg="header_info_background" title="${getTranslation(h, "color")}" 
                           style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                 </div>
              </div>
            </div>

            <div class="image-title" style="margin:12px 0 8px">${getTranslation(h, "last_activity_title")}</div>
            <div class="row" style="margin-bottom: 8px; align-items:center;">
              <ha-formfield label="${getTranslation(h, "last_activity_show")}">
                <ha-switch id="hla-show"></ha-switch>
              </ha-formfield>
            </div>


            <div style="border-top:1px solid var(--divider-color);margin:16px 0 12px"></div>
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
        <div id="typo-sec" class="manual-sec" style="margin-top:12px">
          <div id="typo-head" class="manual-head">
            <span id="typo-title" class="manual-title" style="display:flex;align-items:center;gap:6px"><ha-icon icon="mdi:format-text" style="--mdc-icon-size:16px;opacity:0.7"></ha-icon>${getTranslation(h, "typography")}</span>
            <ha-icon id="typo-chev" class="manual-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="typo-content" class="manual-content" hidden>
            <div class="image-title" style="margin-bottom:8px">${getTranslation(h, "name_font")}</div>
            <div class="row">
              <ha-textfield label="${getTranslation(h, "font_size")}" cfg="header_name_size" class="i" type="number" placeholder="14"></ha-textfield>
              <div style="width:100%;">
                <ha-selector id="header-name-weight-sel" label="${getTranslation(h, "font_weight")}" style="width:100%;"></ha-selector>
              </div>
            </div>
            <div class="row" style="align-items: flex-end;">
              <div style="position: relative; flex: 1; display: flex; align-items: flex-end;">
                <div style="width:100%;">
                  <ha-selector id="header-name-style-sel" label="${getTranslation(h, "font_style")}" style="width:100%;"></ha-selector>
                </div>
                <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                   <div class="color-popover">
                      <ha-textfield id="header-name-color" class="i" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></ha-textfield>
                   </div>
                   <div class="cp-preview">
                     <div></div>
                     <input type="color" id="header-name-color-picker" class="cl-p i" cfg="header_name_color" title="${getTranslation(h, "color")}" 
                            style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                   </div>
                </div>
              </div>
            </div>
            <div class="image-title" style="margin:12px 0 8px">${getTranslation(h, "info_font")}</div>
            <div class="row">
              <ha-textfield label="${getTranslation(h, "font_size")}" cfg="header_info_size" class="i" type="number" placeholder="12"></ha-textfield>
              <div style="width:100%;">
                <ha-selector id="header-info-weight-sel" label="${getTranslation(h, "font_weight")}" style="width:100%;"></ha-selector>
              </div>
            </div>
            <div class="row" style="align-items: flex-end;">
              <div style="position: relative; flex: 1; display: flex; align-items: flex-end;">
                <div style="width:100%;">
                  <ha-selector id="header-info-style-sel" label="${getTranslation(h, "font_style")}" style="width:100%;"></ha-selector>
                </div>
                <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                   <div class="color-popover">
                      <ha-textfield id="header-info-color" class="i" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></ha-textfield>
                   </div>
                   <div class="cp-preview">
                     <div></div>
                     <input type="color" id="header-info-color-picker" class="cl-p i" cfg="header_info_color" title="${getTranslation(h, "color")}" 
                            style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="layout-sec" class="manual-sec" style="margin-top:12px">
          <div id="layout-head" class="manual-head">
            <span id="layout-title" class="manual-title" style="display:flex;align-items:center;gap:6px"><ha-icon icon="mdi:move-resize" style="--mdc-icon-size:16px;opacity:0.7"></ha-icon>${getTranslation(h, "layout_position")}</span>
            <ha-icon id="layout-chev" class="manual-chev" icon="mdi:chevron-right"></ha-icon>
          </div>
          <div id="layout-content" class="manual-content" hidden>
            <div class="row" style="margin-top:4px; align-items:center; margin-bottom: 4px;">
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
            <div id="window-open-color-row" style="position: relative; display: flex; align-items: flex-end; margin-top: 8px;">
              <ha-textfield label="${getTranslation(h, "window_open_color")}" id="window-open-color" cfg="window_open_color" style="width: 100%"></ha-textfield>
              <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                 <div class="color-popover">
                    <ha-textfield id="window-open-color-popover" class="i" cfg="window_open_color" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></ha-textfield>
                 </div>
                 <div class="cp-preview">
                    <div></div>
                    <input type="color" id="window-open-color-picker" class="cl-p i" cfg="window_open_color" title="${getTranslation(h, "color")}" 
                           style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                 </div>
              </div>
            </div>
            <div id="window-closed-color-row" style="position: relative; display: flex; align-items: flex-end; margin-top: 8px;">
              <ha-textfield label="${getTranslation(h, "window_closed_color")}" id="window-closed-color" cfg="window_closed_color" style="width: 100%"></ha-textfield>
              <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                 <div class="color-popover">
                    <ha-textfield id="window-closed-color-popover" class="i" cfg="window_closed_color" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></ha-textfield>
                 </div>
                 <div class="cp-preview">
                    <div></div>
                    <input type="color" id="window-closed-color-picker" class="cl-p i" cfg="window_closed_color" title="${getTranslation(h, "color")}" 
                           style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                 </div>
              </div>
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
          <input type="color" id="global-btn-bg-picker" class="cl-p" cfg="global_button_background" style="margin-right: 0px">
        </div>
        <div class="bg-presets" id="global-btn-bg-presets">
          <button type="button" class="bg-preset" data-val="">Default</button>
          <button type="button" class="bg-preset" data-val="rgba(0,0,0,0)">Transparent</button>
          <button type="button" class="bg-preset" data-val="rgba(128,128,128,0.08)">Subtle</button>
          <button type="button" class="bg-preset" data-val="rgba(128,128,128,0.18)">Tinted</button>
          <button type="button" class="bg-preset" data-val="var(--card-background-color)">Solid</button>
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
    const actionsHead = this.shadowRoot.getElementById("actions-head");
    if (actionsHead) {
      actionsHead.addEventListener("click", () => {
        this._actionsSectionOpen = !this._actionsSectionOpen;
        this._updateActionsSectionUI();
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
      const evType = (e.localName === "ha-textfield" || e.localName === "input") ? "change" : "value-changed";
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
    
    const infoLinePosSel = this.shadowRoot.getElementById("info-line-pos-sel");
    if (infoLinePosSel) {
      infoLinePosSel.hass = h;
      infoLinePosSel.selector = { select: { mode: "dropdown", options: [
        { value: "header", label: getTranslation(h, "info_position_header") },
        { value: "below_header", label: getTranslation(h, "info_position_below") }
      ]}};
      infoLinePosSel.value = this._config?.info_line_position || "header";
      infoLinePosSel.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        const next = { ...this._config };
        if (e.detail.value === "header" || !e.detail.value) delete next.info_line_position;
        else next.info_line_position = e.detail.value;
        this._fire(next);
      });
    }

    const layoutHead = this.shadowRoot.getElementById("layout-head");
    if (layoutHead) {
      layoutHead.addEventListener("click", () => {
        this._layoutSectionOpen = !this._layoutSectionOpen;
        this._updateHeaderSectionUI();
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
          const val = this._config?.header_name_offset ?? 0;
          if (val > 0) next.header_info_offset = val; else delete next.header_info_offset;
        } else {
          delete next.header_sync_offsets;
        }
        this._fire(next);
      });
    }
    const actOpts = [
      { value: "more-info", label: getTranslation(h, "act_more") || "Details (Default)" },
      { value: "toggle", label: getTranslation(h, "act_toggle") || "Toggle" },
      { value: "navigate", label: getTranslation(h, "act_navigate") || "Navigate" },
      { value: "none", label: getTranslation(h, "act_none") || "None" }
    ];
    const tapActionSelect = this.shadowRoot.getElementById("tap-action");
    const holdActionSelect = this.shadowRoot.getElementById("hold-action");
    const dblActionSelect = this.shadowRoot.getElementById("dbl-action");
    const tapServiceInput = this.shadowRoot.getElementById("tap-service");
    const tapServiceDataInput = this.shadowRoot.getElementById("tap-service-data");
    const tapTargetPicker = this.shadowRoot.getElementById("tap-target");
    const tapNavPath = this.shadowRoot.getElementById("tap-nav-path");
    const holdServiceInput = this.shadowRoot.getElementById("hold-service");
    const holdServiceDataInput = this.shadowRoot.getElementById("hold-service-data");
    const holdTargetPicker = this.shadowRoot.getElementById("hold-target");
    const holdNavPath = this.shadowRoot.getElementById("hold-nav-path");
    const dblServiceInput = this.shadowRoot.getElementById("dbl-service");
    const dblServiceDataInput = this.shadowRoot.getElementById("dbl-service-data");
    const dblTargetPicker = this.shadowRoot.getElementById("dbl-target");
    const dblNavPath = this.shadowRoot.getElementById("dbl-nav-path");

    if (tapTargetPicker) tapTargetPicker.hass = h;
    if (holdTargetPicker) holdTargetPicker.hass = h;
    if (dblTargetPicker) dblTargetPicker.hass = h;
    if (tapNavPath) tapNavPath.hass = h;
    if (holdNavPath) holdNavPath.hass = h;
    if (dblNavPath) dblNavPath.hass = h;

const updateActionFields = (action, serviceField, serviceDataField, targetField, navField, actionConfig) => {
      // Definiere hier, bei welchen Aktionen das Entitäts-Feld angezeigt werden soll
      const needsTarget = ["call-service", "more-info", "toggle"].includes(action);
      
      if (serviceField) serviceField.style.display = action === "call-service" ? "" : "none";
      if (serviceDataField) serviceDataField.style.display = action === "call-service" ? "" : "none";
      if (targetField) targetField.style.display = needsTarget ? "" : "none";
      if (navField) navField.style.display = action === "navigate" ? "" : "none";
      
      if (serviceField) serviceField.value = actionConfig?.service || "";
      if (serviceDataField) {
        const rawData = actionConfig?.service_data;
        serviceDataField.value = rawData === undefined ? "" : (typeof rawData === "string" ? rawData : JSON.stringify(rawData, null, 2));
      }
      if (targetField) {
        const entityId = actionConfig?.target?.entity_id;
        targetField.value = Array.isArray(entityId) ? (entityId[0] || "") : (entityId || "");
      }
      if (navField) {
        navField.value = actionConfig?.navigation_path || "";
        if (this._hass && navField.hass !== this._hass) navField.hass = this._hass;
      }
    };

    if (tapActionSelect) {
      tapActionSelect.hass = h;
      tapActionSelect.selector = { select: { mode: "dropdown", options: actOpts.concat({ value: "call-service", label: getTranslation(h, "act_call_service") || "Action (service)" }) } };
      tapActionSelect.value = this._config?.tap_action?.action || "more-info";
      tapActionSelect.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const action = ev.detail?.value || "more-info";
        const c = { ...this._config };
        c.tap_action = { ...(c.tap_action || {}), action };
 if (action !== "navigate") delete c.tap_action.navigation_path;
        
        // Target nur löschen, wenn es nicht eine der drei unterstützten Aktionen ist
        if (!["call-service", "more-info", "toggle"].includes(action)) {
          delete c.tap_action.target;
        }
        if (action !== "call-service") {
          delete c.tap_action.service;
          delete c.tap_action.service_data;
        }
        if (!c.tap_action.action) delete c.tap_action;
        this._fire(c);
        updateActionFields(action, tapServiceInput, tapServiceDataInput, tapTargetPicker, tapNavPath, c.tap_action);
      });
      updateActionFields(this._config?.tap_action?.action || "more-info", tapServiceInput, tapServiceDataInput, tapTargetPicker, tapNavPath, this._config?.tap_action);
    }
    if (holdActionSelect) {
      holdActionSelect.hass = h;
      holdActionSelect.selector = { select: { mode: "dropdown", options: actOpts.concat({ value: "call-service", label: getTranslation(h, "act_call_service") || "Action (service)" }) } };
      holdActionSelect.value = this._config?.hold_action?.action || "none";
      holdActionSelect.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const action = ev.detail?.value || "none";
        const c = { ...this._config };
        c.hold_action = { ...(c.hold_action || {}), action };
        if (action !== "navigate") delete c.hold_action.navigation_path;
        if (action !== "call-service") {
          delete c.hold_action.service;
          delete c.hold_action.service_data;
          delete c.hold_action.target;
        }
        if (!c.hold_action.action) delete c.hold_action;
        this._fire(c);
        updateActionFields(action, holdServiceInput, holdServiceDataInput, holdTargetPicker, holdNavPath, c.hold_action);
      });
      updateActionFields(this._config?.hold_action?.action || "none", holdServiceInput, holdServiceDataInput, holdTargetPicker, holdNavPath, this._config?.hold_action);
    }
    if (dblActionSelect) {
      dblActionSelect.hass = h;
      dblActionSelect.selector = { select: { mode: "dropdown", options: actOpts.concat({ value: "call-service", label: getTranslation(h, "act_call_service") || "Action (service)" }) } };
      dblActionSelect.value = this._config?.double_tap_action?.action || "none";
      dblActionSelect.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const action = ev.detail?.value || "none";
        const c = { ...this._config };
        c.double_tap_action = { ...(c.double_tap_action || {}), action };
        if (action !== "navigate") delete c.double_tap_action.navigation_path;
        if (action !== "call-service") {
          delete c.double_tap_action.service;
          delete c.double_tap_action.service_data;
          delete c.double_tap_action.target;
        }
        if (!c.double_tap_action.action) delete c.double_tap_action;
        this._fire(c);
        updateActionFields(action, dblServiceInput, dblServiceDataInput, dblTargetPicker, dblNavPath, c.double_tap_action);
      });
      updateActionFields(this._config?.double_tap_action?.action || "none", dblServiceInput, dblServiceDataInput, dblTargetPicker, dblNavPath, this._config?.double_tap_action);
    }
    if (tapServiceInput) {
      tapServiceInput.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.target.value || "");
        const c = { ...this._config };
        c.tap_action = { ...(c.tap_action || {}), action: "call-service" };
        if (value) c.tap_action.service = value;
        else delete c.tap_action.service;
        this._fire(c);
      });
    }
    if (tapServiceDataInput) {
      tapServiceDataInput.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const raw = trimStr(ev.target.value || "");
        const c = { ...this._config };
        c.tap_action = { ...(c.tap_action || {}), action: "call-service" };
        if (raw) {
          try { c.tap_action.service_data = JSON.parse(raw); }
          catch { c.tap_action.service_data = raw; }
        } else {
          delete c.tap_action.service_data;
        }
        this._fire(c);
      });
    }
    if (tapTargetPicker) {
      tapTargetPicker.hass = h;
      tapTargetPicker.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.detail?.value || "");
        const action = tapActionSelect?.value || this._config?.tap_action?.action || "more-info";
        const c = { ...this._config };
        c.tap_action = { ...(c.tap_action || {}), action };
        const needsTarget = ["call-service", "more-info", "toggle"].includes(action);
        if (needsTarget && value) c.tap_action.target = { entity_id: value };
        else delete c.tap_action.target;
        if (action !== "call-service") {
          delete c.tap_action.service;
          delete c.tap_action.service_data;
        }
        this._fire(c);
      });
    }
    if (holdServiceInput) {
      holdServiceInput.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.target.value || "");
        const c = { ...this._config };
        c.hold_action = { ...(c.hold_action || {}), action: "call-service" };
        if (value) c.hold_action.service = value;
        else delete c.hold_action.service;
        this._fire(c);
      });
    }
    if (holdServiceDataInput) {
      holdServiceDataInput.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const raw = trimStr(ev.target.value || "");
        const c = { ...this._config };
        c.hold_action = { ...(c.hold_action || {}), action: "call-service" };
        if (raw) {
          try { c.hold_action.service_data = JSON.parse(raw); }
          catch { c.hold_action.service_data = raw; }
        } else {
          delete c.hold_action.service_data;
        }
        this._fire(c);
      });
    }
    if (holdTargetPicker) {
      holdTargetPicker.hass = h;
      holdTargetPicker.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.detail?.value || "");
        const action = holdActionSelect?.value || this._config?.hold_action?.action || "none";
        const c = { ...this._config };
        c.hold_action = { ...(c.hold_action || {}), action };
        const needsTarget = ["call-service", "more-info", "toggle"].includes(action);
        if (needsTarget && value) c.hold_action.target = { entity_id: value };
        else delete c.hold_action.target;
        if (action !== "call-service") {
          delete c.hold_action.service;
          delete c.hold_action.service_data;
        }
        this._fire(c);
      });
    }
    if (dblServiceInput) {
      dblServiceInput.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.target.value || "");
        const c = { ...this._config };
        c.double_tap_action = { ...(c.double_tap_action || {}), action: "call-service" };
        if (value) c.double_tap_action.service = value;
        else delete c.double_tap_action.service;
        this._fire(c);
      });
    }
    if (dblServiceDataInput) {
      dblServiceDataInput.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const raw = trimStr(ev.target.value || "");
        const c = { ...this._config };
        c.double_tap_action = { ...(c.double_tap_action || {}), action: "call-service" };
        if (raw) {
          try { c.double_tap_action.service_data = JSON.parse(raw); }
          catch { c.double_tap_action.service_data = raw; }
        } else {
          delete c.double_tap_action.service_data;
        }
        this._fire(c);
      });
    }
    if (dblTargetPicker) {
      dblTargetPicker.hass = h;
      dblTargetPicker.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.detail?.value || "");
        const action = dblActionSelect?.value || this._config?.double_tap_action?.action || "none";
        const c = { ...this._config };
        c.double_tap_action = { ...(c.double_tap_action || {}), action };
        const needsTarget = ["call-service", "more-info", "toggle"].includes(action);
        if (needsTarget && value) c.double_tap_action.target = { entity_id: value };
        else delete c.double_tap_action.target;
        if (action !== "call-service") {
          delete c.double_tap_action.service;
          delete c.double_tap_action.service_data;
        }
        this._fire(c);
      });
    }
    if (tapNavPath) {
      tapNavPath.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.detail?.value || "");
        const c = { ...this._config };
        c.tap_action = { ...(c.tap_action || {}), action: "navigate" };
        if (value) c.tap_action.navigation_path = value;
        else delete c.tap_action.navigation_path;
        this._fire(c);
        updateActionFields("navigate", tapServiceInput, tapServiceDataInput, tapTargetPicker, tapNavPath, c.tap_action);
      });
    }
    if (holdNavPath) {
      holdNavPath.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.detail?.value || "");
        const c = { ...this._config };
        c.hold_action = { ...(c.hold_action || {}), action: "navigate" };
        if (value) c.hold_action.navigation_path = value;
        else delete c.hold_action.navigation_path;
        this._fire(c);
        updateActionFields("navigate", holdServiceInput, holdServiceDataInput, holdTargetPicker, holdNavPath, c.hold_action);
      });
    }
    if (dblNavPath) {
      dblNavPath.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.detail?.value || "");
        const c = { ...this._config };
        c.double_tap_action = { ...(c.double_tap_action || {}), action: "navigate" };
        if (value) c.double_tap_action.navigation_path = value;
        else delete c.double_tap_action.navigation_path;
        this._fire(c);
        updateActionFields("navigate", dblServiceInput, dblServiceDataInput, dblTargetPicker, dblNavPath, c.double_tap_action);
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
    const showNameToggle = this.shadowRoot.getElementById("show-name-toggle");
    if (showNameToggle) {
      showNameToggle.checked = this._config?.show_name !== false;
      showNameToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        this._fire({ ...this._config, show_name: ev.target.checked !== false });
      });
    }
    
    const behaviorSel = this.shadowRoot.getElementById("behavior-sel");
    if (behaviorSel) {
      behaviorSel.hass = h;
      behaviorSel.selector = { select: { mode: "dropdown", options: [
        {value: "fixed", label: getTranslation(h, "behavior_fixed")},
        {value: "collapsed", label: getTranslation(h, "behavior_collapsed")},
        {value: "expanded", label: getTranslation(h, "behavior_expanded")},
        {value: "remember", label: getTranslation(h, "behavior_remember")}
      ]}};
      const isColl = this._config?.collapsible === true;
      const noRem = this._config?.remember_state === false;
      const isColld = this._config?.default_state === "collapsed";
      behaviorSel.value = !isColl ? "fixed" : (!noRem ? "remember" : (isColld ? "collapsed" : "expanded"));
      behaviorSel.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const v = ev.detail.value;
        const next = { ...this._config };
        if (v === "fixed") {
          delete next.collapsible;
          delete next.default_state;
          delete next.remember_state;
        } else if (v === "collapsed") {
          next.collapsible = true;
          next.default_state = "collapsed";
          next.remember_state = false;
        } else if (v === "expanded") {
          next.collapsible = true;
          delete next.default_state;
          next.remember_state = false;
        } else {
          next.collapsible = true;
          delete next.default_state;
          delete next.remember_state;
        }
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
      globalLabelPos.selector = {
        select: {
          mode: "dropdown", options: [
            { value: "right", label: getTranslation(h, "pos_right") || "Rechts" },
            { value: "bottom", label: getTranslation(h, "pos_bottom") || "Unten" },
            { value: "top", label: getTranslation(h, "pos_top") || "Oben" },
            { value: "left", label: getTranslation(h, "pos_left") || "Links" }
          ]
        }
      };
      globalLabelPos.value = this._config?.global_label_position ?? this._config?.buttons_label_position ?? "right";
      globalLabelPos.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const v = ev.detail?.value;
        
        // FIX 1: Wert sofort hart in die UI schreiben
        ev.target.value = v; 
        
        const next = { ...this._config };
        
        // FIX 2: YAML sauber halten & veraltete Keys löschen
        if (v === "right" || !v) {
          delete next.global_label_position;
          delete next.buttons_label_position; 
        } else {
          next.global_label_position = v;
          delete next.buttons_label_position;
        }
        
        this._fire(next);
        // FIX 3: KEIN this.renBtn() aufrufen! Das würde die UI zerstören.
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
      const globalBtnBgPresets = this.shadowRoot.querySelectorAll("#global-btn-bg-presets .bg-preset");
      globalBtnBgPresets.forEach(btn => {
        btn.addEventListener("click", () => {
          const val = btn.getAttribute("data-val");
          globalBtnBg.value = val;
          globalBtnBg.dispatchEvent(new Event("change"));
        });
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
      tmplSelect.hass = h;
      tmplSelect.selector = { select: { mode: "dropdown", options: this._getControlTemplates().map((t) => ({ value: t.id, label: t.label })) } };
      
      // Einen Frame warten, damit der deutsche Text sauber lädt (Timing-Fix)
      requestAnimationFrame(() => {
        tmplSelect.value = this._quickAddType;
      });

      tmplSelect.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const tid = ev.detail.value;
        if (!tid) return;
        
        // FIX 1: Das Dropdown sofort zwingen, den Text visuell zu behalten!
        ev.target.value = tid;
        
        this._quickAddType = tid;
        const template = this._getTemplateById(tid);
        const domains = template?.domains || [];
        this._quickAddEntity = "";
        
        if (tmplEntity) { 
          // FIX 2: Das rechte Feld (Entität) sofort optisch leeren, da der Typ gewechselt wurde
          tmplEntity.value = "";
          tmplEntity.selector = domains.length > 0 ? { entity: { domain: domains } } : { entity: {} }; 
        }
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

  _updateActionsSectionUI() {
    const section = this.shadowRoot?.getElementById("actions-sec");
    const content = this.shadowRoot?.getElementById("actions-sec-content");
    const chev = this.shadowRoot?.getElementById("actions-chev");
    if (content) content.hidden = !this._actionsSectionOpen;
    if (section) section.classList.toggle("open", this._actionsSectionOpen);
    if (chev) chev.style.transform = this._actionsSectionOpen ? "rotate(90deg)" : "";
  }

  _updateHeaderSectionUI() {
    const content = this.shadowRoot?.getElementById("header-sec-content");
    const chev = this.shadowRoot?.getElementById("header-sec-chev");
    if (content) content.hidden = !this._headerSectionOpen;
    if (chev) chev.style.transform = this._headerSectionOpen ? "rotate(90deg)" : "";

    const layoutC = this.shadowRoot?.getElementById("layout-content");
    const layoutCh = this.shadowRoot?.getElementById("layout-chev");
    if (layoutC) layoutC.hidden = !this._layoutSectionOpen;
    if (layoutCh) layoutCh.style.transform = this._layoutSectionOpen ? "rotate(90deg)" : "";
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

    const climatePicker = content.querySelector('ha-entity-picker[cfg="entity"]');
    if (climatePicker) {
      climatePicker.hess = h;
      climatePicker.value = this._config?.entity || "";
      climatePicker.onclick = (e) => e.stopPropagation();
      climatePicker.onvaluechanged = (e) => {
        e.stopPropagation();
        this._fire({ ...this._config, entity: e.detail?.value || "" });
      };
    }

    const autoToggle = content.querySelector("#auto-climate-btn-toggle");
    if (autoToggle) {
      autoToggle.checked = !!this._config?.auto_climate_button;
      autoToggle.onclick = (e) => e.stopPropagation();
      autoToggle.onchange = (e) => {
        e.stopPropagation();
        this._fire({ ...this._config, auto_climate_button: e.target.checked });
      };
    }

    const bgField = content.querySelector("#standard-badge-bg");
    const bgPop = content.querySelector("#standard-badge-bg-popover");
    const bgPicker = content.querySelector("#standard-badge-bg-picker");
    const bgPrv = bgPicker?.closest(".cp-preview")?.querySelector("div");
    const bgVal = this._config?.header_info_background || "";

    if (bgField) {
      bgField.value = bgVal;
      bgField.onclick = (e) => e.stopPropagation();
      bgField.onchange = (e) => {
        e.stopPropagation();
        const v = trimStr(e.target.value || "");
        this._fire({ ...this._config, header_info_background: v });
      };
    }
    if (bgPop) {
      bgPop.value = bgVal;
      bgPop.onclick = (e) => e.stopPropagation();
      bgPop.onchange = (e) => {
        e.stopPropagation();
        const v = trimStr(e.target.value || "");
        this._fire({ ...this._config, header_info_background: v });
      };
    }
    if (bgPicker) {
      bgPicker.value = parseColorToPickerHex(bgVal);
      if (bgPrv) bgPrv.style.backgroundColor = bgVal || "transparent";
      bgPicker.onclick = (e) => e.stopPropagation();
      bgPicker.onchange = (e) => {
        e.stopPropagation();
        const rgba = hexToRgba(e.target.value, 0.25);
        this._fire({ ...this._config, header_info_background: rgba });
      };
    }

    const hlaShow = content.querySelector("#hla-show");
    if (hlaShow) {
      hlaShow.checked = this._config?.show_card_last_activity === true;
      hlaShow.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const c = { ...this._config };
        if (ev.target.checked) c.show_card_last_activity = true;
        else delete c.show_card_last_activity;
        this._fire(c);
      });
    }
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

      const labelRow = document.createElement("div");
      labelRow.style.cssText = "display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;";

      const lf = document.createElement("ha-textfield");
      lf.label = getTranslation(h, "badge_label");
      lf.placeholder = h?.states[badge.entity]?.attributes?.friendly_name || "";
      lf.value = badge.label || "";
      lf.style.width = "100%";
      lf.addEventListener("change", (ev) => {
        ev.stopPropagation();
        updBadge(idx, "label", ev.target.value || "");
      });
      labelRow.appendChild(lf);

      const toggleRow = document.createElement("div");
      toggleRow.style.cssText = "display: flex; gap: 16px; align-items: center; padding-left: 4px;";

      const nameFormfield = document.createElement("ha-formfield");
      nameFormfield.label = getTranslation(h, "show_name");
      const nameSwitch = document.createElement("ha-switch");
      nameSwitch.checked = badge.show_name !== false;
      nameSwitch.addEventListener("change", (ev) => {
        ev.stopPropagation();
        updBadge(idx, "show_name", ev.target.checked !== false);
      });
      nameFormfield.appendChild(nameSwitch);
      toggleRow.appendChild(nameFormfield);

      const lcFormfield = document.createElement("ha-formfield");
      lcFormfield.label = getTranslation(h, "show_last_changed");
      const lcSwitch = document.createElement("ha-switch");
      lcSwitch.checked = badge.show_last_changed === true;
      lcSwitch.addEventListener("change", (ev) => {
        ev.stopPropagation();
        updBadge(idx, "show_last_changed", ev.target.checked === true);
      });
      lcFormfield.appendChild(lcSwitch);
      toggleRow.appendChild(lcFormfield);

      labelRow.appendChild(toggleRow);
      box.appendChild(labelRow);

      const bgRow = document.createElement("div");
      bgRow.style.cssText = "position: relative; display: flex; align-items: flex-end; margin-bottom: 8px;";

      const bgField = document.createElement("ha-textfield");
      bgField.label = getTranslation(h, "badge_background");
      bgField.style.width = "100%";
      bgField.value = badge.background || "";
      bgField.addEventListener("change", (ev) => {
        ev.stopPropagation();
        updBadge(idx, "background", trimStr(ev.target.value || ""));
      });
      bgRow.appendChild(bgField);

      const colorContainer = document.createElement("div");
      colorContainer.className = "color-container";
      colorContainer.style.cssText = "position: absolute; right: 8px; bottom: 8px; z-index: 1;";

      const popover = document.createElement("div");
      popover.className = "color-popover";
      const popoverField = document.createElement("ha-textfield");
      popoverField.placeholder = "#hex / rgba";
      popoverField.style.cssText = "width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;";
      popoverField.value = badge.background || "";
      popoverField.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const v = trimStr(ev.target.value || "");
        updBadge(idx, "background", v);
        cpInner.style.backgroundColor = v;
      });
      popover.appendChild(popoverField);
      colorContainer.appendChild(popover);

      const cpPreview = document.createElement("div");
      cpPreview.className = "cp-preview";
      const cpInner = document.createElement("div");
      cpInner.style.backgroundColor = badge.background || "transparent";
      cpPreview.appendChild(cpInner);

      const bgPicker = document.createElement("input");
      bgPicker.type = "color";
      bgPicker.style.cssText = "position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;";
      bgPicker.value = parseColorToPickerHex(badge.background);
      bgPicker.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const hex = ev.target.value;
        const rgba = hexToRgba(hex, 0.25);
        updBadge(idx, "background", rgba);
        cpInner.style.backgroundColor = rgba;
        popoverField.value = rgba;
        bgField.value = rgba;
      });
      cpPreview.appendChild(bgPicker);
      colorContainer.appendChild(cpPreview);
      bgRow.appendChild(colorContainer);

      box.appendChild(bgRow);
      list.appendChild(box);
    });

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

  _saveAllScrollPositions() {
    const saved = [];
    const seen = new WeakSet();
    const scan = (root) => {
      try {
        const iter = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
        let node;
        while ((node = iter.nextNode())) {
          if (seen.has(node)) continue;
          seen.add(node);
          if (node.scrollTop > 0 || node.scrollLeft > 0) {
            saved.push({ el: node, top: node.scrollTop, left: node.scrollLeft });
          }
          if (node.shadowRoot) scan(node.shadowRoot);
        }
      } catch (_e) { }
    };
    scan(document.body);
    return saved;
  }

  renBtn() {
    if (!this._config?.controls) return;
    const div = this.shadowRoot.getElementById("b"); if (!div) return;
    const h = this._hass;
    if (!h) return;
    this._syncControlIds();
    const actOpts = [
      { value: "more-info", label: getTranslation(h, "act_more") || "Details (Default)" },
      { value: "toggle", label: getTranslation(h, "act_toggle") || "Toggle" },
      { value: "navigate", label: getTranslation(h, "act_navigate") || "Navigate" },
      { value: "none", label: getTranslation(h, "act_none") || "None" }
    ];
    const boxes = [];
    this._config.controls.forEach((ctrl, i) => {
      const box = document.createElement("details"); box.className = "box";
      const isTemplate = ctrl.type === "template";
      const hideEntity = isTemplate ? "hidden" : "";
      const showTemplate = isTemplate ? "" : "hidden";
      const hideColor = "";
      const showNav = ctrl.tap_action?.action === "navigate" ? "" : "hidden";
      const key = this._controlIds[i] || this._makeControlId();
      this._controlIds[i] = key;
      box.dataset.controlId = key;
      box.addEventListener("pointerdown", () => { this._lastInteractedControlId = key; });
      box.addEventListener("focusin", () => { this._lastInteractedControlId = key; });
      this._collapsedState = this._collapsedState || {};
      if (this._collapsedState[key] === undefined) this._collapsedState[key] = true;
      const r_dom = (ctrl.entity || "").split(".")[0];
      const r_st = h.states[ctrl.entity];
      const r_supp = r_st?.attributes?.supported_color_modes || [];
      const r_hasColorTemp = r_supp.includes("color_temp") || r_st?.attributes?.color_temp !== undefined;
      const showStyle = ctrl.control_mode === "slider" ? "block" : "none";
      const showMode = (ctrl.control_mode === "slider" && r_dom === "light" && r_hasColorTemp) ? "block" : "none";
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
          <div class="row" style="align-items: flex-end;">
            <ha-textfield class="nm" label="${getTranslation(h, "name")}"></ha-textfield>
            <div style="position: relative; flex: 1; display: flex; align-items: flex-end;">
              <ha-icon-picker class="ic" label="${getTranslation(h, "icon")}" style="width: 100%;"></ha-icon-picker>
              <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                 <div class="color-popover">
                    <ha-textfield class="cl-pop" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></ha-textfield>
                 </div>
                 <div class="cp-preview">
                    <div></div>
                    <input type="color" class="cp cl-p" title="${getTranslation(h, "color")}" 
                           style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                 </div>
              </div>
            </div>
          </div>
          <div class="row" style="align-items: start;"><ha-selector class="ht" label="${getTranslation(h, "height")}" style="width:100%;"></ha-selector><ha-selector class="wd" label="${getTranslation(h, "width")}" style="width:100%;"></ha-selector></div>
          <div style="position: relative; display: flex; align-items: flex-end; margin-top: 4px;">
            <ha-textfield class="bg-txt" label="${getTranslation(h, "button_bg")}" style="width: 100%"></ha-textfield>
            <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
               <div class="color-popover">
                  <ha-textfield class="bg-txt-pop" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></ha-textfield>
               </div>
               <div class="cp-preview">
                  <div></div>
                  <input type="color" class="cp bg-cp" title="${getTranslation(h, "color")}" 
                         style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
               </div>
            </div>
          </div>
          <div class="bg-presets local-bg-presets">
            <button type="button" class="bg-preset" data-val="">Default</button>
            <button type="button" class="bg-preset" data-val="rgba(0,0,0,0)">Transparent</button>
            <button type="button" class="bg-preset" data-val="rgba(128,128,128,0.08)">Subtle</button>
            <button type="button" class="bg-preset" data-val="rgba(128,128,128,0.18)">Tinted</button>
            <button type="button" class="bg-preset" data-val="var(--card-background-color)">Solid</button>
          </div>
        </div>
        <details class="tmpl-only tmpl-details ${showTemplate}" ${isTemplate ? "open" : ""}>
          <summary>${getTranslation(h, "type_template")}</summary>
          <ha-textfield class="tc" label="${getTranslation(h, "tmpl_content")}"></ha-textfield>
          <div class="row"><ha-textfield class="ti" label="${getTranslation(h, "tmpl_icon")}"></ha-textfield><ha-textfield class="tcl" label="${getTranslation(h, "tmpl_color")}"></ha-textfield></div>
          <ha-textfield class="ts" label="${getTranslation(h, "tmpl_state")}"></ha-textfield>
          <div class="tmpl-preview"><span>${getTranslation(h, "tmpl_preview")}:</span> <ha-icon class="tp-ic"></ha-icon> <span class="tp-tx"></span></div>
        </details>
        <div class="row" style="margin-top:8px; align-items:center"><ha-selector class="al" label="${getTranslation(h, "align")}"></ha-selector><ha-selector class="lp" label="${getTranslation(h, "label_position")}"></ha-selector><ha-selector class="tl" label="${getTranslation(h, "text_layout")}"></ha-selector><ha-formfield label="${getTranslation(h, "show_state")}"><ha-switch class="ss" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_label")}"><ha-switch class="sl" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_icon")}"><ha-switch class="si" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_last_changed")}"><ha-switch class="slc"></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "visible")}"><ha-switch class="hd" checked></ha-switch></ha-formfield></div>
        <div class="entity-only ${hideEntity}" style="margin-top:12px; border-top:1px solid var(--divider-color); padding-top:12px">
           <ha-textfield class="isz" label="${getTranslation(h, "icon_size")}" type="number" style="max-width:120px" placeholder="20"></ha-textfield>
           <ha-selector class="cm" label="${getTranslation(h, "control_mode")}"></ha-selector>
           <div class="sst-wrap" style="display:${showStyle};margin-bottom:8px;">
             <ha-selector class="sst" label="${getTranslation(h, "slider_style")}"></ha-selector>
           </div>
           <div class="sm-wrap" style="display:${showMode};margin-bottom:8px;">
             <ha-selector class="sm" label="${getTranslation(h, "slider_mode")}"></ha-selector>
           </div>
           <ha-selector class="tap" label="${getTranslation(h, "tap_action")}"></ha-selector>
           <ha-textfield class="tap-nav ${showNav}" label="Nav Pfad"></ha-textfield>
           <ha-selector class="hold" label="${getTranslation(h, "hold_action")}"></ha-selector>
           <ha-selector class="dbl" label="${getTranslation(h, "double_tap_action")}"></ha-selector>
        </div>
        <div class="entity-only cover-only ${hideEntity}" style="margin-top:8px; border-top:1px solid var(--divider-color); padding-top:8px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <ha-formfield label="${getTranslation(h, "show_cover_presets")}"><ha-switch class="scp"></ha-switch></ha-formfield>
            <ha-textfield class="cpv" label="${getTranslation(h, "cover_presets_label")}" placeholder="0, 25, 50, 75, 100" style="flex:1;min-width:160px"></ha-textfield>
          </div>
        </div>
        <div class="entity-only climate-only ${hideEntity}" style="margin-top:8px; border-top:1px solid var(--divider-color); padding-top:8px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <ha-formfield label="${getTranslation(h, "show_climate_presets")}"><ha-switch class="sctp"></ha-switch></ha-formfield>
            <ha-textfield class="ctpv" label="${getTranslation(h, "climate_presets_label")}" placeholder="0, 18, 20, auto, max" style="flex:1;min-width:160px"></ha-textfield>
          </div>
        </div>
        <div class="entity-only ${hideEntity}" style="margin-top:8px; border-top:1px solid var(--divider-color); padding-top:8px">
          <div class="image-title" style="margin-bottom:8px; font-weight:bold">${getTranslation(h, "sub_chips")}</div>
          <div style="margin-bottom:8px">
            <ha-selector class="chips-pos-sel" label="${getTranslation(h, "chips_position")}"></ha-selector>
          </div>
          <div class="chips-list"></div>
          <mwc-button class="add-chip" style="margin-top:8px">
            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
            ${getTranslation(h, "chip_add")}
          </mwc-button>
        </div>
        <div style="margin-top:8px; border-top:1px solid var(--divider-color); padding-top:8px">
          <div class="image-title" style="margin-bottom:8px; font-weight:bold">${getTranslation(h, "visibility_cond")}</div>
          <ha-card-conditions-editor class="vis-cond-editor"></ha-card-conditions-editor>
        </div>
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
      const upd = (k, v, skipRender = false) => { keepOpen(); const c = [...this._config.controls]; c[i] = { ...c[i], [k]: v }; if (skipRender) { this._lastRenderedControlsSig = JSON.stringify(c); } this._fire({ ...this._config, controls: c }); };
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
        rt.selector = {
          select: {
            mode: "dropdown", options: [
              { value: "entity", label: getTranslation(h, "type_entity") },
              { value: "template", label: getTranslation(h, "type_template") }
            ]
          }
        };
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
      const ep = box.querySelector(".ep"); if (ep) {
        ep.hass = h; ep.value = ctrl.entity; ep.addEventListener("value-changed", e => {
          const val = e.detail.value; const st = h.states[val]; const c = [...this._config.controls];
          const epDomain = val?.split(".")[0] || "";
          let next = { ...c[i], entity: val };
          if (st?.attributes?.friendly_name) next.name = st.attributes.friendly_name;
          if (DOMAIN_STATE_ICON_MAPS[epDomain]) {
            delete next.icon;
          } else {
            next.icon = st?.attributes?.icon || this._iconForEntity(val);
          }
          keepOpen(); c[i] = next; this._fire({ ...this._config, controls: c }); this.renBtn();
        });
      }
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

      const clPop = box.querySelector(".cl-pop");
      const clp = box.querySelector(".cl-p");
      const clPrv = clp?.closest(".cp-preview")?.querySelector("div");
      if (clPop) {
        clPop.value = ctrl.color || "";
        clPop.addEventListener("change", e => {
          const val = e.target.value;
          upd("color", val);
          if (clp) clp.value = parseColorToPickerHex(val);
          if (clPrv) clPrv.style.backgroundColor = val;
        });
      }
      if (clp) {
        clp.value = parseColorToPickerHex(ctrl.color || "#000000");
        if (clPrv) clPrv.style.backgroundColor = ctrl.color || "#000000";
        clp.addEventListener("input", e => {
          const val = e.target.value;
          upd("color", val);
          if (clPop) clPop.value = val;
          if (clPrv) clPrv.style.backgroundColor = val;
        });
      }

      const bgTxt = box.querySelector(".bg-txt");
      const bgPop = box.querySelector(".bg-txt-pop");
      const bgCp = box.querySelector(".bg-cp");
      const bgPrv = bgCp?.closest(".cp-preview")?.querySelector("div");
      if (bgTxt) {
        bgTxt.value = ctrl.button_background || "";
        bgTxt.addEventListener("change", e => {
          const val = trimStr(e.target.value || "");
          upd("button_background", val);
          if (bgPop) bgPop.value = val;
          if (bgCp) bgCp.value = parseColorToPickerHex(val);
          if (bgPrv) bgPrv.style.backgroundColor = val;
        });
      }
      if (bgPop) {
        bgPop.value = ctrl.button_background || "";
        bgPop.addEventListener("change", e => {
          const val = trimStr(e.target.value || "");
          upd("button_background", val);
          if (bgTxt) bgTxt.value = val;
          if (bgCp) bgCp.value = parseColorToPickerHex(val);
          if (bgPrv) bgPrv.style.backgroundColor = val;
        });
      }
      if (bgCp) {
        bgCp.value = parseColorToPickerHex(ctrl.button_background || "#ffffff");
        if (bgPrv) bgPrv.style.backgroundColor = ctrl.button_background || "#ffffff";
        bgCp.addEventListener("input", e => {
          const val = e.target.value;
          upd("button_background", val);
          if (bgTxt) bgTxt.value = val;
          if (bgPop) bgPop.value = val;
          if (bgPrv) bgPrv.style.backgroundColor = val;
        });
      }
      box.querySelectorAll(".local-bg-presets .bg-preset").forEach(btn => {
        btn.addEventListener("click", () => {
          const val = btn.getAttribute("data-val");
          if (bgTxt) bgTxt.value = val;
          if (bgPop) bgPop.value = val;
          if (bgCp) bgCp.value = parseColorToPickerHex(val || "#ffffff");
          if (bgPrv) bgPrv.style.backgroundColor = val || "#ffffff";
          upd("button_background", val);
        });
      });
      const isz = box.querySelector(".isz"); if (isz) {
        const rawIsz = trimStr(ctrl.icon_size) || "";
        isz.value = /^\d+(\.\d+)?(px)?$/.test(rawIsz) ? rawIsz.replace("px", "") : rawIsz;
        isz.addEventListener("change", e => { e.stopPropagation(); const v = e.target.value.trim(); upd("icon_size", v || undefined); });
      }
      
      const coverOnly = box.querySelector(".cover-only");
      const ctrlDomain = ctrl.entity?.split(".")?.[0] || "";
      if (coverOnly) {
        coverOnly.hidden = ctrlDomain !== "cover";
        const scp = coverOnly.querySelector(".scp");
        const cpv = coverOnly.querySelector(".cpv");
        if (scp) {
          scp.checked = ctrl.show_cover_presets === true;
          scp.addEventListener("change", e => {
            e.stopPropagation();
            const c = [...this._config.controls];
            const next = { ...c[i], show_cover_presets: e.target.checked === true };
            if (!e.target.checked) delete next.show_cover_presets;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
        if (cpv) {
          const presets = Array.isArray(ctrl.cover_presets) ? ctrl.cover_presets.join(", ") : (ctrl.cover_presets || "");
          cpv.value = presets;
          cpv.addEventListener("change", e => {
            e.stopPropagation();
            const raw = e.target.value.trim();
            const parsed = raw ? raw.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v)) : undefined;
            const c = [...this._config.controls];
            const next = { ...c[i] };
            if (parsed?.length) next.cover_presets = parsed; else delete next.cover_presets;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
      }
      
      const climateOnly = box.querySelector(".climate-only");
      if (climateOnly) {
        climateOnly.hidden = ctrlDomain !== "climate";
        const sctp = climateOnly.querySelector(".sctp");
        const ctpv = climateOnly.querySelector(".ctpv");
        if (sctp) {
          sctp.checked = ctrl.show_climate_presets === true;
          sctp.addEventListener("change", e => {
            e.stopPropagation();
            const c = [...this._config.controls];
            const next = { ...c[i] };
            if (e.target.checked) next.show_climate_presets = true; else delete next.show_climate_presets;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
        if (ctpv) {
          const presets = Array.isArray(ctrl.climate_presets) ? ctrl.climate_presets.join(", ") : (ctrl.climate_presets || "");
          ctpv.value = presets;
          ctpv.addEventListener("change", e => {
            e.stopPropagation();
            const raw = e.target.value.trim();
            const parsed = raw ? raw.split(",").map(v => {
              const t = v.trim().toLowerCase();
              if (t === "auto" || t === "max") return t;
              const n = parseFloat(t);
              return isNaN(n) ? null : n;
            }).filter(v => v !== null) : undefined;
            const c = [...this._config.controls];
            const next = { ...c[i] };
            if (parsed?.length) next.climate_presets = parsed; else delete next.climate_presets;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
      }
      
      const lightOnly = box.querySelector(".light-only");
      if (lightOnly) {
        lightOnly.hidden = ctrlDomain !== "light";
        const scf = lightOnly.querySelector(".scf");
        const cfvContainer = lightOnly.querySelector(".cfv-swatches");
        if (scf) {
          scf.checked = ctrl.show_color_favorites === true;
          scf.addEventListener("change", e => {
            e.stopPropagation();
            const c = [...this._config.controls];
            const next = { ...c[i] };
            if (e.target.checked) {
              next.show_color_favorites = true;
              if (!next.color_favorites) next.color_favorites = "#ff9800; #2196f3; #4caf50";
            } else { delete next.show_color_favorites; }
            this._lastInteractedControlId = key;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c }); this.renBtn();
          });
        }
        if (cfvContainer) {
          const parseFavToHex = (raw) => {
            const t = String(raw).trim();
            if (/^#[0-9a-f]{6}$/i.test(t)) return t.toLowerCase();
            const parts = t.split(",").map(v => parseInt(v.trim(), 10));
            if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255))
              return "#" + parts.map(p => p.toString(16).padStart(2, "0")).join("");
            return null;
          };
          const getFavsArray = (raw) => {
            if (Array.isArray(raw)) return raw.map(v => parseFavToHex(Array.isArray(v) ? v.join(",") : v)).filter(Boolean);
            if (typeof raw === "string") return raw.split(";").map(s => parseFavToHex(s)).filter(Boolean);
            return [];
          };
          const rebuildSwatches = () => {
            const currentFavs = getFavsArray(this._config.controls[i]?.color_favorites);
            cfvContainer.replaceChildren();
            currentFavs.forEach((hex, idx) => {
              const wrap = document.createElement("div");
              wrap.style.cssText = "position:relative;display:inline-flex;width:24px;height:24px;flex-shrink:0;";
              const swatch = document.createElement("div");
              swatch.style.cssText = `width:24px;height:24px;border-radius:50%;background:${hex};border:2px solid rgba(0,0,0,0.15);box-shadow:0 1px 3px rgba(0,0,0,0.25);`;
              const picker = document.createElement("input");
              picker.type = "color";
              picker.value = hex;
              picker.style.cssText = "position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;border:none;padding:0;";
              picker.addEventListener("pointerdown", e => e.stopPropagation());
              picker.addEventListener("change", e => {
                e.stopPropagation();
                const newFavs = getFavsArray(this._config.controls[i]?.color_favorites);
                newFavs[idx] = e.target.value;
                const c = [...this._config.controls];
                c[i] = { ...c[i], color_favorites: newFavs.join("; ") };
                keepOpen(); this._fire({ ...this._config, controls: c });
                rebuildSwatches();
              });
              const delBtn = document.createElement("button");
              delBtn.type = "button";
              delBtn.style.cssText = "position:absolute;top:-5px;right:-5px;width:14px;height:14px;border-radius:50%;background:#d32f2f;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;font-size:10px;color:white;line-height:1;z-index:1;";
              delBtn.textContent = "×";
              delBtn.addEventListener("pointerdown", e => e.stopPropagation());
              delBtn.addEventListener("click", e => {
                e.stopPropagation();
                const newFavs = getFavsArray(this._config.controls[i]?.color_favorites);
                newFavs.splice(idx, 1);
                const c = [...this._config.controls];
                const next = { ...c[i] };
                if (newFavs.length) next.color_favorites = newFavs.join("; "); else delete next.color_favorites;
                c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
                rebuildSwatches();
              });
              wrap.appendChild(swatch);
              wrap.appendChild(picker);
              wrap.appendChild(delBtn);
              cfvContainer.appendChild(wrap);
            });
            const addWrap = document.createElement("div");
            addWrap.style.cssText = "position:relative;display:inline-flex;width:24px;height:24px;flex-shrink:0;";
            const addPicker = document.createElement("input");
            addPicker.type = "color";
            addPicker.value = "#ff9800";
            addPicker.style.cssText = "position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;border:none;padding:0;";
            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.style.cssText = "width:24px;height:24px;border-radius:50%;background:rgba(128,128,128,0.12);border:1.5px dashed var(--divider-color,rgba(0,0,0,0.25));cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--secondary-text-color);padding:0;line-height:1;";
            addBtn.textContent = "+";
            addPicker.addEventListener("pointerdown", e => e.stopPropagation());
            addPicker.addEventListener("change", e => {
              e.stopPropagation();
              const newFavs = getFavsArray(this._config.controls[i]?.color_favorites);
              newFavs.push(e.target.value);
              const c = [...this._config.controls];
              c[i] = { ...c[i], color_favorites: newFavs.join("; ") };
              keepOpen(); this._fire({ ...this._config, controls: c });
              rebuildSwatches();
            });
            addBtn.addEventListener("pointerdown", e => e.stopPropagation());
            addBtn.addEventListener("click", e => { e.stopPropagation(); addPicker.click(); });
            addWrap.appendChild(addPicker);
            addWrap.appendChild(addBtn);
            cfvContainer.appendChild(addWrap);
          };
          rebuildSwatches();
        }
      }
      
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
      
      const ht = box.querySelector(".ht"); 
      if (ht) {
        ht.hass = h; 
        ht.selector = { number: { min: 40, max: 250, mode: "box", unit_of_measurement: "px" } };
        ht.value = ctrl.height || 60; 
        ht.addEventListener("value-changed", e => { 
          e.stopPropagation(); 
          e.target.value = e.detail.value; // UI sofort zwingen
          upd("height", Number(e.detail.value), true); // skipRender = true
        });
      }
      
 const wd = box.querySelector(".wd"); 
      if (wd) {
        wd.hass = h; 
        wd.selector = { select: { mode: "dropdown", options: [{ value: "60", label: "1/1" }, { value: "40", label: "2/3" }, { value: "30", label: "1/2" }, { value: "20", label: "1/3" }, { value: "15", label: "1/4" }, { value: "12", label: "1/5" }, { value: "10", label: "1/6" }] } };
        wd.value = String(ctrl.width || 15); 
        wd.addEventListener("value-changed", e => { 
          e.stopPropagation(); 
          if (!e.detail.value) return;

          // 1. UI sofort auf den neuen Text-Wert zwingen (wie bei lp)
          e.target.value = e.detail.value; 

          // 2. Als Zahl speichern, aber mit 'true' (skipRender) den UI-Abbruch verhindern!
          upd("width", parseInt(e.detail.value, 10), true); 
        });
      }
      
      const al = box.querySelector(".al"); 
      if (al) {
        al.hass = h; 
        al.selector = { select: { mode: "dropdown", options: [{ value: "left", label: getTranslation(h, "left") }, { value: "center", label: getTranslation(h, "center") }, { value: "right", label: getTranslation(h, "right") }] } };
        al.value = ctrl.align || "center"; 
        al.addEventListener("value-changed", e => { 
          e.stopPropagation(); 
          e.target.value = e.detail.value; // UI sofort zwingen
          upd("align", e.detail.value, true); // skipRender = true
        });
      }

      const lp = box.querySelector(".lp"); if (lp) {
        lp.hass = h;
        lp.selector = {
          select: {
            mode: "dropdown", options: [
              { value: "global", label: getTranslation(h, "use_global") || "Global" },
              { value: "right", label: getTranslation(h, "pos_right") || "Rechts" },
              { value: "bottom", label: getTranslation(h, "pos_bottom") || "Unten" },
              { value: "top", label: getTranslation(h, "pos_top") || "Oben" },
              { value: "left", label: getTranslation(h, "pos_left") || "Links" }
            ]
          }
        };
        lp.value = ctrl.label_position || "global";
        lp.addEventListener("value-changed", e => { 
          e.stopPropagation(); 
          const val = e.detail.value;
          
          // FIX 1: UI sofort zwingen, den Text zu behalten
          e.target.value = val;
          
          if (val === "global" || !val) {
            keepOpen();
            const c = [...this._config.controls];
            delete c[i].label_position;
            // FIX 2: Signatur aktualisieren, um unnötigen Re-Render zu blockieren
            this._lastRenderedControlsSig = JSON.stringify(c); 
            this._fire({ ...this._config, controls: c });
          } else {
            // FIX 3: Das 'true' am Ende ist extrem wichtig! Es bedeutet "skipRender = true".
            // Dadurch wird `this.renBtn()` NICHT ausgeführt und das Dropdown stürzt nicht ab.
            upd("label_position", val, true); 
          }
        });
      }
const tl = box.querySelector(".tl"); 
      if (tl) {
        tl.hass = h;
        tl.selector = {
          select: {
            mode: "dropdown", options: [
              { value: "state", label: getTranslation(h, "primary_state") || "Wert zuerst" },
              { value: "name", label: getTranslation(h, "primary_name") || "Name zuerst" }
            ]
          }
        };
        tl.value = ctrl.state_first === true ? "state" : "name";
        tl.addEventListener("value-changed", e => { 
          e.stopPropagation(); 
          if (!e.detail.value) return;
          
          const isStateFirst = e.detail.value === "state";
          const currentStateFirst = this._config.controls[i]?.state_first === true;
          
          // Endlos-Schleife & unnötiges Speichern verhindern
          if (isStateFirst === currentStateFirst) return;
          
          // 1. UI sofort zwingen, den Text visuell zu behalten
          e.target.value = e.detail.value; 
          
          // 2. Als Boolean speichern, aber mit 'true' (skipRender) den UI-Abbruch verhindern!
          upd("state_first", isStateFirst, true); 
        });
      }
      const ss = box.querySelector(".ss"); ss.checked = ctrl.show_state !== false; ss.addEventListener("change", e => { e.stopPropagation(); upd("show_state", e.target.checked); });
      const sl = box.querySelector(".sl"); sl.checked = ctrl.show_label !== false; sl.addEventListener("change", e => { e.stopPropagation(); upd("show_label", e.target.checked); });
      const si = box.querySelector(".si"); si.checked = ctrl.show_icon !== false; si.addEventListener("change", e => { e.stopPropagation(); upd("show_icon", e.target.checked); });
      const slc = box.querySelector(".slc"); if (slc) { slc.checked = ctrl.show_last_changed === true; slc.addEventListener("change", e => { e.stopPropagation(); upd("show_last_changed", e.target.checked); }); }
      const hd = box.querySelector(".hd"); hd.checked = !ctrl.hide; hd.addEventListener("change", e => { e.stopPropagation(); upd("hide", !e.target.checked); });
      const tap = box.querySelector(".tap");
      const tapNav = box.querySelector(".tap-nav");
      
      // CSS-Trick: Navigations-Pfad-Feld blitzschnell ein/ausblenden
      const toggleTapNav = (action) => {
        if (!tapNav) return;
        tapNav.classList.toggle("hidden", action !== "navigate");
      };

      // FIX: Eigene schnelle Speicherfunktion OHNE this.renBtn()
      const saveActionFast = (type, val) => {
        keepOpen();
        const c = [...this._config.controls];
        const old = c[i][type] || {};
        c[i] = { ...c[i], [type]: { ...old, action: val } };
        this._lastRenderedControlsSig = JSON.stringify(c); // UI-Neuaufbau hart blockieren
        this._fire({ ...this._config, controls: c });
      };

      if (tap) {
        tap.hass = h; 
        tap.selector = { select: { mode: "dropdown", options: actOpts } };
        const initialTapAction = ctrl.tap_action?.action || "more-info";
        tap.value = initialTapAction;
        toggleTapNav(initialTapAction);
        
        tap.addEventListener("value-changed", e => {
          e.stopPropagation();
          if (!e.detail) return;
          const action = e.detail.value || "more-info";
          
          // Verhindert sinnloses Ausführen
          if (action === (this._config.controls[i]?.tap_action?.action || "more-info")) return;
          
          e.target.value = action; // 1. Dropdown zwingen, den Text zu behalten
          toggleTapNav(action);    // 2. Feld drunter sofort ein-/ausblenden
          saveActionFast("tap_action", action); // 3. Leise speichern
        });
      }
      
      if (tapNav) {
        tapNav.value = ctrl.tap_action?.navigation_path || "";
        tapNav.classList.toggle("hidden", ctrl.tap_action?.action !== "navigate");
        tapNav.addEventListener("change", e => {
          e.stopPropagation();
          const c = [...this._config.controls];
          const action = e.target.value ? { action: "navigate", navigation_path: e.target.value } : { action: "navigate" };
          c[i] = { ...c[i], tap_action: action };
          this._lastRenderedControlsSig = JSON.stringify(c);
          this._fire({ ...this._config, controls: c });
        });
      }
      
      const hold = box.querySelector(".hold"); 
      if (hold) {
        hold.hass = h; 
        hold.selector = { select: { mode: "dropdown", options: actOpts } };
        hold.value = ctrl.hold_action?.action || "toggle"; 
        hold.addEventListener("value-changed", e => { 
          e.stopPropagation(); 
          if (!e.detail) return;
          const action = e.detail.value || "toggle";
          
          if (action === (this._config.controls[i]?.hold_action?.action || "toggle")) return;
          
          e.target.value = action;
          saveActionFast("hold_action", action);
        });
      }
      
      const dbl = box.querySelector(".dbl"); 
      if (dbl) {
        dbl.hass = h; 
        dbl.selector = { select: { mode: "dropdown", options: actOpts } };
        dbl.value = ctrl.double_tap_action?.action || "none"; 
        dbl.addEventListener("value-changed", e => { 
          e.stopPropagation(); 
          if (!e.detail) return;
          const action = e.detail.value || "none";
          
          if (action === (this._config.controls[i]?.double_tap_action?.action || "none")) return;
          
          e.target.value = action;
          saveActionFast("double_tap_action", action);
        });
      }
const cm = box.querySelector(".cm"); 
      if (cm) {
        cm.hass = h; 
        cm.selector = {
          select: {
            mode: "dropdown", options: [
              { value: "none", label: getTranslation(h, "ctrl_default") || "Standard" },
              { value: "slider", label: getTranslation(h, "ctrl_slider") || "Inline Slider" },
              { value: "buttons", label: getTranslation(h, "ctrl_buttons") || "Inline Buttons" }
            ]
          }
        };
        cm.value = ctrl.control_mode || "none";
        cm.addEventListener("value-changed", e => {
          e.stopPropagation();
          const v = e.detail.value || "none";
          const currentMode = this._config.controls[i]?.control_mode || "none";
          if (v === currentMode) return;

          // 1. Dropdown visuell sofort einrasten lassen
          e.target.value = v;

          keepOpen();
          const c = [...this._config.controls];
          
          // 2. SAUBERES LÖSCHEN statt undefined
          if (v === "none") {
            delete c[i].control_mode;
          } else {
            c[i] = { ...c[i], control_mode: v };
          }
          
          // 3. Speichern und UI-Neuaufbau blockieren
          this._lastRenderedControlsSig = JSON.stringify(c);
          this._fire({ ...this._config, controls: c });

          // 4. CSS-Trick: Untermenüs verzögerungsfrei ein/ausblenden
          const sstWrap = box.querySelector(".sst-wrap");
          const smWrap = box.querySelector(".sm-wrap");
          if (sstWrap) sstWrap.style.display = v === "slider" ? "block" : "none";
          if (smWrap) smWrap.style.display = (v === "slider" && r_dom === "light" && r_hasColorTemp) ? "block" : "none";
        });
      }

      const sst = box.querySelector(".sst");
      if (sst) {
        sst.hass = h;
        sst.selector = { select: { mode: "dropdown", options: [
          {value: "inline", label: getTranslation(h, "style_inline") || "Inline"},
          {value: "background", label: getTranslation(h, "style_bg") || "Hintergrund"}
        ]}};
        sst.value = ctrl.slider_style || "inline";
        sst.addEventListener("value-changed", e => {
          e.stopPropagation();
          const v = e.detail.value || "inline";
          const currentStyle = this._config.controls[i]?.slider_style || "inline";
          if (v === currentStyle) return;

          e.target.value = v;

          keepOpen();
          const c = [...this._config.controls];
          
          // SAUBERES LÖSCHEN
          if (v === "inline") {
            delete c[i].slider_style;
          } else {
            c[i] = { ...c[i], slider_style: v };
          }
          
          this._lastRenderedControlsSig = JSON.stringify(c);
          this._fire({ ...this._config, controls: c });
        });
      }

      const sm = box.querySelector(".sm");
      if (sm) {
        sm.hass = h;
        sm.selector = { select: { mode: "dropdown", options: [
          {value: "brightness", label: getTranslation(h, "slider_mode_brightness") || "Helligkeit"},
          {value: "color_temp", label: getTranslation(h, "slider_mode_color_temp") || "Farbtemperatur"}
        ]}};
        sm.value = ctrl.slider_mode || "brightness";
        sm.addEventListener("value-changed", e => {
          e.stopPropagation();
          const v = e.detail.value || "brightness";
          const currentMode = this._config.controls[i]?.slider_mode || "brightness";
          if (v === currentMode) return;

          e.target.value = v;

          keepOpen();
          const c = [...this._config.controls];
          
          // SAUBERES LÖSCHEN
          if (v === "brightness") {
            delete c[i].slider_mode;
          } else {
            c[i] = { ...c[i], slider_mode: v };
          }
          
          this._lastRenderedControlsSig = JSON.stringify(c);
          this._fire({ ...this._config, controls: c });
        });
      }


      const visCondEditor = box.querySelector(".vis-cond-editor");
      if (visCondEditor) {
        visCondEditor.hass = h;
        visCondEditor.conditions = ctrl.visibility || [];
        visCondEditor.addEventListener("value-changed", e => {
          e.stopPropagation();
          visCondEditor.conditions = e.detail.value;
          upd("visibility", e.detail.value, true);
        });
      }

      const chipsPosSel = box.querySelector(".chips-pos-sel");
      const chipsList = box.querySelector(".chips-list");
      const addChipBtn = box.querySelector(".add-chip");
      if (chipsPosSel) {
        chipsPosSel.hass = h; 
        chipsPosSel.selector = { 
          select: { 
            mode: "dropdown", 
            options: [ 
              { value: "bottom", label: getTranslation(h, "chips_bottom") || "Unter dem Titel" }, 
              { value: "top", label: getTranslation(h, "chips_top") || "Über dem Titel" } 
            ]
          }
        };
        chipsPosSel.value = ctrl.chips_position || "bottom";
        chipsPosSel.addEventListener("value-changed", e => { 
          e.stopPropagation(); 
          if (!e.detail.value) return;
          const v = e.detail.value;
          const currentPos = this._config.controls[i]?.chips_position || "bottom";

          // Verhindert doppeltes Feuern
          if (v === currentPos) return;

          // 1. UI-Zwang für das Dropdown
          e.target.value = v;

          // 2. Leise speichern ohne UI-Neuaufbau (skipRender = true)
          upd("chips_position", v, true); 

          // 3. Sofortige optische Verschiebung per DOM-Manipulation
          const btnTxt = box.querySelector(".btn-txt");
          const previewChips = box.querySelector(".btn-chips");
          if (previewChips) {
            if (v === "top") {
              previewChips.classList.add("chips-top");
              if (btnTxt) btnTxt.prepend(previewChips);
            } else {
              previewChips.classList.remove("chips-top");
              if (btnTxt) btnTxt.append(previewChips);
            }
          }
        });
      }

      if (chipsList) {
        this._updateSubChipsUI(chipsList, ctrl, i, h);
      }
      if (addChipBtn && chipsList) {
        addChipBtn.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          const c = [...this._config.controls];
          const chs = Array.isArray(c[i].sub_chips) ? [...c[i].sub_chips] : [];
          chs.push({ entity: "" });
          c[i] = { ...c[i], sub_chips: chs };
          this._lastRenderedControlsSig = JSON.stringify(c);
          this._fire({ ...this._config, controls: c });
          this._updateSubChipsUI(chipsList, c[i], i, h);
        });
      }

      const tpIcon = box.querySelector(".tp-ic");
      const tpText = box.querySelector(".tp-tx");
      if (tpIcon && tpText && isTemplate) {
        const prev = resolveTemplateCtrl(ctrl, h);
        tpIcon.icon = prev.icon || "mdi:circle";
        if (prev.color) tpIcon.style.setProperty("--icon-color", prev.color);
        const previewText = [prev.content || "—", prev.state || ""].filter(Boolean).join(" | ");
        tpText.textContent = previewText || "—";
      }
      boxes.push(box);
    });
    const _scrollState = this._saveAllScrollPositions();
    const _oldH = div.offsetHeight;
    if (_oldH > 0) div.style.minHeight = `${_oldH}px`;
    div.replaceChildren(...boxes);
    this._lastRenderedControlsSig = JSON.stringify(this._config?.controls || []);
    requestAnimationFrame(() => {
      div.style.minHeight = "";
      _scrollState.forEach(({ el, top, left }) => {
        if (el.scrollTop !== top) el.scrollTop = top;
        if (el.scrollLeft !== left) el.scrollLeft = left;
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

    const infoLinePosSel = this.shadowRoot.getElementById("info-line-pos-sel");
    if (infoLinePosSel) {
      const posVal = this._config.info_line_position || "header";
      if (infoLinePosSel.value !== posVal) infoLinePosSel.value = posVal;
    }                           

    const tapActionSel = this.shadowRoot.getElementById("tap-action");
    const holdActionSel = this.shadowRoot.getElementById("hold-action");
    const dblActionSel = this.shadowRoot.getElementById("dbl-action");
    const nav = this.shadowRoot.getElementById("nav-path");
    if (tapActionSel) {
      const tapAction = this._config.tap_action?.action || "more-info";
      if (tapActionSel.value !== tapAction) tapActionSel.value = tapAction;
    }
    if (holdActionSel) {
      const holdAction = this._config.hold_action?.action || "none";
      if (holdActionSel.value !== holdAction) holdActionSel.value = holdAction;
    }
    if (dblActionSel) {
      const dblAction = this._config.double_tap_action?.action || "none";
      if (dblActionSel.value !== dblAction) dblActionSel.value = dblAction;
    }
    if (nav) {
      const navPath = this._config.tap_action?.navigation_path || "";
      nav.hidden = this._config.tap_action?.action !== "navigate";
      if (nav.value !== navPath) nav.value = navPath;
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

    const behaviorSel = this.shadowRoot.getElementById("behavior-sel");
    if (behaviorSel) {
      const isColl = this._config?.collapsible === true;
      const noRem = this._config?.remember_state === false;
      const isColld = this._config?.default_state === "collapsed";
      const v = !isColl ? "fixed" : (!noRem ? "remember" : (isColld ? "collapsed" : "expanded"));
      if (behaviorSel.value !== v) behaviorSel.value = v;
    }
    const hlaShow = this.shadowRoot.getElementById("hla-show");
    if (hlaShow) {
      const v = this._config?.show_card_last_activity === true;
      if (hlaShow.checked !== v) hlaShow.checked = v;
    }
    ["name", "info"].forEach(type => {
      const weightSel = this.shadowRoot.getElementById(`header-${type}-weight-sel`);
      if (weightSel) weightSel.value = this._config[`header_${type}_weight`] || (type === "name" ? "bold" : "normal");
      const styleSel = this.shadowRoot.getElementById(`header-${type}-style-sel`);
      if (styleSel) styleSel.value = this._config[`header_${type}_style`] || "normal";
    });

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

    const syncOffsetsToggle = this.shadowRoot.getElementById("sync-offsets-toggle");
    if (syncOffsetsToggle) {
      syncOffsetsToggle.checked = !!this._config?.header_sync_offsets;
    }

    this.updCp();
  }

  updCp() {
    if (!this._config) return;
    this.shadowRoot.querySelectorAll(".cl-p").forEach(e => {
      const k = e.getAttribute("cfg");
      if (!k) return;
      const v = this._config[k] || "";
      const hex = parseColorToPickerHex(v);
      if (e.value !== hex) e.value = hex;

      const container = e.closest(".color-container");
      if (container) {
        const prev = container.querySelector(".cp-preview div");
        if (prev) prev.style.backgroundColor = v || "transparent";
        const popField = container.querySelector(".color-popover ha-textfield");
        if (popField && popField.value !== v) popField.value = v;
        const mainField = container.closest(".row")?.querySelector(`ha-textfield[cfg="${k}"]`);
        if (mainField && mainField.value !== v) mainField.value = v;
        if (k === "header_info_background") {
          const bgF = this.shadowRoot.getElementById("standard-badge-bg");
          if (bgF && bgF.value !== v) bgF.value = v;
        }
      } else {
        const prev = e.closest(".cp-preview")?.querySelector("div");
        if (prev) prev.style.backgroundColor = v;
        const mainField = this.shadowRoot.querySelector(`ha-textfield[cfg="${k}"]`);
        if (mainField && mainField.value !== v) mainField.value = v;
      }
    });
  }

  _updateSubChipsUI(container, ctrl, ctrlIdx, h) {
    container.replaceChildren();
    const chips = ctrl.sub_chips || [];
    const updChip = (chipIdx, k, v) => {
      const c = [...this._config.controls];
      const chs = [...(c[ctrlIdx].sub_chips || [])];
      chs[chipIdx] = { ...chs[chipIdx], [k]: v };
      if (!v && k !== "entity") delete chs[chipIdx][k];
      c[ctrlIdx] = { ...c[ctrlIdx], sub_chips: chs };
      this._lastRenderedControlsSig = JSON.stringify(c);
      this._fire({ ...this._config, controls: c });
    };

    chips.forEach((chip, chipIdx) => {
      const box = document.createElement("div");
      box.className = "box";
      box.style.cssText = "border:1px solid var(--divider-color); padding:10px; border-radius:8px; position:relative; margin-top:8px";

      const del = document.createElement("ha-icon");
      del.icon = "mdi:delete";
      del.style.cssText = "position:absolute; right:8px; top:8px; cursor:pointer; color:var(--error-color); --mdc-icon-size:18px";
      del.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const c = [...this._config.controls];
        const chs = [...(c[ctrlIdx].sub_chips || [])];
        chs.splice(chipIdx, 1);
        c[ctrlIdx] = { ...c[ctrlIdx], sub_chips: chs };
        this._lastRenderedControlsSig = JSON.stringify(c);
        this._fire({ ...this._config, controls: c });
        this.renBtn();
      };
      box.appendChild(del);

      const ep = document.createElement("ha-entity-picker");
      ep.label = getTranslation(h, "chip_entity");
      ep.hass = h;
      ep.value = chip.entity || "";
      ep.style.width = "100%";
      ep.addEventListener("value-changed", e => { e.stopPropagation(); ep.value = e.detail.value; updChip(chipIdx, "entity", e.detail.value); });
      box.appendChild(ep);

      const row1 = document.createElement("div");
      row1.className = "row";
      row1.style.marginTop = "8px";

      const ap = document.createElement("ha-selector");
      ap.label = getTranslation(h, "chip_attribute");
      ap.hass = h;
      ap.selector = { attribute: { entity_id: chip.entity } };
      ap.value = chip.attribute || "";
      ap.style.flex = "1";
      ap.addEventListener("value-changed", e => { e.stopPropagation(); ap.value = e.detail.value; updChip(chipIdx, "attribute", e.detail.value); });
      row1.appendChild(ap);

      const ip = document.createElement("ha-icon-picker");
      ip.label = getTranslation(h, "chip_icon");
      ip.hass = h;
      ip.value = chip.icon || "";
      ip.style.flex = "1";
      ip.addEventListener("value-changed", e => { e.stopPropagation(); ip.value = e.detail.value; updChip(chipIdx, "icon", e.detail.value); });
      row1.appendChild(ip);
      box.appendChild(row1);

      const lb = document.createElement("ha-textfield");
      lb.label = getTranslation(h, "chip_label");
      lb.value = chip.label || "";
      lb.style.width = "100%";
      lb.style.marginTop = "8px";
      lb.addEventListener("change", e => { e.stopPropagation(); lb.value = e.target.value; updChip(chipIdx, "label", e.target.value); });
      box.appendChild(lb);

      container.appendChild(box);
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

const existingEditor = customElements.get("oneline-room-card-editor");
if (!existingEditor) {
  customElements.define("oneline-room-card-editor", OneLineRoomCardEditor);
} else if (existingEditor !== OneLineRoomCardEditor) {
  patchExistingEditor(existingEditor, OneLineRoomCardEditor);
}

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
