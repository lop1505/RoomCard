import { clampNum, replaceTemplateExpressions, trimStr } from "./lib/values.js";

import { formatEntityStateForDisplay, formatEntityAttributeForDisplay } from "./lib/formatting.js";

import { normalizeTemperatureUnit, convertTemperatureValue, temperatureNumberLocale, formatConvertedTemperature, formatTemperatureStateForDisplay, formatTemperatureAttributeForDisplay } from "./lib/temperature.js";

import { hexToRgba, readableTextForHex, parseColorToPickerHex } from "./lib/colors.js";

import { STATE_DEFINITIONS, DOMAIN_STATE_ICON_MAPS, getEntityDomain, getEntityStateValue, isOfflineStateValue, isEntityOffline, isEntityOn, isEntityOff, isEntityActive } from "./lib/states.js";

import { evaluateAdaptiveImageConditions as evaluateAdaptiveConditions, getConditionEntityDependencies, evaluateRoomModeActiveWhen, evaluateVisibilityCondition } from "./lib/conditions.js";

import { normalizeAlertSensorConfig, isAlertSensorActive } from "./lib/alerts.js";

import { TRANSLATIONS, getTranslation } from "./i18n/translations.js";

import { buildHassActionDetail } from "./lib/actions.js";

import { SHARED_SPARKLINE_CACHE, SHARED_SPARKLINE_PENDING, SHARED_SPARKLINE_CACHE_LIMIT, SHARED_SPARKLINE_MAX_AGE_MS, normalizeSparklineSamples, getSparklineStats, pruneSharedSparklineCache, fetchHistorySamples } from "./lib/history.js";

import { MEDIA_PLAYER_FEATURES, getSliderCapabilities, getInlineButtons, supportsMediaFeature } from "./lib/capabilities.js";

import { VERSION, EDITOR_DOM_REVISION } from "./version.js";
import { OneLineRoomCard } from "./card/room-card.js";
import { OneLineRoomCardTextField } from "./editor/text-field-compat.js";
import { IMAGE_UPLOAD_LIMITS, parseImagePosition, validateImageUpload, ROOM_IMAGE_PRESETS, ROOM_IMAGE_PRESET_MAP, getRoomImagePresetUrl, resolveRoomImageUrl, evaluateAdaptiveImageConditions, resolveAdaptiveRoomImage, POWER_UNIT_FACTORS, getStatusGroupResult, isHeaderManualColorEnabled, resolveLabelPosition, setAlignmentClass, applyLabelPosition, evalTemplateString, resolveTemplateCtrl, resolveSubChipPresentations, TEMPLATE_VALUE_KEYS, getTemplateEntityDependencies, templateNeedsEveryHassUpdate, formatLastChanged } from "./shared/presentation.js";
const LOG_FLAG = `customCards_RoomCard_Logged_${VERSION}`;



if (!window[LOG_FLAG]) {
  console.info(
    `%c ONELINE-ROOM-CARD %c ${VERSION} `,
    "color: white; background: #2c3e50; font-weight: 700;",
    "color: white; background: #c0392b; font-weight: 700;"
  );
  window[LOG_FLAG] = true;
}

// Home Assistant no longer guarantees that its internal text field component is
// registered before a custom card editor is opened. Keep the editor usable on a
// cold dashboard load, then adopt HA's current/legacy input as soon as it exists.
if (!customElements.get("oneline-room-card-textfield")) {
  customElements.define("oneline-room-card-textfield", OneLineRoomCardTextField);
}

// TRANSLATIONS







// =============================================================================
// MAIN CARD CLASS
// =======================// =============================================================================
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
    this._roomModesSectionOpen = false;
    this._statusGroupsSectionOpen = false;
    this._headerSectionOpen = true;
    this._layoutSectionOpen = false;
    this._areaSelectorOpen = false;
    this._selectedArea = "";
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
    this._uploading = false;
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
      this.shadowRoot.querySelectorAll("ha-selector,ha-entity-picker,ha-icon-picker,oneline-room-card-textfield,ha-switch,ha-card-conditions-editor").forEach(e => {
        if (e.hass !== hass) e.hass = hass;
      });
      this.updPreview();
      if (this._config && (!this.shadowRoot.getElementById("show-name-toggle") || !this.shadowRoot.getElementById("typo-sec"))) {
        this.shadowRoot.replaceChildren();
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

  _setUploadStatus(key = "", { error = false, status = "" } = {}) {
    const button = this.shadowRoot?.getElementById("upload-btn");
    const statusNode = this.shadowRoot?.getElementById("upload-status");
    const message = key ? getTranslation(this._hass, key).replace("{status}", status || "unknown") : "";
    if (button) {
      button.label = this._uploading ? getTranslation(this._hass, "uploading") : getTranslation(this._hass, "upload_btn");
      button.disabled = this._uploading;
    }
    if (statusNode && key !== null) {
      statusNode.textContent = message;
      statusNode.classList.toggle("error", error);
    }
  }

  async _decodeImageFile(file) {
    if (typeof createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(file);
        return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close?.() };
      } catch (_err) {
        // Fall back to an object URL for browsers without full ImageBitmap support.
      }
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = "async";
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("decode"));
        image.src = objectUrl;
      });
      return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(objectUrl) };
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      throw error;
    }
  }

  _canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("encode")), type, quality);
    });
  }

  async _prepareImageUpload(file) {
    const validationError = validateImageUpload(file);
    if (validationError) throw Object.assign(new Error(validationError), { translationKey: validationError });
    let decoded;
    try {
      decoded = await this._decodeImageFile(file);
      if (!decoded.width || !decoded.height) throw new Error("decode");
      const largest = Math.max(decoded.width, decoded.height);
      if (largest <= IMAGE_UPLOAD_LIMITS.maxDimension) return { file, optimized: false };
      const scale = IMAGE_UPLOAD_LIMITS.maxDimension / largest;
      const width = Math.max(1, Math.round(decoded.width * scale));
      const height = Math.max(1, Math.round(decoded.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("canvas");
      context.drawImage(decoded.source, 0, 0, width, height);
      const outputType = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
      const blob = await this._canvasToBlob(canvas, outputType, IMAGE_UPLOAD_LIMITS.quality);
      const extension = outputType.split("/")[1].replace("jpeg", "jpg");
      const baseName = String(file.name || "room-image").replace(/\.[^.]+$/, "");
      return { file: new File([blob], `${baseName}.${extension}`, { type: outputType }), optimized: true };
    } catch (error) {
      if (error?.translationKey) throw error;
      throw Object.assign(error instanceof Error ? error : new Error("decode"), { translationKey: "upload_decode_error" });
    } finally {
      decoded?.close?.();
    }
  }

  async _handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !this._hass || this._uploading) return;
    const fileInput = this.shadowRoot.getElementById("file-upload");
    this._uploading = true;
    if (fileInput) fileInput.disabled = true;
    this._setUploadStatus();
    try {
      const { url: imgUrl, optimized } = await this._uploadImageFile(file);
      const next = { ...this._config, image: imgUrl };
      delete next.image_preset;
      this._fire(next);
      this._renderImagePresetPicker();
      this.updPreview();
      this._setUploadStatus(optimized ? "upload_optimized" : "upload_success");
    } catch (err) {
      console.error("Upload Error:", err);
      this._setUploadStatus(err?.translationKey || "upload_failed", { error: true, status: err?.status || "unknown" });
    } finally {
      this._uploading = false;
      if (fileInput) { fileInput.disabled = false; fileInput.value = ""; }
      this._setUploadStatus(null);
    }
  }

  async _uploadImageFile(file) {
    const prepared = await this._prepareImageUpload(file);
    const formData = new FormData();
    formData.append("file", prepared.file);
    const response = await this._hass.fetchWithAuth("/api/image/upload", { method: "POST", body: formData });
    if (!response.ok) throw Object.assign(new Error("upload"), { translationKey: "upload_failed", status: String(response.status || "HTTP") });
    const data = await response.json();
    if (!data?.id) throw Object.assign(new Error("upload"), { translationKey: "upload_failed", status: "invalid response" });
    return { url: `/api/image/serve/${data.id}/original`, optimized: prepared.optimized };
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
      select: "mdi:form-dropdown",
      input_select: "mdi:form-dropdown",
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
        id: "select",
        label: getTranslation(h, "tmpl_select"),
        domains: ["select", "input_select"],
        defaults: {
          icon: "mdi:form-dropdown",
          width: 20,
          height: 60,
          align: "left",
          tap_action: { action: "more-info" },
          hold_action: { action: "none" },
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

  async _getAreaEntities(areaId) {
    if (!this._hass || !areaId) return [];
    try {
      const devices = await this._hass.callWS({ type: "config/device_registry/list" });
      const areaDevices = (Array.isArray(devices) ? devices : []).filter(
        (d) => d.area_id === areaId && !d.disabled_by
      );
      const deviceIds = new Set(areaDevices.map(d => d.id));
      const entries = await this._hass.callWS({ type: "config/entity_registry/list" });
      return (Array.isArray(entries) ? entries : []).filter(
        (e) => !e.disabled_by && (e.area_id === areaId || deviceIds.has(e.device_id))
      );
    } catch (err) {
      console.error("Error fetching area entities:", err);
      return [];
    }
  }

  _findFirstEntityByDomain(entities, domain) {
    if (!Array.isArray(entities)) return null;
    return entities.find(e => e.entity_id?.startsWith(`${domain}.`)) || null;
  }

  _groupEntitiesByDomain(entities) {
    const grouped = {};
    (Array.isArray(entities) ? entities : []).forEach(e => {
      const domain = e.entity_id?.split(".")?.[0];
      if (!domain) return;
      if (!grouped[domain]) grouped[domain] = [];
      grouped[domain].push(e);
    });
    return grouped;
  }

  _buildControlsFromEntities(entitiesByDomain) {
    if (!entitiesByDomain || typeof entitiesByDomain !== "object") return [];
    const preferredDomainOrder = ["light", "switch", "cover", "fan", "media_player", "lock"];
    const controls = [];
    for (const domain of preferredDomainOrder) {
      for (const entity of entitiesByDomain[domain] || []) {
        const template = this._getTemplateById(domain);
        if (template) {
          const control = this._buildControlFromTemplate(template, entity.entity_id);
          if (control) controls.push(control);
        }
      }
    }
    return controls;
  }

  _resolveTemperatureSensor(climateEntity, entities) {
    if (!Array.isArray(entities)) return null;
    const tempSensors = entities.filter(e =>
      (e.entity_id?.startsWith("sensor.") || e.entity_id?.startsWith("input_number.")) &&
      (e.device_class === "temperature" || e.entity_id?.toLowerCase().includes("temp"))
    );
    return tempSensors[0] || null;
  }

  _resolveHumiditySensor(climateEntity, entities) {
    if (!Array.isArray(entities)) return null;
    const humidSensors = entities.filter(e =>
      (e.entity_id?.startsWith("sensor.") || e.entity_id?.startsWith("input_number.")) &&
      (e.device_class === "humidity" || e.entity_id?.toLowerCase().includes("humid"))
    );
    return humidSensors[0] || null;
  }

  _findSensorsByDeviceClass(entities, deviceClasses, domains = ["binary_sensor", "sensor"]) {
    if (!Array.isArray(entities) || !Array.isArray(deviceClasses)) return [];
    return entities
      .filter(e => {
        const eDomain = e.entity_id?.split(".")?.[0];
        return domains.includes(eDomain) && deviceClasses.includes(e.device_class);
      })
      .map(e => e.entity_id);
  }

  async _generateFromArea(areaId) {
    if (!areaId || !this._hass) return;
    try {
      const entities = await this._getAreaEntities(areaId);
      if (!entities || entities.length === 0) {
        console.warn(getTranslation(this._hass, "area_no_entities"));
        return;
      }
      const climateEntity = this._findFirstEntityByDomain(entities, "climate");
      const entitiesByDomain = this._groupEntitiesByDomain(entities);
      const controls = this._buildControlsFromEntities(entitiesByDomain);
      const tempSensor = this._resolveTemperatureSensor(climateEntity, entities);
      const humidSensor = this._resolveHumiditySensor(climateEntity, entities);
      const windowSensors = this._findSensorsByDeviceClass(entities, ["window", "door"]);
      const batterySensors = this._findSensorsByDeviceClass(entities, ["battery"]);
      const newConfig = {
        ...this._config,
        entity: climateEntity?.entity_id || (this._config.entity || ""),
        temp_sensor: tempSensor?.entity_id || (this._config.temp_sensor || ""),
        humid_sensor: humidSensor?.entity_id || (this._config.humid_sensor || ""),
        window_sensors: windowSensors.length > 0 ? windowSensors : (this._config.window_sensors || []),
        battery_sensors: batterySensors.length > 0 ? batterySensors : (this._config.battery_sensors || []),
        controls: [...(this._config.controls || []), ...controls]
      };
      this._fire(newConfig);
    } catch (err) {
      console.error("Error generating from area:", err);
    }
  }

  _ensureAreaOptions() {
    const areaPicker = this.shadowRoot?.getElementById("area-picker");
    if (!areaPicker) return;
    areaPicker.hass = this._hass;
    if (!areaPicker.selector) areaPicker.selector = { area: {} };
  }

  _updateAreaSetupUI() {
    const content = this.shadowRoot?.getElementById("area-setup-content");
    const chev = this.shadowRoot?.getElementById("area-setup-chev");
    if (content) content.hidden = !this._areaSelectorOpen;
    if (chev) chev.style.transform = this._areaSelectorOpen ? "rotate(90deg)" : "";
    if (this._areaSelectorOpen) this._ensureAreaOptions();
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
      const preferredDomains = ["light", "switch", "select", "input_select", "climate", "cover", "fan", "media_player", "lock", "input_boolean", "vacuum", "humidifier", "sensor", "binary_sensor"];
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
    const domRevision = this.shadowRoot.querySelector("[data-rc-dom-revision]")?.dataset?.rcDomRevision;
    if (alreadyRendered && domRevision === EDITOR_DOM_REVISION) { this.updVal(); if (JSON.stringify(this._config?.controls || []) !== this._lastRenderedControlsSig) this.renBtn(); this._applyNavSelectorOptions(); this._ensureNavOptions(); this._ensureAreaOptions(); this._updateAreaSetupUI(); this._updateSensorsSectionUI(); this._updateSparklineRefreshUI(); this._updateImageSectionUI(); this._updateAdaptiveImagesUI(); this._updateBadgesUI(); this._updateTypographyUI(); this._updateCardBehaviorUI(); this._updateActionsSectionUI(); this._updateRoomModesUI(); this._updateStatusGroupsUI(); this._updateHeaderSectionUI(); this._updateTabUI(); return; }
    
    this.shadowRoot.replaceChildren();
    const h = this._hass;
    // Static editor scaffold: interpolations are package translations and normalized
    // editor state. Configuration/entity text is assigned later through DOM properties.
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
        .window-label-input { width: 100%; box-sizing: border-box; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color, var(--primary-background-color)); color: var(--primary-text-color); padding: 10px 12px; font: inherit; font-size: 14px; outline: none; }
        .window-label-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 1px var(--primary-color); }
        .window-label-field-label { display: block; font-size: 12px; font-weight: 600; opacity: 0.8; margin: 2px 0 6px; }
        .sensor-label-wrap { margin: -2px 0 10px; }
        .editor-stack { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .field-with-inline-control { position: relative; display: flex; align-items: flex-end; width: 100%; }
        .field-with-inline-control > oneline-room-card-textfield, .field-with-inline-control > ha-icon-picker { width: 100%; margin-bottom: 0; }
        .field-inline-switch { position: absolute; right: 8px; bottom: 8px; z-index: 1; transform: scale(0.8); transform-origin: right bottom; }
        .field-inline-color { position: absolute; right: 8px; bottom: 8px; z-index: 1; }
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
        oneline-room-card-textfield, ha-selector, ha-entity-picker, ha-icon-picker { width: 100%; display: block; margin-bottom: 8px; }
        .focal-preview { position: relative; width: 100%; height: 120px; border-radius: 8px; margin-bottom: 8px; background: #444; overflow: hidden; display: none; cursor: crosshair; touch-action: none; }
        .focal-preview.show { display: block; }
        .preview { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
        .preview.show { display: block; }
        .focal-marker { position: absolute; width: 18px; height: 18px; border: 2px solid white; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 0 2px rgba(0,0,0,0.65); pointer-events: none; }
        .focal-controls { display: grid; grid-template-columns: 1fr auto; gap: 6px 10px; align-items: center; margin-bottom: 10px; }
        .focal-controls label { grid-column: 1 / -1; font-size: 11px; opacity: 0.75; }
        .focal-controls input { width: 100%; accent-color: var(--primary-color); }
        .focal-help, .upload-status { font-size: 11px; opacity: 0.72; margin: -2px 0 8px; }
        .upload-status.error { color: var(--error-color, #db4437); opacity: 1; }
        .image-preset-heading { font-size: 12px; font-weight: 600; margin: 10px 0 2px; }
        .image-preset-help { font-size: 11px; opacity: 0.7; margin-bottom: 8px; }
        .image-presets { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; margin-bottom: 12px; }
        .image-preset { position: relative; min-width: 0; aspect-ratio: 16 / 9; overflow: hidden; border: 2px solid transparent; border-radius: 8px; padding: 0; background: var(--card-background-color, #444); color: white; cursor: pointer; font: inherit; box-sizing: border-box; }
        .image-preset:hover { border-color: var(--primary-color); }
        .image-preset.selected { border-color: var(--primary-color); box-shadow: 0 0 0 1px var(--primary-color); }
        .image-preset img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .image-preset-label { position: absolute; inset: auto 0 0; padding: 14px 6px 5px; background: linear-gradient(transparent, rgba(0,0,0,0.82)); color: white; font-size: 11px; font-weight: 600; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .image-preset.custom { display: flex; align-items: center; justify-content: center; gap: 5px; background: var(--secondary-background-color); color: var(--primary-text-color); border-color: var(--divider-color); }
        .image-preset.custom ha-icon { --mdc-icon-size: 20px; }
        .image-preset.custom .image-preset-label { position: static; padding: 0; background: none; color: inherit; }
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
        .room-mode-editor-actions { display:flex; align-items:center; gap:2px; }
        .room-mode-editor-actions button { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border:0; border-radius:6px; color:inherit; background:transparent; cursor:pointer; }
        .room-mode-editor-actions button:disabled { opacity:.35; cursor:default; }
        .room-mode-editor-actions button:last-child { color:var(--error-color, #d32f2f); }
        .room-mode-editor-actions ha-icon { --mdc-icon-size:18px; }
        .adaptive-image-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:16px 0 4px; padding-top:12px; border-top:1px solid var(--divider-color); }
        .adaptive-image-heading button { border:0; background:transparent; color:inherit; cursor:pointer; padding:4px; }
        .adaptive-image-rule { border:1px solid var(--divider-color); border-radius:8px; padding:10px; margin:10px 0; background:var(--secondary-background-color); }
        .adaptive-image-rule .focal-controls { margin-top:8px; }
        .adaptive-image-actions { display:flex; gap:2px; }
        .adaptive-image-actions button { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border:0; border-radius:6px; color:inherit; background:transparent; cursor:pointer; }
        .adaptive-image-actions button:disabled { opacity:.35; cursor:default; }
        .adaptive-image-actions button:last-child { color:var(--error-color, #d32f2f); }
        .adaptive-image-actions ha-icon { --mdc-icon-size:18px; }
      </style>
      <span data-rc-version="${VERSION}" data-rc-dom-revision="${EDITOR_DOM_REVISION}" style="display:none"></span>
      <div id="tab-bar" class="tab-bar">
        <button id="tab-config-btn" class="tab-btn">${getTranslation(h, "configuration")}</button>
        <button id="tab-buttons-btn" class="tab-btn">${getTranslation(h, "buttons")}</button>
      </div>
      <div id="tab-config-panel">
      <div class="sec">
        <div id="area-setup-head" class="sec-head" style="cursor:pointer;user-select:none;padding:4px 0">
          <h3>${getTranslation(h, "area_setup")}</h3>
          <ha-icon id="area-setup-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
        </div>
        <div id="area-setup-content" hidden>
          <div style="margin-bottom: 12px; font-size: 12px; opacity: 0.7;">
            ${getTranslation(h, "area_setup_desc")}
          </div>
          <div style="display: flex; gap: 12px; align-items: flex-end; margin-bottom: 12px;">
            <div style="flex: 1; min-width: 200px;">
              <ha-selector id="area-picker" label="${getTranslation(h, "area_picker")}"></ha-selector>
            </div>
            <mwc-button id="area-generate" raised>
              <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
              ${getTranslation(h, "area_generate")}
            </mwc-button>
          </div>
        </div>
      </div>
      <div class="sec">
        <div id="card-beh-head" class="sec-head" style="cursor:pointer;user-select:none;padding:4px 0">
          <h3>${getTranslation(h, "card_behavior")}</h3>
          <ha-icon id="card-beh-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
        </div>
        <div id="card-beh-content">
        <div class="editor-stack">
          <ha-formfield label="${getTranslation(h, "live_preview")}">
            <ha-switch id="live-preview-toggle" checked></ha-switch>
          </ha-formfield>
          <div class="field-with-inline-control">
            <oneline-room-card-textfield label="${getTranslation(h, "name")}" cfg="name" class="i" style="width: 100%;"></oneline-room-card-textfield>
            <ha-switch id="show-name-toggle" checked title="${getTranslation(h, "show_name")}"
                       class="field-inline-switch" style="--mdc-switch-size: 20px;"></ha-switch>
          </div>
          <div style="width:100%;">
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
              <oneline-room-card-textfield id="tap-service" label="${getTranslation(h, "service")}" placeholder="domain.service" style="margin-top:12px; width: 100%; display:none"></oneline-room-card-textfield>
              <oneline-room-card-textfield id="tap-service-data" label="${getTranslation(h, "service_data")}" placeholder='{"key":"value"}' style="margin-top:12px; width: 100%; display:none" multiline rows="4"></oneline-room-card-textfield>
              <ha-entity-picker id="tap-target" style="margin-top:12px; width: 100%; display:none"></ha-entity-picker>
              <ha-selector id="tap-nav-path" label="${getTranslation(h, "path")}" placeholder="/lovelace/path" style="margin-top:12px; width: 100%; display:none"></ha-selector>
            </div>
            <div style="margin-top:12px">
              <ha-selector id="hold-action" label="${getTranslation(h, "hold_action")}"></ha-selector>
              <oneline-room-card-textfield id="hold-service" label="${getTranslation(h, "service")}" placeholder="domain.service" style="margin-top:12px; width: 100%; display:none"></oneline-room-card-textfield>
              <oneline-room-card-textfield id="hold-service-data" label="${getTranslation(h, "service_data")}" placeholder='{"key":"value"}' style="margin-top:12px; width: 100%; display:none" multiline rows="4"></oneline-room-card-textfield>
              <ha-entity-picker id="hold-target" style="margin-top:12px; width: 100%; display:none"></ha-entity-picker>
              <ha-selector id="hold-nav-path" label="${getTranslation(h, "path")}" placeholder="/lovelace/path" style="margin-top:12px; width: 100%; display:none"></ha-selector>
            </div>
            <div style="margin-top:12px">
              <ha-selector id="dbl-action" label="${getTranslation(h, "double_tap_action")}"></ha-selector>
              <oneline-room-card-textfield id="dbl-service" label="${getTranslation(h, "service")}" placeholder="domain.service" style="margin-top:12px; width: 100%; display:none"></oneline-room-card-textfield>
              <oneline-room-card-textfield id="dbl-service-data" label="${getTranslation(h, "service_data")}" placeholder='{"key":"value"}' style="margin-top:12px; width: 100%; display:none" multiline rows="4"></oneline-room-card-textfield>
              <ha-entity-picker id="dbl-target" style="margin-top:12px; width: 100%; display:none"></ha-entity-picker>
              <ha-selector id="dbl-nav-path" label="${getTranslation(h, "path")}" placeholder="/lovelace/path" style="margin-top:12px; width: 100%; display:none"></ha-selector>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div class="sec">
        <div id="room-modes-head" class="sec-head" style="cursor:pointer;user-select:none;padding:4px 0">
          <h3>${getTranslation(h, "room_modes")}</h3>
          <ha-icon id="room-modes-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
        </div>
        <div id="room-modes-content" hidden>
          <div style="font-size:12px;opacity:.7;margin:6px 0 10px">${getTranslation(h, "room_modes_help")}</div>
          <div id="room-modes-list"></div>
          <mwc-button id="room-modes-add" raised label="${getTranslation(h, "room_mode_add")}">
            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
          </mwc-button>
        </div>
      </div>
      <div class="sec">
        <div id="status-groups-head" class="sec-head" style="cursor:pointer;user-select:none;padding:4px 0">
          <h3>${getTranslation(h, "status_groups")}</h3>
          <ha-icon id="status-groups-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
        </div>
        <div id="status-groups-content" hidden>
          <div style="font-size:12px;opacity:.7;margin:6px 0 10px">${getTranslation(h, "status_groups_help")}</div>
          <div class="bg-presets" id="status-group-presets" style="margin-bottom:10px">
            <button type="button" class="bg-preset" data-status-preset="lights">${getTranslation(h, "status_group_preset_lights")}</button>
            <button type="button" class="bg-preset" data-status-preset="windows">${getTranslation(h, "status_group_preset_windows")}</button>
            <button type="button" class="bg-preset" data-status-preset="media">${getTranslation(h, "status_group_preset_media")}</button>
            <button type="button" class="bg-preset" data-status-preset="power">${getTranslation(h, "status_group_preset_power")}</button>
          </div>
          <div id="status-groups-list"></div>
          <mwc-button id="status-groups-add" raised label="${getTranslation(h, "status_group_add")}">
            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
          </mwc-button>
        </div>
      </div>
      <div class="sec">
        <div id="header-sec-head" class="sec-head" style="cursor:pointer;user-select:none;padding:4px 0">
          <h3>${getTranslation(h, "header")}</h3>
          <ha-icon id="header-sec-chev" icon="mdi:chevron-right" style="--mdc-icon-size:18px;opacity:0.7;transition:transform 0.15s ease"></ha-icon>
        </div>
        <div id="header-sec-content">
        <div class="editor-stack" style="margin-top:4px;">
          <oneline-room-card-textfield label="${getTranslation(h, "header_height")}" cfg="header_height" class="i" type="number" min="0" max="400" style="flex:1" placeholder="120"></oneline-room-card-textfield>
          <div class="field-with-inline-control">
            <ha-icon-picker label="${getTranslation(h, "icon")}" cfg="icon" class="i" style="width: 100%;"></ha-icon-picker>
            <div class="color-container field-inline-color">
               <div class="color-popover">
                  <oneline-room-card-textfield cfg="color" class="i" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></oneline-room-card-textfield>
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
              <oneline-room-card-textfield id="standard-badge-bg" label="${getTranslation(h, "standard_badge_background")}" cfg="header_info_background" class="i" style="width: 100%"></oneline-room-card-textfield>
              <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                 <div class="color-popover">
                    <oneline-room-card-textfield id="standard-badge-bg-popover" class="i" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></oneline-room-card-textfield>
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
            <div id="focal-preview" class="focal-preview" role="img" aria-label="${getTranslation(h, "image_focal_point")}">
              <img id="prev-img" class="preview" alt="">
              <span id="focal-marker" class="focal-marker"></span>
            </div>
            <div class="focal-help">${getTranslation(h, "image_focal_help")}</div>
            <div class="focal-controls">
              <label for="focal-x">${getTranslation(h, "image_horizontal")}</label>
              <input id="focal-x" type="range" min="0" max="100" step="1"><span id="focal-x-value">50%</span>
              <label for="focal-y">${getTranslation(h, "image_vertical")}</label>
              <input id="focal-y" type="range" min="0" max="100" step="1"><span id="focal-y-value">50%</span>
              <mwc-button id="focal-center" label="${getTranslation(h, "image_center")}"></mwc-button>
            </div>
            <ha-formfield label="${getTranslation(h, "show_image")}" style="display:flex;align-items:center;margin-bottom:8px">
              <ha-switch id="show-image-toggle"></ha-switch>
            </ha-formfield>
            <div class="image-preset-heading">${getTranslation(h, "image_preset_title")}</div>
            <div class="image-preset-help">${getTranslation(h, "image_preset_help")}</div>
            <div id="image-presets" class="image-presets"></div>
            <oneline-room-card-textfield id="img-url-field" cfg="image" class="i" icon="mdi:image" label="${getTranslation(h, "img_url")}"></oneline-room-card-textfield>
            <ha-entity-picker label="${getTranslation(h, "image_entity")}" cfg="image_entity" class="i" allow-custom-entity include-domains='["light", "switch", "input_boolean", "group"]' style="margin-top: 8px;"></ha-entity-picker>
            <div style="font-size:11px;opacity:0.7;margin-top:4px">${getTranslation(h, "image_entity_help")}</div>
            <div class="upload-row">
              <input type="file" id="file-upload" class="upload-hidden" accept="image/*">
              <mwc-button id="upload-btn" raised label="${getTranslation(h, "upload_btn")}">
                <ha-icon icon="mdi:upload" slot="icon"></ha-icon>
              </mwc-button>
            </div>
            <div id="upload-status" class="upload-status" role="status" aria-live="polite"></div>
            <div class="adaptive-image-heading">
              <div>
                <div class="image-preset-heading" style="margin:0">${getTranslation(h, "adaptive_images")}</div>
                <div class="image-preset-help" style="margin:2px 0 0">${getTranslation(h, "adaptive_images_help")}</div>
              </div>
            </div>
            <div id="adaptive-images-list"></div>
            <mwc-button id="adaptive-images-add" raised label="${getTranslation(h, "adaptive_image_add")}">
              <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
            </mwc-button>
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
              <oneline-room-card-textfield label="${getTranslation(h, "font_size")}" cfg="header_name_size" class="i" type="number" placeholder="14"></oneline-room-card-textfield>
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
                      <oneline-room-card-textfield id="header-name-color" class="i" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></oneline-room-card-textfield>
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
              <oneline-room-card-textfield label="${getTranslation(h, "font_size")}" cfg="header_info_size" class="i" type="number" placeholder="12"></oneline-room-card-textfield>
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
                      <oneline-room-card-textfield id="header-info-color" class="i" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></oneline-room-card-textfield>
                   </div>
                   <div class="cp-preview">
                     <div></div>
                     <input type="color" id="header-info-color-picker" class="cl-p i" cfg="header_info_color" title="${getTranslation(h, "color")}" 
                            style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                   </div>
                </div>
              </div>
            </div>
            <ha-formfield label="${getTranslation(h, "show_header_text_shadow")}" style="display:flex;align-items:center;margin-top:10px">
              <ha-switch id="header-text-shadow-toggle"></ha-switch>
            </ha-formfield>
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
            <ha-formfield label="${getTranslation(h, "show_chip_shadow")}" style="display:flex;align-items:center;margin:4px 0 8px">
              <ha-switch id="chip-shadow-toggle"></ha-switch>
            </ha-formfield>
            <ha-formfield label="${getTranslation(h, "show_status_border")}" style="display:flex;align-items:center;margin:4px 0 2px">
              <ha-switch id="status-border-toggle"></ha-switch>
            </ha-formfield>
            <div style="font-size:11px;opacity:0.65;margin:0 0 8px 42px">${getTranslation(h, "show_status_border_help")}</div>
            <ha-entity-picker label="${getTranslation(h, "presence_sensor")}" cfg="presence_sensor" class="i" allow-custom-entity include-domains='["person", "binary_sensor", "device_tracker"]'></ha-entity-picker>
            <div class="sensor-label-wrap"><label class="window-label-field-label">${getTranslation(h, "window_custom_label")}</label><input class="window-label-input sensor-label-input" data-cfg="presence_sensor_label" type="text" placeholder="${getTranslation(h, "presence_sensor")}"></div>
            <ha-formfield label="${getTranslation(h, "presence_solid_background")}" style="display:flex;align-items:center;margin:8px 0 4px">
              <ha-switch id="presence-solid-bg"></ha-switch>
            </ha-formfield>
            <div id="presence-chip-color-row" style="position:relative;display:flex;align-items:flex-end;margin-bottom:8px">
              <oneline-room-card-textfield id="presence-chip-color" label="${getTranslation(h, "presence_chip_color")}" placeholder="#4CAF50" style="width:100%"></oneline-room-card-textfield>
              <div class="color-container" style="position:absolute;right:8px;bottom:8px;z-index:1">
                <div class="cp-preview">
                  <div></div>
                  <input type="color" id="presence-chip-color-picker" title="${getTranslation(h, "presence_chip_color")}" style="position:absolute;inset:0;opacity:0;cursor:pointer;border:none;padding:0;width:100%;height:100%">
                </div>
              </div>
            </div>
            <ha-selector id="temp-unit-sel" label="${getTranslation(h, "temp_unit")}" style="width:100%;margin:8px 0"></ha-selector>
            <ha-entity-picker label="${getTranslation(h, "temp_label")}" cfg="temp_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <div class="sensor-label-wrap"><label class="window-label-field-label">${getTranslation(h, "window_custom_label")}</label><input class="window-label-input sensor-label-input" data-cfg="temp_sensor_label" type="text" placeholder="${getTranslation(h, "temp_label")}"></div>
            <ha-entity-picker label="${getTranslation(h, "target_temp_label")}" cfg="target_temp_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <div class="sensor-label-wrap"><label class="window-label-field-label">${getTranslation(h, "window_custom_label")}</label><input class="window-label-input sensor-label-input" data-cfg="target_temp_sensor_label" type="text" placeholder="${getTranslation(h, "target_temp_label")}"></div>
            <ha-entity-picker label="${getTranslation(h, "humid_label")}" cfg="humid_sensor" class="i" allow-custom-entity></ha-entity-picker>
            <div class="sensor-label-wrap"><label class="window-label-field-label">${getTranslation(h, "window_custom_label")}</label><input class="window-label-input sensor-label-input" data-cfg="humid_sensor_label" type="text" placeholder="${getTranslation(h, "humid_label")}"></div>
            <oneline-room-card-textfield label="${getTranslation(h, "humid_warn_threshold")}" cfg="humidity_warning_threshold" class="i" type="number"></oneline-room-card-textfield>
            <ha-selector cfg="window_sensors" class="i" label="${getTranslation(h, "window_label")}"></ha-selector>
            <ha-formfield id="window-always-show-field" label="${getTranslation(h, "window_always_show")}" style="display:flex;align-items:center;margin:4px 0">
              <ha-switch id="window-always-show"></ha-switch>
            </ha-formfield>
            <ha-formfield id="window-solid-bg-field" label="${getTranslation(h, "window_solid_background")}" style="display:flex;align-items:center;margin:4px 0">
              <ha-switch id="window-solid-bg"></ha-switch>
            </ha-formfield>
            <div id="window-open-color-row" style="position: relative; display: flex; align-items: flex-end; margin-top: 8px;">
              <oneline-room-card-textfield label="${getTranslation(h, "window_open_color")}" id="window-open-color" cfg="window_open_color" style="width: 100%"></oneline-room-card-textfield>
              <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                 <div class="color-popover">
                    <oneline-room-card-textfield id="window-open-color-popover" class="i" cfg="window_open_color" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></oneline-room-card-textfield>
                 </div>
                 <div class="cp-preview">
                    <div></div>
                    <input type="color" id="window-open-color-picker" class="cl-p i" cfg="window_open_color" title="${getTranslation(h, "color")}" 
                           style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                 </div>
              </div>
            </div>
            <div id="window-closed-color-row" style="position: relative; display: flex; align-items: flex-end; margin-top: 8px;">
              <oneline-room-card-textfield label="${getTranslation(h, "window_closed_color")}" id="window-closed-color" cfg="window_closed_color" style="width: 100%"></oneline-room-card-textfield>
              <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                 <div class="color-popover">
                    <oneline-room-card-textfield id="window-closed-color-popover" class="i" cfg="window_closed_color" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></oneline-room-card-textfield>
                 </div>
                 <div class="cp-preview">
                    <div></div>
                    <input type="color" id="window-closed-color-picker" class="cl-p i" cfg="window_closed_color" title="${getTranslation(h, "color")}"
                           style="position: absolute; inset: 0; opacity: 0; cursor: pointer; border: none; padding: 0; width: 100%; height: 100%;">
                 </div>
              </div>
            </div>
            <oneline-room-card-textfield id="window-open-states" label="${getTranslation(h, "window_open_states")}" placeholder="on, open, tilted" style="width:100%;margin-top:8px"></oneline-room-card-textfield>
            <div id="window-labels-section" style="margin-top:8px">
              <div class="tmpl-label" style="font-size:11px;font-weight:600;opacity:0.6;margin-bottom:6px">${getTranslation(h, "window_labels")}</div>
              <div id="window-labels-list"></div>
            </div>
            <div id="window-state-colors-section" style="margin-top:8px">
              <div class="tmpl-label" style="font-size:11px;font-weight:600;opacity:0.6;margin-bottom:6px">${getTranslation(h, "window_state_colors")}</div>
              <div id="window-state-colors-list"></div>
              <mwc-button id="window-state-colors-add" raised label="${getTranslation(h, "window_state_colors_add")}">
                <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
              </mwc-button>
            </div>
            <div id="alert-sensors-section" style="margin-top:8px">
              <div class="image-title" style="font-size:11px;font-weight:600;opacity:0.6;margin-bottom:6px">${getTranslation(h, "alert_sensors")}</div>
              <div id="alert-sensors-list"></div>
              <mwc-button id="alert-sensors-add" raised label="${getTranslation(h, "alert_sensor_add")}">
                <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
              </mwc-button>
              <div style="margin-top:12px;padding:8px;background:rgba(0,0,0,0.1);border-radius:6px;display:flex;align-items:center;justify-content:space-between">
                <div style="font-size:12px;font-weight:500">${getTranslation(h, "alert_chip_collapsed")}</div>
                <ha-switch id="alert-chip-mode-toggle"></ha-switch>
              </div>
              <div style="margin-top:8px">
                <oneline-room-card-textfield label="${getTranslation(h, "alert_border_color")}" id="alert-border-color" cfg="alert_border_color" class="i" placeholder="#d32f2d" style="width:100%"></oneline-room-card-textfield>
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
          <oneline-room-card-textfield id="global-icon-size" label="${getTranslation(h, "global_icon_size")}" type="number" style="max-width:140px" placeholder="20"></oneline-room-card-textfield>
        </div>
        <div id="sparkline-refresh-wrap" style="margin-top:8px">
          <oneline-room-card-textfield id="sparkline-refresh" label="${getTranslation(h, "sparkline_refresh")}" type="number" min="60" max="3600" placeholder="300" style="width:100%"></oneline-room-card-textfield>
          <div id="sparkline-refresh-error" role="status" aria-live="polite" style="display:none;color:var(--error-color,#d32f2f);font-size:11px;margin-top:3px"></div>
        </div>
        <div class="cl-row" style="margin-top: 8px">
          <oneline-room-card-textfield id="global-btn-bg" cfg="global_button_background" label="${getTranslation(h, "global_button_bg")}" class="i"></oneline-room-card-textfield>
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
    const adaptiveImagesAdd = this.shadowRoot.getElementById("adaptive-images-add");
    if (adaptiveImagesAdd) {
      adaptiveImagesAdd.addEventListener("click", (event) => {
        event.stopPropagation();
        const rules = [...(Array.isArray(this._config?.adaptive_images) ? this._config.adaptive_images : []), { conditions: [] }];
        this._fire({ ...this._config, adaptive_images: rules });
        this._updateAdaptiveImagesUI();
      });
    }
    this._setupFocalPointControl();
    const areaSetupHead = this.shadowRoot.getElementById("area-setup-head");
    if (areaSetupHead) {
      areaSetupHead.addEventListener("click", () => {
        this._areaSelectorOpen = !this._areaSelectorOpen;
        this._updateAreaSetupUI();
      });
    }
    const areaPicker = this.shadowRoot.getElementById("area-picker");
    if (areaPicker) {
      areaPicker.hass = this._hass;
      areaPicker.selector = { area: {} };
      areaPicker.value = this._selectedArea || "";
      areaPicker.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        this._selectedArea = e.detail?.value || "";
      });
    }
    const areaGenerateBtn = this.shadowRoot.getElementById("area-generate");
    if (areaGenerateBtn) {
      areaGenerateBtn.addEventListener("click", async () => {
        const ap = this.shadowRoot.getElementById("area-picker");
        const area = ap?.value || this._selectedArea;
        if (area) await this._generateFromArea(area);
      });
    }
    this._updateAreaSetupUI();
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
    const roomModesHead = this.shadowRoot.getElementById("room-modes-head");
    if (roomModesHead) {
      roomModesHead.addEventListener("click", () => {
        this._roomModesSectionOpen = !this._roomModesSectionOpen;
        this._updateRoomModesUI();
      });
    }
    const roomModesAdd = this.shadowRoot.getElementById("room-modes-add");
    if (roomModesAdd) {
      roomModesAdd.addEventListener("click", () => {
        const roomModes = [...(Array.isArray(this._config?.room_modes) ? this._config.room_modes : []), { entity: "" }];
        this._roomModesSectionOpen = true;
        this._fire({ ...this._config, room_modes: roomModes });
        this._updateRoomModesUI();
      });
    }
    const statusGroupsHead = this.shadowRoot.getElementById("status-groups-head");
    if (statusGroupsHead) {
      statusGroupsHead.addEventListener("click", () => {
        this._statusGroupsSectionOpen = !this._statusGroupsSectionOpen;
        this._updateStatusGroupsUI();
      });
    }
    const addStatusGroup = (group) => {
      const groups = [...(Array.isArray(this._config?.status_groups) ? this._config.status_groups : []), group];
      this._statusGroupsSectionOpen = true;
      this._fire({ ...this._config, status_groups: groups });
      this._updateStatusGroupsUI();
    };
    const statusGroupsAdd = this.shadowRoot.getElementById("status-groups-add");
    statusGroupsAdd?.addEventListener("click", (event) => {
      event.stopPropagation();
      addStatusGroup({ entities: [], active_states: ["on"], display: "count", details: true });
    });
    this.shadowRoot.querySelectorAll("[data-status-preset]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const preset = button.dataset.statusPreset;
        const presets = {
          lights: { name: getTranslation(h, "status_group_preset_lights"), icon: "mdi:lightbulb-group", entities: [], active_states: ["on"], display: "count", hide_when_zero: true, details: true },
          windows: { name: getTranslation(h, "status_group_preset_windows"), icon: "mdi:window-open-variant", entities: [], active_states: ["on", "open"], display: "count", hide_when_zero: true, details: true },
          media: { name: getTranslation(h, "status_group_preset_media"), icon: "mdi:play-circle", entities: [], active_states: ["playing"], display: "count", hide_when_zero: true, details: true },
          power: { name: getTranslation(h, "status_group_preset_power"), icon: "mdi:flash", entities: [], aggregate: "sum", display: "value", unit: "W", precision: 0, hide_when_zero: false, details: true }
        };
        if (presets[preset]) addStatusGroup(presets[preset]);
      });
    });
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

    const headerTextShadowToggle = this.shadowRoot.getElementById("header-text-shadow-toggle");
    if (headerTextShadowToggle) {
      headerTextShadowToggle.checked = this._config?.show_header_text_shadow !== false;
      headerTextShadowToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        if (ev.target.checked) delete next.show_header_text_shadow;
        else next.show_header_text_shadow = false;
        this._fire(next);
      });
    }

    const tempUnitSel = this.shadowRoot.getElementById("temp-unit-sel");
    if (tempUnitSel) {
      tempUnitSel.hass = h;
      tempUnitSel.selector = { select: { mode: "dropdown", options: [
        { value: "default", label: getTranslation(h, "temp_unit_default") },
        { value: "°C", label: "°C" },
        { value: "°F", label: "°F" }
      ] } };
      tempUnitSel.value = normalizeTemperatureUnit(this._config?.temp_unit) || "default";
      tempUnitSel.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        const value = normalizeTemperatureUnit(ev.detail?.value);
        if (value) next.temp_unit = value;
        else delete next.temp_unit;
        this._fire(next);
      });
    }

    this.shadowRoot.querySelectorAll(".i").forEach(e => {
      const k = e.getAttribute("cfg");
      if (k === "window_sensors") e.selector = { entity: { domain: ["binary_sensor", "sensor"], multiple: true } };
      else if (k === "battery_sensors") e.selector = { entity: { device_class: "battery", multiple: true } };
      if (this._hass) e.hass = this._hass;
      const evType = (e.localName === "oneline-room-card-textfield" || e.localName === "input") ? "change" : "value-changed";
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
        } else if (["presence_sensor_label", "temp_sensor_label", "target_temp_sensor_label", "humid_sensor_label"].includes(k)) {
          const raw = trimStr(v ?? "");
          if (raw) c[k] = raw;
          else delete c[k];
        } else if (k === "image") {
          const raw = trimStr(v ?? "");
          if (raw) {
            c.image = raw;
            delete c.image_preset;
          } else {
            delete c.image;
          }
        } else {
          c[k] = v;
        }
        this._fire(c);
        if (k === "color") this.updCp();
        if (k === "image") {
          this._renderImagePresetPicker();
          this.updPreview();
        }
      });
    });
    this.shadowRoot.querySelectorAll(".sensor-label-input").forEach((input) => {
      const k = input.dataset?.cfg;
      if (!k) return;
      input.value = this._config?.[k] || "";
      input.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const raw = trimStr(ev.target.value || "");
        const next = { ...this._config };
        if (raw) next[k] = raw;
        else delete next[k];
        this._fire(next);
        this._syncManualSensorLabelInputs();
      });
      input.addEventListener("keydown", (ev) => ev.stopPropagation());
    });
    const sensorsHead = this.shadowRoot.getElementById("sensors-head");
    if (sensorsHead) {
      sensorsHead.addEventListener("click", () => {
        this._sensorsSectionOpen = !this._sensorsSectionOpen;
        this._updateSensorsSectionUI();
      });
    }
    const chipShadowToggle = this.shadowRoot.getElementById("chip-shadow-toggle");
    if (chipShadowToggle) {
      chipShadowToggle.checked = this._config?.show_chip_shadow !== false;
      chipShadowToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        if (ev.target.checked) delete next.show_chip_shadow;
        else next.show_chip_shadow = false;
        this._fire(next);
      });
    }
    const statusBorderToggle = this.shadowRoot.getElementById("status-border-toggle");
    if (statusBorderToggle) {
      statusBorderToggle.checked = this._config?.show_status_border !== false;
      statusBorderToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        if (ev.target.checked) delete next.show_status_border;
        else next.show_status_border = false;
        this._fire(next);
      });
    }
    const presenceSolidBgToggle = this.shadowRoot.getElementById("presence-solid-bg");
    if (presenceSolidBgToggle) {
      presenceSolidBgToggle.checked = this._config?.presence_solid_background === true;
      presenceSolidBgToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        if (ev.target.checked) next.presence_solid_background = true;
        else delete next.presence_solid_background;
        this._fire(next);
      });
    }
    const presenceColorField = this.shadowRoot.getElementById("presence-chip-color");
    const presenceColorPicker = this.shadowRoot.getElementById("presence-chip-color-picker");
    const syncPresenceColor = () => {
      const configuredColor = trimStr(this._config?.presence_chip_color) || "";
      const effectiveColor = configuredColor || "#4CAF50";
      if (presenceColorField && presenceColorField.value !== configuredColor) presenceColorField.value = configuredColor;
      if (presenceColorPicker) presenceColorPicker.value = parseColorToPickerHex(effectiveColor);
      const preview = presenceColorPicker?.closest(".cp-preview")?.querySelector("div");
      if (preview) preview.style.backgroundColor = effectiveColor;
    };
    syncPresenceColor();
    if (presenceColorField) {
      presenceColorField.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const value = trimStr(ev.target.value || "");
        const next = { ...this._config };
        if (value) next.presence_chip_color = value;
        else delete next.presence_chip_color;
        this._fire(next);
        syncPresenceColor();
      });
    }
    if (presenceColorPicker) {
      presenceColorPicker.addEventListener("input", (ev) => {
        ev.stopPropagation();
        const value = ev.target.value;
        this._fire({ ...this._config, presence_chip_color: value });
        syncPresenceColor();
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
    const windowSolidBgToggle = this.shadowRoot.getElementById("window-solid-bg");
    if (windowSolidBgToggle) {
      windowSolidBgToggle.checked = this._config?.window_solid_background === true;
      windowSolidBgToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        if (ev.target.checked) next.window_solid_background = true;
        else delete next.window_solid_background;
        this._fire(next);
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
    // window_open_states text field (comma-separated)
    const windowOpenStatesField = this.shadowRoot.getElementById("window-open-states");
    if (windowOpenStatesField) {
      const currentStates = Array.isArray(this._config?.window_open_states)
        ? this._config.window_open_states.join(", ")
        : (this._config?.window_open_states || "");
      windowOpenStatesField.value = currentStates;
      windowOpenStatesField.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const raw = ev.target.value.trim();
        const next = { ...this._config };
        if (raw) {
          const arr = raw.split(",").map(s => s.trim()).filter(Boolean);
          next.window_open_states = arr;
        } else {
          delete next.window_open_states;
        }
        this._fire(next);
      });
    }
    // window_state_colors dynamic section
    const renderWindowStateColors = () => {
      const list = this.shadowRoot.getElementById("window-state-colors-list");
      if (!list) return;
      list.replaceChildren();
      const colorMap = (this._config?.window_state_colors && typeof this._config.window_state_colors === "object")
        ? this._config.window_state_colors : {};
      Object.entries(colorMap).forEach(([state, color]) => {
        const row = document.createElement("div");
        row.className = "cl-row";
        row.style.cssText = "margin-bottom:6px;align-items:center;";
        const stateField = document.createElement("oneline-room-card-textfield");
        stateField.label = getTranslation(h, "color_map_state");
        stateField.value = state;
        stateField.style.cssText = "flex:1;margin-bottom:0;";
        stateField.addEventListener("change", (ev) => {
          ev.stopPropagation();
          const newKey = ev.target.value.trim();
          const newMap = { ...(this._config?.window_state_colors || {}) };
          const colorVal = newMap[state] ?? color;
          delete newMap[state];
          if (newKey) newMap[newKey] = colorVal;
          const next = { ...this._config };
          if (Object.keys(newMap).length > 0) next.window_state_colors = newMap; else delete next.window_state_colors;
          this._fire(next);
          renderWindowStateColors();
        });
        const colorField = document.createElement("oneline-room-card-textfield");
        colorField.label = getTranslation(h, "color");
        colorField.value = color;
        colorField.style.cssText = "flex:1;margin-bottom:0;margin-left:6px;";
        colorField.addEventListener("change", (ev) => {
          ev.stopPropagation();
          const newMap = { ...(this._config?.window_state_colors || {}) };
          newMap[state] = ev.target.value;
          this._fire({ ...this._config, window_state_colors: newMap });
          if (cmPicker) cmPicker.value = parseColorToPickerHex(ev.target.value);
        });
        const cmPicker = document.createElement("input");
        cmPicker.type = "color";
        cmPicker.className = "cl-p";
        cmPicker.value = parseColorToPickerHex(color || "#ffffff");
        cmPicker.style.cssText = "margin-left:6px;";
        cmPicker.title = getTranslation(h, "color");
        cmPicker.addEventListener("change", (ev) => {
          ev.stopPropagation();
          const newMap = { ...(this._config?.window_state_colors || {}) };
          newMap[state] = ev.target.value;
          this._fire({ ...this._config, window_state_colors: newMap });
          colorField.value = ev.target.value;
        });
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "badge-del-btn";
        delBtn.innerHTML = `<ha-icon icon="mdi:delete-outline"></ha-icon>`;
        delBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const newMap = { ...(this._config?.window_state_colors || {}) };
          delete newMap[state];
          const next = { ...this._config };
          if (Object.keys(newMap).length > 0) next.window_state_colors = newMap; else delete next.window_state_colors;
          this._fire(next);
          renderWindowStateColors();
        });
        row.appendChild(stateField); row.appendChild(colorField); row.appendChild(cmPicker); row.appendChild(delBtn);
        list.appendChild(row);
      });
    };
    renderWindowStateColors();
    const windowStateColorsAddBtn = this.shadowRoot.getElementById("window-state-colors-add");
    if (windowStateColorsAddBtn) {
      windowStateColorsAddBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const newMap = { ...(this._config?.window_state_colors || {}) };
        let newKey = "state"; let idx = 1;
        while (newKey in newMap) { newKey = `state${idx++}`; }
        newMap[newKey] = "#ffffff";
        this._fire({ ...this._config, window_state_colors: newMap });
        renderWindowStateColors();
      });
    }
    const renderAlertSensors = (sourceInput) => {
      const list = this.shadowRoot.getElementById("alert-sensors-list");
      if (!list) return;
      list.replaceChildren();
      const source = Array.isArray(sourceInput)
        ? sourceInput
        : (Array.isArray(this._config?.alert_sensors) ? this._config.alert_sensors : []);
      const normalize = (cfg) => {
        if (!cfg) return null;
        if (typeof cfg === "string") return { entity: cfg };
        if (typeof cfg === "object") {
          const n = { ...cfg };
          if (n.state && typeof n.state === "string") {
            n.state = n.state.split(",").map(s => String(s).toLowerCase().trim()).filter(Boolean);
          } else if (Array.isArray(n.state)) {
            n.state = n.state.map(s => String(s).toLowerCase().trim()).filter(Boolean);
          }
          return n;
        }
        return null;
      };
      const fireUpdate = (arr) => {
        const next = { ...this._config };
        if (arr.length > 0) next.alert_sensors = arr; else delete next.alert_sensors;
        this._fire(next);
      };
      source.forEach((item, idx) => {
        const cfg = normalize(item) || { entity: "" };
        const row = document.createElement("div");
        row.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;";
        const headerRow = document.createElement("div");
        headerRow.className = "badge-head-row";
        const entityLabel = document.createElement("span");
        entityLabel.className = "badge-entity-label";
        entityLabel.textContent = cfg.entity
          ? (h.states[cfg.entity]?.attributes?.friendly_name || cfg.entity)
          : getTranslation(h, "alert_sensor_entity");
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "badge-del-btn";
        deleteBtn.innerHTML = `<ha-icon icon="mdi:delete-outline"></ha-icon>`;
        deleteBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const arr = [...(this._config?.alert_sensors || [])];
          arr.splice(idx, 1);
          fireUpdate(arr);
          renderAlertSensors();
        });
        headerRow.appendChild(entityLabel);
        headerRow.appendChild(deleteBtn);
        row.appendChild(headerRow);

        const entityPicker = document.createElement("ha-entity-picker");
        entityPicker.label = getTranslation(h, "alert_sensor_entity");
        entityPicker.allowCustomEntity = true;
        entityPicker.selector = { entity: { domain: ["binary_sensor", "sensor"] } };
        entityPicker.hass = h;
        entityPicker.value = cfg.entity || "";
        entityPicker.style.cssText = "flex:1 1 220px;min-width:200px;";
        entityPicker.addEventListener("value-changed", (ev) => {
          ev.stopPropagation();
          const arr = [...(this._config?.alert_sensors || [])];
          arr[idx] = { ...cfg, entity: ev.detail?.value || "" };
          fireUpdate(arr);
          renderAlertSensors();
        });

        const mkNumField = (key, labelKey) => {
          const f = document.createElement("oneline-room-card-textfield");
          f.label = getTranslation(h, labelKey);
          f.type = "number";
          f.value = cfg[key] !== undefined ? String(cfg[key]) : "";
          f.style.cssText = "flex:1 1 120px;min-width:100px;";
          f.addEventListener("change", (ev) => {
            ev.stopPropagation();
            const val = trimStr(ev.target.value || "");
            const arr = [...(this._config?.alert_sensors || [])];
            const next = { ...cfg };
            if (val === "") delete next[key]; else next[key] = Number(val);
            arr[idx] = next;
            fireUpdate(arr);
          });
          return f;
        };
        const aboveField = mkNumField("above", "alert_sensor_above");
        const belowField = mkNumField("below", "alert_sensor_below");

        const stateField = document.createElement("oneline-room-card-textfield");
        stateField.label = getTranslation(h, "alert_sensor_state");
        stateField.value = Array.isArray(cfg.state) ? cfg.state.join(", ") : (cfg.state || "");
        stateField.style.cssText = "flex:1 1 120px;min-width:100px;";
        stateField.addEventListener("change", (ev) => {
          ev.stopPropagation();
          const raw = trimStr(ev.target.value || "");
          const arr = [...(this._config?.alert_sensors || [])];
          const next = { ...cfg };
          if (raw === "") delete next.state;
          else next.state = raw.split(",").map(s => s.trim()).filter(Boolean);
          arr[idx] = next;
          fireUpdate(arr);
        });

        const controlsRow = document.createElement("div");
        controlsRow.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;width:100%;";
        controlsRow.appendChild(aboveField);
        controlsRow.appendChild(belowField);
        controlsRow.appendChild(stateField);
        row.appendChild(entityPicker);
        row.appendChild(controlsRow);
        list.appendChild(row);
      });
    };
    renderAlertSensors();
    const alertSensorsAddBtn = this.shadowRoot.getElementById("alert-sensors-add");
    if (alertSensorsAddBtn) {
      alertSensorsAddBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const arr = [...(this._config?.alert_sensors || [])];
        arr.push({ entity: "" });
        this._fire({ ...this._config, alert_sensors: arr });
        renderAlertSensors(arr);
      });
    }
    const alertChipModeToggle = this.shadowRoot.getElementById("alert-chip-mode-toggle");
    if (alertChipModeToggle) {
      alertChipModeToggle.checked = this._config?.alert_chip_mode === "collapsed";
      alertChipModeToggle.addEventListener("change", (e) => {
        const next = { ...this._config };
        if (e.target.checked) next.alert_chip_mode = "collapsed";
        else delete next.alert_chip_mode;
        this._fire(next);
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
    const showImageToggle = this.shadowRoot.getElementById("show-image-toggle");
    if (showImageToggle) {
      showImageToggle.checked = this._config?.show_image !== false;
      showImageToggle.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const next = { ...this._config };
        if (ev.target.checked === false) next.show_image = false;
        else delete next.show_image;
        this._fire(next);
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
    const sparklineRefresh = this.shadowRoot.getElementById("sparkline-refresh");
    if (sparklineRefresh) {
      sparklineRefresh.value = this._config?.sparkline_refresh ?? "";
      sparklineRefresh.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const raw = trimStr(ev.target.value);
        const next = { ...this._config };
        const error = this.shadowRoot.getElementById("sparkline-refresh-error");
        if (!raw) {
          delete next.sparkline_refresh;
          if (error) { error.textContent = ""; error.style.display = "none"; }
          this._fire(next);
          return;
        }
        const numeric = Number(raw);
        const normalized = Math.round(clampNum(numeric, 60, 3600, 300));
        next.sparkline_refresh = normalized;
        ev.target.value = String(normalized);
        const adjusted = !Number.isFinite(numeric) || numeric !== normalized;
        if (error) {
          error.textContent = adjusted
            ? getTranslation(this._hass, "sparkline_refresh_adjusted").replace("{value}", String(normalized))
            : "";
          error.style.display = adjusted ? "block" : "none";
        }
        this._fire(next);
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
    this._updateSparklineRefreshUI();
    this._updateImageSectionUI();
    this._updateTypographyUI();
    this._updateBadgesUI();
    this._updateCardBehaviorUI();
    this._updateRoomModesUI();
    this._updateStatusGroupsUI();
    this._updateAdaptiveImagesUI();
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

  _updateRoomModesUI() {
    const content = this.shadowRoot?.getElementById("room-modes-content");
    const chev = this.shadowRoot?.getElementById("room-modes-chev");
    const list = this.shadowRoot?.getElementById("room-modes-list");
    if (!content || !list) return;
    content.hidden = !this._roomModesSectionOpen;
    if (chev) chev.style.transform = this._roomModesSectionOpen ? "rotate(90deg)" : "";
    const modes = Array.isArray(this._config?.room_modes) ? this._config.room_modes : [];
    const updateMode = (index, key, value) => {
      const nextModes = (Array.isArray(this._config?.room_modes) ? this._config.room_modes : []).map((mode) => ({ ...mode }));
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) delete nextModes[index][key];
      else nextModes[index][key] = value;
      this._fire({ ...this._config, room_modes: nextModes });
    };
    const moveMode = (from, to) => {
      const currentModes = Array.isArray(this._config?.room_modes) ? this._config.room_modes : [];
      if (to < 0 || to >= currentModes.length) return;
      const nextModes = currentModes.map((mode) => ({ ...mode }));
      const [moved] = nextModes.splice(from, 1);
      nextModes.splice(to, 0, moved);
      this._fire({ ...this._config, room_modes: nextModes });
      this._updateRoomModesUI();
    };
    list.replaceChildren();
    modes.forEach((mode, index) => {
      const box = document.createElement("div");
      box.className = "badge-box room-mode-editor";
      const header = document.createElement("div");
      header.className = "badge-head-row";
      const label = document.createElement("span");
      label.className = "badge-entity-label";
      label.textContent = `${index + 1}. ${mode.name || this._hass?.states?.[mode.entity]?.attributes?.friendly_name || mode.entity || getTranslation(this._hass, "room_modes")}`;
      const actions = document.createElement("div");
      actions.className = "room-mode-editor-actions";
      const makeAction = (iconName, ariaLabel, disabled, action) => {
        const button = document.createElement("button");
        button.type = "button";
        button.disabled = disabled;
        button.setAttribute("aria-label", ariaLabel);
        const icon = document.createElement("ha-icon");
        icon.setAttribute("icon", iconName);
        button.appendChild(icon);
        button.addEventListener("click", (event) => { event.stopPropagation(); action(); });
        return button;
      };
      actions.append(
        makeAction("mdi:arrow-up", getTranslation(this._hass, "room_mode_up"), index === 0, () => moveMode(index, index - 1)),
        makeAction("mdi:arrow-down", getTranslation(this._hass, "room_mode_down"), index === modes.length - 1, () => moveMode(index, index + 1)),
        makeAction("mdi:delete", getTranslation(this._hass, "room_mode_remove"), false, () => {
          const nextModes = (Array.isArray(this._config?.room_modes) ? this._config.room_modes : []).filter((_, modeIndex) => modeIndex !== index).map((item) => ({ ...item }));
          const next = { ...this._config };
          if (nextModes.length > 0) next.room_modes = nextModes;
          else delete next.room_modes;
          this._fire(next);
          this._updateRoomModesUI();
        })
      );
      header.append(label, actions);

      const picker = document.createElement("ha-entity-picker");
      picker.hass = this._hass;
      picker.label = getTranslation(this._hass, "room_mode_entity");
      picker.value = mode.entity || "";
      picker.setAttribute("allow-custom-entity", "");
      picker.setAttribute("include-domains", '["scene","script"]');
      picker.includeDomains = ["scene", "script"];
      picker.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        const value = trimStr(event.detail?.value);
        updateMode(index, "entity", ["scene", "script"].includes(getEntityDomain(value)) ? value : undefined);
        this._updateRoomModesUI();
      });

      const fields = document.createElement("div");
      fields.className = "row";
      const nameField = document.createElement("oneline-room-card-textfield");
      nameField.label = getTranslation(this._hass, "name");
      nameField.value = mode.name || "";
      nameField.addEventListener("change", (event) => { event.stopPropagation(); updateMode(index, "name", trimStr(event.target.value)); });
      const iconPicker = document.createElement("ha-icon-picker");
      iconPicker.hass = this._hass;
      iconPicker.label = getTranslation(this._hass, "icon");
      iconPicker.value = mode.icon || "";
      iconPicker.addEventListener("value-changed", (event) => { event.stopPropagation(); updateMode(index, "icon", trimStr(event.detail?.value)); });
      fields.append(nameField, iconPicker);

      const colorRow = document.createElement("div");
      colorRow.className = "cl-row";
      const colorField = document.createElement("oneline-room-card-textfield");
      colorField.label = getTranslation(this._hass, "color");
      colorField.value = mode.color || "";
      const colorPicker = document.createElement("input");
      colorPicker.type = "color";
      colorPicker.className = "cp";
      colorPicker.value = parseColorToPickerHex(mode.color || "#03a9f4");
      colorField.addEventListener("change", (event) => {
        event.stopPropagation();
        const value = trimStr(event.target.value);
        updateMode(index, "color", value);
        colorPicker.value = parseColorToPickerHex(value || "#03a9f4");
      });
      colorPicker.addEventListener("change", (event) => {
        event.stopPropagation();
        colorField.value = event.target.value;
        updateMode(index, "color", event.target.value);
      });
      colorRow.append(colorField, colorPicker);

      const conditionLabel = document.createElement("div");
      conditionLabel.className = "image-title";
      conditionLabel.style.cssText = "margin:10px 0 6px;font-weight:600";
      conditionLabel.textContent = getTranslation(this._hass, "room_mode_active_when");
      const conditionEditor = document.createElement("ha-card-conditions-editor");
      conditionEditor.hass = this._hass;
      conditionEditor.conditions = Array.isArray(mode.active_when) ? mode.active_when : [];
      conditionEditor.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        const value = Array.isArray(event.detail?.value) ? event.detail.value : [];
        conditionEditor.conditions = value;
        updateMode(index, "active_when", value);
      });
      box.append(header, picker, fields, colorRow, conditionLabel, conditionEditor);
      list.appendChild(box);
    });
  }

  _updateStatusGroupsUI() {
    const content = this.shadowRoot?.getElementById("status-groups-content");
    const chev = this.shadowRoot?.getElementById("status-groups-chev");
    const list = this.shadowRoot?.getElementById("status-groups-list");
    if (!content || !list) return;
    content.hidden = !this._statusGroupsSectionOpen;
    if (chev) chev.style.transform = this._statusGroupsSectionOpen ? "rotate(90deg)" : "";
    const groups = Array.isArray(this._config?.status_groups) ? this._config.status_groups : [];
    const commitGroups = (nextGroups) => {
      const next = { ...this._config };
      if (nextGroups.length > 0) next.status_groups = nextGroups;
      else delete next.status_groups;
      this._fire(next);
      this._updateStatusGroupsUI();
    };
    const updateGroup = (index, updater, rerender = false) => {
      const nextGroups = (Array.isArray(this._config?.status_groups) ? this._config.status_groups : []).map((group) => ({ ...group }));
      if (!nextGroups[index]) return;
      updater(nextGroups[index]);
      this._fire({ ...this._config, status_groups: nextGroups });
      if (rerender) this._updateStatusGroupsUI();
    };
    const moveGroup = (from, to) => {
      if (to < 0 || to >= groups.length) return;
      const nextGroups = groups.map((group) => ({ ...group }));
      const [moved] = nextGroups.splice(from, 1);
      nextGroups.splice(to, 0, moved);
      commitGroups(nextGroups);
    };
    const makeAction = (iconName, label, disabled, action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = disabled;
      button.setAttribute("aria-label", label);
      const icon = document.createElement("ha-icon");
      icon.setAttribute("icon", iconName);
      button.appendChild(icon);
      button.addEventListener("click", (event) => { event.stopPropagation(); action(); });
      return button;
    };

    list.replaceChildren();
    groups.forEach((group, index) => {
      const box = document.createElement("div");
      box.className = "badge-box status-group-editor";
      const header = document.createElement("div");
      header.className = "badge-head-row";
      const title = document.createElement("span");
      title.className = "badge-entity-label";
      title.textContent = `${index + 1}. ${group.name || getTranslation(this._hass, "status_groups")}`;
      const actions = document.createElement("div");
      actions.className = "room-mode-editor-actions";
      actions.append(
        makeAction("mdi:arrow-up", getTranslation(this._hass, "status_group_up"), index === 0, () => moveGroup(index, index - 1)),
        makeAction("mdi:arrow-down", getTranslation(this._hass, "status_group_down"), index === groups.length - 1, () => moveGroup(index, index + 1)),
        makeAction("mdi:content-copy", getTranslation(this._hass, "status_group_duplicate"), false, () => {
          const nextGroups = groups.map((item) => ({ ...item }));
          nextGroups.splice(index + 1, 0, JSON.parse(JSON.stringify(group)));
          commitGroups(nextGroups);
        }),
        makeAction("mdi:delete", getTranslation(this._hass, "status_group_remove"), false, () => commitGroups(groups.filter((_, groupIndex) => groupIndex !== index).map((item) => ({ ...item }))))
      );
      header.append(title, actions);

      const textRow = document.createElement("div");
      textRow.className = "row";
      const name = document.createElement("oneline-room-card-textfield");
      name.label = getTranslation(this._hass, "name");
      name.value = group.name || "";
      name.addEventListener("change", (event) => {
        event.stopPropagation();
        updateGroup(index, (nextGroup) => {
          const value = trimStr(event.target.value);
          if (value) nextGroup.name = value;
          else delete nextGroup.name;
        }, true);
      });
      const icon = document.createElement("ha-icon-picker");
      icon.hass = this._hass;
      icon.label = getTranslation(this._hass, "icon");
      icon.value = group.icon || "";
      icon.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        updateGroup(index, (nextGroup) => {
          const value = trimStr(event.detail?.value);
          if (value) nextGroup.icon = value;
          else delete nextGroup.icon;
        });
      });
      textRow.append(name, icon);

      const entities = document.createElement("ha-selector");
      entities.hass = this._hass;
      entities.label = getTranslation(this._hass, "status_group_entities");
      entities.selector = { entity: { multiple: true } };
      entities.value = (Array.isArray(group.entities) ? group.entities : []).map((entry) => typeof entry === "string" ? entry : entry?.entity).filter(Boolean);
      entities.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        const value = Array.isArray(event.detail?.value) ? event.detail.value.filter(Boolean) : [];
        updateGroup(index, (nextGroup) => { nextGroup.entities = value; });
      });

      const displayLabel = document.createElement("label");
      displayLabel.className = "image-preset-help";
      displayLabel.textContent = getTranslation(this._hass, "status_group_display");
      const display = document.createElement("select");
      display.setAttribute("aria-label", getTranslation(this._hass, "status_group_display"));
      display.style.cssText = "width:100%;padding:10px;margin-bottom:8px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color)";
      [["count", "status_group_count"], ["value", "status_group_value"]].forEach(([value, labelKey]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = getTranslation(this._hass, labelKey);
        display.appendChild(option);
      });
      display.value = group.aggregate === "sum" || group.display === "value" ? "value" : "count";
      display.addEventListener("change", (event) => {
        event.stopPropagation();
        updateGroup(index, (nextGroup) => {
          nextGroup.display = event.target.value;
          if (event.target.value === "value") nextGroup.aggregate = "sum";
          else delete nextGroup.aggregate;
        }, true);
      });

      const activeStates = document.createElement("oneline-room-card-textfield");
      activeStates.label = getTranslation(this._hass, "status_group_active_states");
      activeStates.value = Array.isArray(group.active_states) ? group.active_states.join(", ") : "";
      activeStates.style.display = display.value === "count" ? "" : "none";
      activeStates.addEventListener("change", (event) => {
        event.stopPropagation();
        const values = String(event.target.value || "").split(",").map((value) => value.trim()).filter(Boolean);
        updateGroup(index, (nextGroup) => {
          if (values.length > 0) nextGroup.active_states = values;
          else delete nextGroup.active_states;
        });
      });

      const numericRow = document.createElement("div");
      numericRow.className = "row";
      numericRow.style.display = display.value === "value" ? "" : "none";
      const unit = document.createElement("oneline-room-card-textfield");
      unit.label = getTranslation(this._hass, "status_group_unit");
      unit.value = group.unit || "";
      unit.addEventListener("change", (event) => {
        event.stopPropagation();
        updateGroup(index, (nextGroup) => {
          const value = trimStr(event.target.value);
          if (value) nextGroup.unit = value;
          else delete nextGroup.unit;
        });
      });
      const precision = document.createElement("oneline-room-card-textfield");
      precision.label = getTranslation(this._hass, "status_group_precision");
      precision.type = "number";
      precision.min = 0;
      precision.max = 4;
      precision.value = String(group.precision ?? 1);
      precision.addEventListener("change", (event) => {
        event.stopPropagation();
        updateGroup(index, (nextGroup) => { nextGroup.precision = Math.max(0, Math.min(4, Number(event.target.value) || 0)); });
      });
      numericRow.append(unit, precision);

      const color = document.createElement("oneline-room-card-textfield");
      color.label = getTranslation(this._hass, "color");
      color.value = group.color || "";
      color.addEventListener("change", (event) => {
        event.stopPropagation();
        updateGroup(index, (nextGroup) => {
          const value = trimStr(event.target.value);
          if (value) nextGroup.color = value;
          else delete nextGroup.color;
        });
      });

      const toggles = document.createElement("div");
      toggles.className = "editor-stack";
      const makeToggle = (labelKey, key) => {
        const formfield = document.createElement("ha-formfield");
        formfield.label = getTranslation(this._hass, labelKey);
        const toggle = document.createElement("ha-switch");
        toggle.checked = group[key] === true;
        toggle.addEventListener("change", (event) => {
          event.stopPropagation();
          updateGroup(index, (nextGroup) => { nextGroup[key] = event.target.checked === true; });
        });
        formfield.appendChild(toggle);
        return formfield;
      };
      toggles.append(makeToggle("status_group_hide_zero", "hide_when_zero"), makeToggle("status_group_details", "details"));

      const conditionTitle = document.createElement("div");
      conditionTitle.className = "image-preset-heading";
      conditionTitle.textContent = getTranslation(this._hass, "status_group_conditions");
      const conditions = document.createElement("ha-card-conditions-editor");
      conditions.hass = this._hass;
      conditions.conditions = Array.isArray(group.conditions) ? group.conditions : [];
      conditions.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        const value = Array.isArray(event.detail?.value) ? event.detail.value : [];
        conditions.conditions = value;
        updateGroup(index, (nextGroup) => {
          if (value.length > 0) nextGroup.conditions = value;
          else delete nextGroup.conditions;
        });
      });

      box.append(header, textRow, entities, displayLabel, display, activeStates, numericRow, color, toggles, conditionTitle, conditions);
      list.appendChild(box);
    });
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

  _updateAdaptiveImagesUI() {
    const list = this.shadowRoot?.getElementById("adaptive-images-list");
    if (!list || !this._config) return;
    const rules = Array.isArray(this._config.adaptive_images) ? this._config.adaptive_images : [];
    const updateRules = (nextRules) => {
      const next = { ...this._config };
      if (nextRules.length > 0) next.adaptive_images = nextRules;
      else delete next.adaptive_images;
      this._fire(next);
      this.updPreview();
      this._updateAdaptiveImagesUI();
    };
    const updateRule = (index, updater, rerender = false) => {
      const nextRules = (Array.isArray(this._config?.adaptive_images) ? this._config.adaptive_images : []).map((rule) => ({ ...rule }));
      if (!nextRules[index]) return;
      updater(nextRules[index]);
      const next = { ...this._config, adaptive_images: nextRules };
      this._fire(next);
      this.updPreview();
      if (rerender) this._updateAdaptiveImagesUI();
    };
    const moveRule = (from, to) => {
      if (to < 0 || to >= rules.length) return;
      const nextRules = rules.map((rule) => ({ ...rule }));
      const [moved] = nextRules.splice(from, 1);
      nextRules.splice(to, 0, moved);
      updateRules(nextRules);
    };
    const makeAction = (iconName, label, disabled, action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = disabled;
      button.setAttribute("aria-label", label);
      const icon = document.createElement("ha-icon");
      icon.setAttribute("icon", iconName);
      button.appendChild(icon);
      button.addEventListener("click", (event) => { event.stopPropagation(); action(); });
      return button;
    };

    list.replaceChildren();
    rules.forEach((rule, index) => {
      const box = document.createElement("div");
      box.className = "adaptive-image-rule";
      const header = document.createElement("div");
      header.className = "badge-head-row";
      const title = document.createElement("strong");
      title.textContent = `${index + 1}. ${rule.name || getTranslation(this._hass, "adaptive_images")}`;
      const actions = document.createElement("div");
      actions.className = "adaptive-image-actions";
      actions.append(
        makeAction("mdi:arrow-up", getTranslation(this._hass, "adaptive_image_up"), index === 0, () => moveRule(index, index - 1)),
        makeAction("mdi:arrow-down", getTranslation(this._hass, "adaptive_image_down"), index === rules.length - 1, () => moveRule(index, index + 1)),
        makeAction("mdi:content-copy", getTranslation(this._hass, "adaptive_image_duplicate"), false, () => {
          const copy = JSON.parse(JSON.stringify(rule));
          const nextRules = rules.map((item) => ({ ...item }));
          nextRules.splice(index + 1, 0, copy);
          updateRules(nextRules);
        }),
        makeAction("mdi:delete", getTranslation(this._hass, "adaptive_image_remove"), false, () => updateRules(rules.filter((_, ruleIndex) => ruleIndex !== index).map((item) => ({ ...item }))))
      );
      header.append(title, actions);

      const nameField = document.createElement("oneline-room-card-textfield");
      nameField.label = getTranslation(this._hass, "adaptive_image_name");
      nameField.value = rule.name || "";
      nameField.addEventListener("change", (event) => {
        event.stopPropagation();
        updateRule(index, (nextRule) => {
          const value = trimStr(event.target.value);
          if (value) nextRule.name = value;
          else delete nextRule.name;
        }, true);
      });

      const presetLabel = document.createElement("label");
      presetLabel.className = "image-preset-help";
      presetLabel.textContent = getTranslation(this._hass, "adaptive_image_preset");
      const preset = document.createElement("select");
      preset.setAttribute("aria-label", getTranslation(this._hass, "adaptive_image_preset"));
      preset.style.cssText = "width:100%;padding:10px;margin-bottom:8px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color)";
      const customOption = document.createElement("option");
      customOption.value = "";
      customOption.textContent = getTranslation(this._hass, "adaptive_image_custom");
      preset.appendChild(customOption);
      ROOM_IMAGE_PRESETS.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = getTranslation(this._hass, item.labelKey);
        preset.appendChild(option);
      });
      preset.value = !rule.image && ROOM_IMAGE_PRESET_MAP.has(rule.image_preset) ? rule.image_preset : "";
      preset.addEventListener("change", (event) => {
        event.stopPropagation();
        updateRule(index, (nextRule) => {
          if (event.target.value) {
            nextRule.image_preset = event.target.value;
            delete nextRule.image;
          } else {
            delete nextRule.image_preset;
          }
        }, true);
      });

      const urlField = document.createElement("oneline-room-card-textfield");
      urlField.label = getTranslation(this._hass, "img_url");
      urlField.value = rule.image || "";
      urlField.addEventListener("change", (event) => {
        event.stopPropagation();
        updateRule(index, (nextRule) => {
          const value = trimStr(event.target.value);
          if (value) {
            nextRule.image = value;
            delete nextRule.image_preset;
          } else delete nextRule.image;
        }, true);
      });

      const uploadRow = document.createElement("div");
      uploadRow.className = "upload-row";
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.className = "upload-hidden";
      const uploadButton = document.createElement("mwc-button");
      uploadButton.raised = true;
      uploadButton.label = getTranslation(this._hass, "upload_btn");
      const uploadIcon = document.createElement("ha-icon");
      uploadIcon.setAttribute("icon", "mdi:upload");
      uploadIcon.setAttribute("slot", "icon");
      uploadButton.appendChild(uploadIcon);
      const uploadStatus = document.createElement("div");
      uploadStatus.className = "upload-status";
      uploadStatus.setAttribute("role", "status");
      uploadStatus.setAttribute("aria-live", "polite");
      uploadButton.addEventListener("click", (event) => { event.stopPropagation(); fileInput.click(); });
      fileInput.addEventListener("change", async (event) => {
        event.stopPropagation();
        const file = event.target.files?.[0];
        if (!file || !this._hass || this._uploading) return;
        this._uploading = true;
        uploadButton.disabled = true;
        uploadButton.label = getTranslation(this._hass, "uploading");
        try {
          const result = await this._uploadImageFile(file);
          updateRule(index, (nextRule) => {
            nextRule.image = result.url;
            delete nextRule.image_preset;
          });
          uploadStatus.textContent = getTranslation(this._hass, result.optimized ? "upload_optimized" : "upload_success");
          urlField.value = result.url;
          preset.value = "";
        } catch (error) {
          uploadStatus.textContent = getTranslation(this._hass, error?.translationKey || "upload_failed").replace("{status}", error?.status || "unknown");
          uploadStatus.classList.add("error");
        } finally {
          this._uploading = false;
          uploadButton.disabled = false;
          uploadButton.label = getTranslation(this._hass, "upload_btn");
          fileInput.value = "";
        }
      });
      uploadRow.append(fileInput, uploadButton);

      const position = parseImagePosition(rule.image_position || this._config.image_position);
      const focalTitle = document.createElement("div");
      focalTitle.className = "image-preset-help";
      focalTitle.textContent = getTranslation(this._hass, "adaptive_image_position");
      const focalControls = document.createElement("div");
      focalControls.className = "focal-controls";
      const buildRange = (axis, value, labelKey) => {
        const label = document.createElement("label");
        label.textContent = getTranslation(this._hass, labelKey);
        const input = document.createElement("input");
        input.type = "range";
        input.min = "0";
        input.max = "100";
        input.step = "1";
        input.value = String(value);
        const output = document.createElement("span");
        output.textContent = `${Math.round(value)}%`;
        input.addEventListener("input", (event) => {
          event.stopPropagation();
          output.textContent = `${event.target.value}%`;
          const x = axis === "x" ? Number(event.target.value) : Number(focalControls.querySelector("input[data-axis='x']")?.value ?? position.x);
          const y = axis === "y" ? Number(event.target.value) : Number(focalControls.querySelector("input[data-axis='y']")?.value ?? position.y);
          updateRule(index, (nextRule) => { nextRule.image_position = parseImagePosition(`${x}% ${y}%`).value; });
        });
        input.dataset.axis = axis;
        focalControls.append(label, input, output);
      };
      buildRange("x", position.x, "image_horizontal");
      buildRange("y", position.y, "image_vertical");

      const conditionTitle = document.createElement("div");
      conditionTitle.className = "image-preset-heading";
      conditionTitle.textContent = getTranslation(this._hass, "adaptive_image_conditions");
      const conditions = document.createElement("ha-card-conditions-editor");
      conditions.hass = this._hass;
      conditions.conditions = Array.isArray(rule.conditions) ? rule.conditions : [];
      conditions.addEventListener("value-changed", (event) => {
        event.stopPropagation();
        const value = Array.isArray(event.detail?.value) ? event.detail.value : [];
        conditions.conditions = value;
        updateRule(index, (nextRule) => { nextRule.conditions = value; });
      });

      box.append(header, nameField, presetLabel, preset, urlField, uploadRow, uploadStatus, focalTitle, focalControls, conditionTitle, conditions);
      list.appendChild(box);
    });
  }

  _updateImageSectionUI() {
    const sec = this.shadowRoot?.getElementById("image-sec");
    const content = this.shadowRoot?.getElementById("image-content");
    const title = this.shadowRoot?.getElementById("image-title");
    if (!sec || !content || !title) return;
    title.textContent = getTranslation(this._hass, "image");
    sec.classList.toggle("open", this._imageSectionOpen);
    content.hidden = !this._imageSectionOpen;
    if (this._imageSectionOpen) {
      this._renderImagePresetPicker();
      this._updateFocalPointUI();
      this._updateAdaptiveImagesUI();
    }
  }

  _setImagePosition(x, y) {
    const position = parseImagePosition(`${x}% ${y}%`);
    const next = { ...this._config };
    if (position.isDefault) delete next.image_position;
    else next.image_position = position.value;
    this._fire(next);
    this._updateFocalPointUI();
    this.updPreview();
  }

  _updateFocalPointUI() {
    const position = parseImagePosition(this._config?.image_position);
    const marker = this.shadowRoot?.getElementById("focal-marker");
    const xInput = this.shadowRoot?.getElementById("focal-x");
    const yInput = this.shadowRoot?.getElementById("focal-y");
    const xValue = this.shadowRoot?.getElementById("focal-x-value");
    const yValue = this.shadowRoot?.getElementById("focal-y-value");
    if (marker) { marker.style.left = `${position.x}%`; marker.style.top = `${position.y}%`; }
    if (xInput) xInput.value = String(position.x);
    if (yInput) yInput.value = String(position.y);
    if (xValue) xValue.textContent = `${Math.round(position.x)}%`;
    if (yValue) yValue.textContent = `${Math.round(position.y)}%`;
  }

  _setupFocalPointControl() {
    const preview = this.shadowRoot?.getElementById("focal-preview");
    const xInput = this.shadowRoot?.getElementById("focal-x");
    const yInput = this.shadowRoot?.getElementById("focal-y");
    const center = this.shadowRoot?.getElementById("focal-center");
    if (!preview || !xInput || !yInput || !center) return;
    let dragging = false;
    const updateFromPointer = (event) => {
      const rect = preview.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.round(Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)));
      const y = Math.round(Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)));
      this._setImagePosition(x, y);
    };
    preview.addEventListener("pointerdown", (event) => {
      dragging = true;
      preview.setPointerCapture?.(event.pointerId);
      updateFromPointer(event);
    });
    preview.addEventListener("pointermove", (event) => { if (dragging) updateFromPointer(event); });
    const stopDragging = (event) => {
      dragging = false;
      preview.releasePointerCapture?.(event.pointerId);
    };
    preview.addEventListener("pointerup", stopDragging);
    preview.addEventListener("pointercancel", stopDragging);
    const updateFromInputs = () => this._setImagePosition(Number(xInput.value), Number(yInput.value));
    xInput.addEventListener("input", updateFromInputs);
    yInput.addEventListener("input", updateFromInputs);
    center.addEventListener("click", () => this._setImagePosition(50, 50));
    this._updateFocalPointUI();
  }

  _renderImagePresetPicker() {
    const container = this.shadowRoot?.getElementById("image-presets");
    if (!container || !this._config) return;
    const hasCustomImage = typeof this._config.image === "string" && this._config.image.trim() !== "";
    const selectedPreset = !hasCustomImage && ROOM_IMAGE_PRESET_MAP.has(this._config.image_preset)
      ? this._config.image_preset
      : "";
    const buttons = [];

    const customButton = document.createElement("button");
    customButton.type = "button";
    customButton.className = `image-preset custom${selectedPreset ? "" : " selected"}`;
    customButton.setAttribute("aria-pressed", selectedPreset ? "false" : "true");
    customButton.innerHTML = `<ha-icon icon="mdi:image-edit-outline"></ha-icon><span class="image-preset-label">${getTranslation(this._hass, "image_preset_custom")}</span>`;
    customButton.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const next = { ...this._config };
      delete next.image_preset;
      this._fire(next);
      this._renderImagePresetPicker();
      this.updPreview();
    });
    buttons.push(customButton);

    ROOM_IMAGE_PRESETS.forEach((preset) => {
      const button = document.createElement("button");
      const isSelected = selectedPreset === preset.id;
      button.type = "button";
      button.className = `image-preset${isSelected ? " selected" : ""}`;
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
      button.title = getTranslation(this._hass, preset.labelKey);

      const image = document.createElement("img");
      image.src = getRoomImagePresetUrl(preset.id);
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";

      const label = document.createElement("span");
      label.className = "image-preset-label";
      label.textContent = getTranslation(this._hass, preset.labelKey);
      button.append(image, label);
      button.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (this._config?.image_preset === preset.id && !this._config?.image) return;
        const next = { ...this._config, image_preset: preset.id };
        delete next.image;
        this._fire(next);
        this._renderImagePresetPicker();
        this.updPreview();
      });
      buttons.push(button);
    });

    container.replaceChildren(...buttons);
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
    const tempUnitSel = this.shadowRoot?.getElementById("temp-unit-sel");
    if (tempUnitSel) tempUnitSel.value = normalizeTemperatureUnit(this._config?.temp_unit) || "default";
    const chipShadowToggle = this.shadowRoot?.getElementById("chip-shadow-toggle");
    if (chipShadowToggle) chipShadowToggle.checked = this._config?.show_chip_shadow !== false;
    const statusBorderToggle = this.shadowRoot?.getElementById("status-border-toggle");
    if (statusBorderToggle) statusBorderToggle.checked = this._config?.show_status_border !== false;
    const presenceSolidBgToggle = this.shadowRoot?.getElementById("presence-solid-bg");
    if (presenceSolidBgToggle) presenceSolidBgToggle.checked = this._config?.presence_solid_background === true;
    const presenceColor = trimStr(this._config?.presence_chip_color) || "";
    const effectivePresenceColor = presenceColor || "#4CAF50";
    const presenceColorField = this.shadowRoot?.getElementById("presence-chip-color");
    if (presenceColorField && presenceColorField.value !== presenceColor) presenceColorField.value = presenceColor;
    const presenceColorPicker = this.shadowRoot?.getElementById("presence-chip-color-picker");
    if (presenceColorPicker) {
      presenceColorPicker.value = parseColorToPickerHex(effectivePresenceColor);
      const preview = presenceColorPicker.closest(".cp-preview")?.querySelector("div");
      if (preview) preview.style.backgroundColor = effectivePresenceColor;
    }
    const solidBgToggle = this.shadowRoot?.getElementById("window-solid-bg");
    if (solidBgToggle) solidBgToggle.checked = this._config?.window_solid_background === true;
    this._syncManualSensorLabelInputs();
    this._updateWindowLabelsUI();
  }

  _updateSparklineRefreshUI() {
    const field = this.shadowRoot?.getElementById("sparkline-refresh");
    if (field) field.value = this._config?.sparkline_refresh ?? "";
  }

  _syncManualSensorLabelInputs() {
    this.shadowRoot?.querySelectorAll(".sensor-label-input").forEach((input) => {
      const key = input.dataset?.cfg;
      if (!key) return;
      const value = this._config?.[key] || "";
      if (input.value !== value) input.value = value;
    });
  }

  _updateWindowLabelsUI() {
    const list = this.shadowRoot?.getElementById("window-labels-list");
    if (!list) return;

    const h = this._hass;
    const labels = (this._config?.window_labels && typeof this._config.window_labels === "object")
      ? this._config.window_labels
      : {};
    const sensors = Array.isArray(this._config?.window_sensors)
      ? this._config.window_sensors.map((entity) => trimStr(entity)).filter(Boolean)
      : [];
    const entries = [...new Set(sensors)].map((entity) => [entity, labels[entity] || ""]);
    const fireLabels = (nextLabels) => {
      const clean = {};
      entries.forEach(([entity]) => {
        const key = trimStr(entity);
        const value = trimStr(nextLabels[key]);
        if (key && value) clean[key] = value;
      });
      const next = { ...this._config };
      if (Object.keys(clean).length > 0) next.window_labels = clean;
      else delete next.window_labels;
      this._fire(next);
      this._updateWindowLabelsUI();
    };

    list.replaceChildren();
    if (entries.length === 0) return;

    entries.forEach(([entity, label], idx) => {
      const box = document.createElement("div");
      box.className = "badge-box";

      const headRow = document.createElement("div");
      headRow.className = "badge-head-row";
      const entityLabel = document.createElement("span");
      entityLabel.className = "badge-entity-label";
      entityLabel.textContent = entity || `${getTranslation(h, "window")} ${idx + 1}`;
      headRow.appendChild(entityLabel);
      box.appendChild(headRow);

      const labelCaption = document.createElement("label");
      labelCaption.className = "window-label-field-label";
      labelCaption.textContent = getTranslation(h, "window_custom_label");
      box.appendChild(labelCaption);

      const labelField = document.createElement("input");
      labelField.type = "text";
      labelField.className = "window-label-input";
      labelField.placeholder = h?.states?.[entity]?.attributes?.friendly_name || getTranslation(h, "window");
      labelField.value = label || "";
      labelField.addEventListener("change", (ev) => {
        ev.stopPropagation();
        const nextLabels = { ...labels, [entity]: ev.target.value || "" };
        fireLabels(nextLabels);
      });
      labelField.addEventListener("keydown", (ev) => ev.stopPropagation());
      box.appendChild(labelField);

      list.appendChild(box);
    });
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

      const lf = document.createElement("oneline-room-card-textfield");
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

      const bgField = document.createElement("oneline-room-card-textfield");
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
      const popoverField = document.createElement("oneline-room-card-textfield");
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
    const headerTextShadowToggle = this.shadowRoot?.getElementById("header-text-shadow-toggle");
    if (headerTextShadowToggle) headerTextShadowToggle.checked = this._config?.show_header_text_shadow !== false;
    
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
    const preview = this.shadowRoot.getElementById("focal-preview");
    const selection = resolveAdaptiveRoomImage(this._config, this._hass);
    img.style.objectPosition = selection.position;
    if (selection.url) {
      img.src = selection.url;
      img.classList.add("show");
      preview?.classList.add("show");
    } else {
      img.removeAttribute("src");
      img.classList.remove("show");
      preview?.classList.remove("show");
    }
    this._updateFocalPointUI();
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
      // Static per-control editor scaffold. summaryText is assigned with textContent below.
      box.innerHTML = `
        <summary class="head">
          <span class="head-left"><ha-icon class="chev" icon="mdi:chevron-right"></ha-icon><span class="summary-text"></span></span>
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
            <oneline-room-card-textfield class="nm" label="${getTranslation(h, "name")}"></oneline-room-card-textfield>
            <div style="position: relative; flex: 1; display: flex; align-items: flex-end;">
              <ha-icon-picker class="ic" label="${getTranslation(h, "icon")}" style="width: 100%;"></ha-icon-picker>
              <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
                 <div class="color-popover">
                    <oneline-room-card-textfield class="cl-pop" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></oneline-room-card-textfield>
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
            <oneline-room-card-textfield class="bg-txt" label="${getTranslation(h, "button_bg")}" style="width: 100%"></oneline-room-card-textfield>
            <div class="color-container" style="position: absolute; right: 8px; bottom: 8px; z-index: 1;">
               <div class="color-popover">
                  <oneline-room-card-textfield class="bg-txt-pop" placeholder="#hex" style="width: 100%; margin-bottom: 0; --mdc-text-field-fill-color: rgba(255,255,255,0.1); --mdc-text-field-ink-color: white;"></oneline-room-card-textfield>
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
          <oneline-room-card-textfield class="tc" label="${getTranslation(h, "tmpl_content")}"></oneline-room-card-textfield>
          <div class="row"><oneline-room-card-textfield class="ti" label="${getTranslation(h, "tmpl_icon")}"></oneline-room-card-textfield><oneline-room-card-textfield class="tcl" label="${getTranslation(h, "tmpl_color")}"></oneline-room-card-textfield></div>
          <oneline-room-card-textfield class="ts" label="${getTranslation(h, "tmpl_state")}"></oneline-room-card-textfield>
          <div class="tmpl-preview"><span>${getTranslation(h, "tmpl_preview")}:</span> <ha-icon class="tp-ic"></ha-icon> <span class="tp-tx"></span></div>
        </details>
        <div class="row" style="margin-top:8px; align-items:center"><ha-selector class="al" label="${getTranslation(h, "align")}"></ha-selector><ha-selector class="lp" label="${getTranslation(h, "label_position")}"></ha-selector><ha-selector class="tl" label="${getTranslation(h, "text_layout")}"></ha-selector><ha-formfield label="${getTranslation(h, "show_state")}"><ha-switch class="ss" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_label")}"><ha-switch class="sl" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_icon")}"><ha-switch class="si" checked></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_last_changed")}"><ha-switch class="slc"></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "show_sparkline")}"><ha-switch class="sps"></ha-switch></ha-formfield><oneline-room-card-textfield class="sh" label="${getTranslation(h, "sparkline_hours")}" type="number" placeholder="24" style="max-width:120px"></oneline-room-card-textfield><ha-formfield class="spd-wrap" label="${getTranslation(h, "sparkline_detail")}" style="display:${r_dom === "sensor" && ctrl.show_sparkline === true ? "inline-flex" : "none"}"><ha-switch class="spd"></ha-switch></ha-formfield><ha-formfield label="${getTranslation(h, "visible")}"><ha-switch class="hd" checked></ha-switch></ha-formfield></div>
        <div class="entity-only ${hideEntity}" style="margin-top:12px; border-top:1px solid var(--divider-color); padding-top:12px">
           <oneline-room-card-textfield class="isz" label="${getTranslation(h, "icon_size")}" type="number" style="max-width:120px" placeholder="20"></oneline-room-card-textfield>
           <ha-selector class="cm" label="${getTranslation(h, "control_mode")}"></ha-selector>
           <div class="sst-wrap" style="display:${showStyle};margin-bottom:8px;">
             <ha-selector class="sst" label="${getTranslation(h, "slider_style")}"></ha-selector>
           </div>
           <div class="sm-wrap" style="display:${showMode};margin-bottom:8px;">
             <ha-selector class="sm" label="${getTranslation(h, "slider_mode")}"></ha-selector>
           </div>
           <ha-selector class="tap" label="${getTranslation(h, "tap_action")}"></ha-selector>
           <oneline-room-card-textfield class="tap-nav ${showNav}" label="Nav Pfad"></oneline-room-card-textfield>
           <ha-selector class="hold" label="${getTranslation(h, "hold_action")}"></ha-selector>
           <ha-selector class="dbl" label="${getTranslation(h, "double_tap_action")}"></ha-selector>
        </div>
        <div class="entity-only cover-only ${hideEntity}" style="margin-top:8px; border-top:1px solid var(--divider-color); padding-top:8px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <ha-formfield label="${getTranslation(h, "show_cover_presets")}"><ha-switch class="scp"></ha-switch></ha-formfield>
            <oneline-room-card-textfield class="cpv" label="${getTranslation(h, "cover_presets_label")}" placeholder="0, 25, 50, 75, 100" style="flex:1;min-width:160px"></oneline-room-card-textfield>
          </div>
        </div>
        <div class="entity-only climate-only ${hideEntity}" style="margin-top:8px; border-top:1px solid var(--divider-color); padding-top:8px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <ha-formfield label="${getTranslation(h, "show_climate_presets")}"><ha-switch class="sctp"></ha-switch></ha-formfield>
            <oneline-room-card-textfield class="ctpv" label="${getTranslation(h, "climate_presets_label")}" placeholder="0, 18, 20, auto, max" style="flex:1;min-width:160px"></oneline-room-card-textfield>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px">
            <ha-formfield label="${getTranslation(h, "show_hvac_modes")}"><ha-switch class="shvac"></ha-switch></ha-formfield>
            <ha-formfield label="${getTranslation(h, "show_fan_modes")}"><ha-switch class="sfan"></ha-switch></ha-formfield>
          </div>
        </div>
        <div class="entity-only light-only ${hideEntity}" style="margin-top:8px; border-top:1px solid var(--divider-color); padding-top:8px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
            <ha-formfield label="${getTranslation(h, "show_brightness_value")}"><ha-switch class="sbv"></ha-switch></ha-formfield>
            <ha-formfield label="${getTranslation(h, "show_brightness_presets")}"><ha-switch class="sbp"></ha-switch></ha-formfield>
            <oneline-room-card-textfield class="bpv" label="${getTranslation(h, "brightness_presets_label")}" placeholder="25, 50, 75, 100" style="flex:1;min-width:160px"></oneline-room-card-textfield>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <ha-formfield label="${getTranslation(h, "show_color_favorites")}"><ha-switch class="scf"></ha-switch></ha-formfield>
            <div class="cfv-swatches" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:28px"></div>
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
      box.querySelector(".summary-text").textContent = `#${i + 1} — ${summaryText}`;

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
        const shvac = climateOnly.querySelector(".shvac");
        if (shvac) {
          shvac.checked = ctrl.show_hvac_modes === true;
          shvac.addEventListener("change", e => {
            e.stopPropagation();
            const c = [...this._config.controls];
            const next = { ...c[i] };
            if (e.target.checked) next.show_hvac_modes = true; else delete next.show_hvac_modes;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
        const sfan = climateOnly.querySelector(".sfan");
        if (sfan) {
          sfan.checked = ctrl.show_fan_modes === true;
          sfan.addEventListener("change", e => {
            e.stopPropagation();
            const c = [...this._config.controls];
            const next = { ...c[i] };
            if (e.target.checked) next.show_fan_modes = true; else delete next.show_fan_modes;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
      }

      const lightOnly = box.querySelector(".light-only");
      if (lightOnly) {
        lightOnly.hidden = ctrlDomain !== "light";
        const sbv = lightOnly.querySelector(".sbv");
        const sbp = lightOnly.querySelector(".sbp");
        const bpv = lightOnly.querySelector(".bpv");
        const scf = lightOnly.querySelector(".scf");
        const cfvContainer = lightOnly.querySelector(".cfv-swatches");
        if (sbv) {
          sbv.checked = ctrl.show_brightness_value !== false;
          sbv.addEventListener("change", e => {
            e.stopPropagation();
            const c = [...this._config.controls];
            const next = { ...c[i] };
            next.show_brightness_value = e.target.checked;
            this._lastInteractedControlId = key;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
        if (sbp) {
          sbp.checked = ctrl.show_brightness_presets === true;
          sbp.addEventListener("change", e => {
            e.stopPropagation();
            const c = [...this._config.controls];
            const next = { ...c[i] };
            if (e.target.checked) {
              next.show_brightness_presets = true;
              if (!next.brightness_presets) next.brightness_presets = [25, 50, 75, 100];
            } else {
              delete next.show_brightness_presets;
            }
            this._lastInteractedControlId = key;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
        if (bpv) {
          bpv.value = Array.isArray(ctrl.brightness_presets)
            ? ctrl.brightness_presets.join(", ")
            : (ctrl.brightness_presets || "");
          bpv.addEventListener("change", e => {
            e.stopPropagation();
            const raw = e.target.value.trim();
            const parsed = raw
              ? raw.split(",")
                .map(v => parseFloat(v.trim()))
                .filter(v => !isNaN(v))
                .map(v => Math.max(1, Math.min(100, Math.round(v))))
              : [];
            const c = [...this._config.controls];
            const next = { ...c[i] };
            const unique = [...new Set(parsed)];
            if (unique.length) next.brightness_presets = unique;
            else delete next.brightness_presets;
            this._lastInteractedControlId = key;
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
          });
        }
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
            c[i] = next; keepOpen(); this._fire({ ...this._config, controls: c });
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

      const mediaOnly = box.querySelector(".media-only");
      if (mediaOnly) {
        mediaOnly.hidden = true;
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
            const stateField = document.createElement("oneline-room-card-textfield");
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
            const colorField = document.createElement("oneline-room-card-textfield");
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
      const sps = box.querySelector(".sps");
      if (sps) {
        sps.checked = ctrl.show_sparkline === true;
        sps.addEventListener("change", e => {
          e.stopPropagation();
          const detailWrap = box.querySelector(".spd-wrap");
          if (detailWrap) detailWrap.style.display = r_dom === "sensor" && e.target.checked === true ? "inline-flex" : "none";
          upd("show_sparkline", e.target.checked === true ? true : undefined);
        });
      }
      const spd = box.querySelector(".spd");
      if (spd) {
        spd.checked = ctrl.sparkline_detail === true;
        spd.addEventListener("change", e => { e.stopPropagation(); upd("sparkline_detail", e.target.checked === true ? true : undefined); });
      }
      const sh = box.querySelector(".sh");
      if (sh) {
        sh.value = ctrl.sparkline_hours || "";
        sh.addEventListener("change", e => {
          e.stopPropagation();
          const num = parseFloat(e.target.value);
          upd("sparkline_hours", (Number.isFinite(num) && num > 0) ? Math.round(num) : undefined);
        });
      }
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
        const isSelectDom = r_dom === "select" || r_dom === "input_select";
        const cmOptions = [
          { value: "none", label: getTranslation(h, "ctrl_default") || "Standard" },
        ];
        if (!isSelectDom) {
          cmOptions.push({ value: "slider", label: getTranslation(h, "ctrl_slider") || "Inline Slider" });
        }
        cmOptions.push({ value: "buttons", label: getTranslation(h, "ctrl_buttons") || "Inline Buttons" });
        if (r_dom !== "media_player") {
          cmOptions.push({ value: "full", label: isSelectDom ? (getTranslation(h, "ctrl_all_options") || "Alle Optionen") : (getTranslation(h, "ctrl_full") || "Full Controls") });
        }
        cm.selector = {
          select: {
            mode: "dropdown", options: cmOptions
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
        const popField = container.querySelector(".color-popover oneline-room-card-textfield");
        if (popField && popField.value !== v) popField.value = v;
        const mainField = container.closest(".row")?.querySelector(`oneline-room-card-textfield[cfg="${k}"]`);
        if (mainField && mainField.value !== v) mainField.value = v;
        if (k === "header_info_background") {
          const bgF = this.shadowRoot.getElementById("standard-badge-bg");
          if (bgF && bgF.value !== v) bgF.value = v;
        }
      } else {
        const prev = e.closest(".cp-preview")?.querySelector("div");
        if (prev) prev.style.backgroundColor = v;
        const mainField = this.shadowRoot.querySelector(`oneline-room-card-textfield[cfg="${k}"]`);
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

      const del = document.createElement("button");
      del.type = "button";
      del.setAttribute("aria-label", "Delete");
      del.title = "Delete";
      del.style.cssText = "position:absolute; right:4px; top:4px; z-index:2; width:34px; height:34px; border:0; border-radius:50%; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; color:var(--error-color);";
      del.innerHTML = `<ha-icon icon="mdi:delete" style="--mdc-icon-size:20px;color:var(--error-color)"></ha-icon>`;
      del.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const c = [...this._config.controls];
        const chs = [...(c[ctrlIdx].sub_chips || [])];
        chs.splice(chipIdx, 1);
        c[ctrlIdx] = { ...c[ctrlIdx], sub_chips: chs };
        this._lastRenderedControlsSig = JSON.stringify(c);
        this._fire({ ...this._config, controls: c });
        this._updateSubChipsUI(container, c[ctrlIdx], ctrlIdx, h);
      };
      box.appendChild(del);

      const ep = document.createElement("ha-entity-picker");
      ep.label = getTranslation(h, "chip_entity");
      ep.hass = h;
      ep.value = chip.entity || "";
      ep.style.width = "calc(100% - 38px)";
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

      const lb = document.createElement("oneline-room-card-textfield");
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

const findElementsAcrossShadowRoots = (root, selector) => {
  if (!root?.querySelectorAll) return [];
  const matches = [];
  const pendingRoots = [root];
  const visitedRoots = new Set();
  while (pendingRoots.length > 0) {
    const currentRoot = pendingRoots.pop();
    if (!currentRoot || visitedRoots.has(currentRoot)) continue;
    visitedRoots.add(currentRoot);
    currentRoot.querySelectorAll(selector).forEach((element) => matches.push(element));
    currentRoot.querySelectorAll("*").forEach((element) => {
      if (element.shadowRoot) pendingRoots.push(element.shadowRoot);
    });
  }
  return matches;
};

const patchExistingEditor = (ExistingEditor, NewEditor) => {
  Object.getOwnPropertyNames(NewEditor.prototype).forEach((name) => {
    if (name === "constructor") return;
    const descriptor = Object.getOwnPropertyDescriptor(NewEditor.prototype, name);
    if (descriptor) Object.defineProperty(ExistingEditor.prototype, name, descriptor);
  });
  if (typeof document === "undefined") return;
  findElementsAcrossShadowRoots(document, "oneline-room-card-editor").forEach((editor) => {
    if (!(editor instanceof ExistingEditor) || !editor._config) return;
    editor.render();
  });
};

const patchExistingCard = (ExistingCard, NewCard) => {
  Object.getOwnPropertyNames(NewCard.prototype).forEach((name) => {
    if (name === "constructor") return;
    const desc = Object.getOwnPropertyDescriptor(NewCard.prototype, name);
    if (desc) Object.defineProperty(ExistingCard.prototype, name, desc);
  });
  ["getStubConfig", "getConfigElement"].forEach((name) => {
    const desc = Object.getOwnPropertyDescriptor(NewCard, name);
    if (desc) Object.defineProperty(ExistingCard, name, desc);
  });
};

const existingEditor = customElements.get("oneline-room-card-editor");
if (!existingEditor) {
  customElements.define("oneline-room-card-editor", OneLineRoomCardEditor);
} else if (existingEditor !== OneLineRoomCardEditor) {
  patchExistingEditor(existingEditor, OneLineRoomCardEditor);
}

const existingCard = customElements.get("oneline-room-card");
if (!existingCard) {
  customElements.define("oneline-room-card", OneLineRoomCard);
} else if (existingCard !== OneLineRoomCard) {
  patchExistingCard(existingCard, OneLineRoomCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card?.type === "oneline-room-card")) {
  window.customCards.push({
    type: "oneline-room-card",
    name: "OneLine Room Card",
    preview: true,
    description: "Minimalist Room Card for Home Assistant"
  });
}

// Internal test seams: named ESM exports survive bundling without instrumenting
// the shipped artifact. These are not a supported consumer configuration API.
export {
  EDITOR_DOM_REVISION,
  OneLineRoomCardEditor,
  ROOM_IMAGE_PRESETS,
  SHARED_SPARKLINE_CACHE,
  SHARED_SPARKLINE_PENDING,
  TRANSLATIONS,
  clampNum,
  convertTemperatureValue,
  evalTemplateString,
  evaluateAdaptiveImageConditions,
  evaluateRoomModeActiveWhen,
  formatConvertedTemperature,
  formatEntityStateForDisplay,
  getConditionEntityDependencies,
  getRoomImagePresetUrl,
  getSparklineStats,
  getStatusGroupResult,
  getTemplateEntityDependencies,
  getTranslation,
  hexToRgba,
  normalizeSparklineSamples,
  normalizeTemperatureUnit,
  parseImagePosition,
  patchExistingEditor,
  pruneSharedSparklineCache,
  readableTextForHex,
  replaceTemplateExpressions,
  resolveAdaptiveRoomImage,
  templateNeedsEveryHassUpdate,
  validateImageUpload
};
