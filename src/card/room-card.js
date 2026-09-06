import { clampNum, replaceTemplateExpressions, trimStr } from "../lib/values.js";
import { formatEntityStateForDisplay, formatEntityAttributeForDisplay } from "../lib/formatting.js";
import { normalizeTemperatureUnit, convertTemperatureValue, temperatureNumberLocale, formatConvertedTemperature, formatTemperatureStateForDisplay, formatTemperatureAttributeForDisplay } from "../lib/temperature.js";
import { hexToRgba, readableTextForHex, parseColorToPickerHex } from "../lib/colors.js";
import { STATE_DEFINITIONS, DOMAIN_STATE_ICON_MAPS, getEntityDomain, getEntityStateValue, isOfflineStateValue, isEntityOffline, isEntityOn, isEntityOff, isEntityActive } from "../lib/states.js";
import { getConditionEntityDependencies, evaluateRoomModeActiveWhen, evaluateVisibilityCondition } from "../lib/conditions.js";
import { normalizeAlertSensorConfig, isAlertSensorActive } from "../lib/alerts.js";
import { getTranslation } from "../i18n/translations.js";
import { buildHassActionDetail } from "../lib/actions.js";
import { SHARED_SPARKLINE_CACHE, SHARED_SPARKLINE_PENDING, normalizeSparklineSamples, getSparklineStats, pruneSharedSparklineCache, fetchHistorySamples } from "../lib/history.js";
import { MEDIA_PLAYER_FEATURES, getSliderCapabilities, getInlineButtons, supportsMediaFeature } from "../lib/capabilities.js";
import { VERSION, EDITOR_DOM_REVISION } from "../version.js";
import { createDetailDrawer } from "./detail-drawer.js";
import { getRoomSurfaceMarkup } from "./surface.js";
import { isControlInContext } from "../lib/control-placement.js";
import { registerDrawerPreview } from "../shared/drawer-preview.js";
import { deepActiveElement, getDialogCoordinator } from "../shared/dialog-coordinator.js";
import { IMAGE_UPLOAD_LIMITS, parseImagePosition, validateImageUpload, ROOM_IMAGE_PRESETS, ROOM_IMAGE_PRESET_MAP, getRoomImagePresetUrl, resolveRoomImageUrl, evaluateAdaptiveImageConditions, resolveAdaptiveRoomImage, getStatusGroupResult, isHeaderManualColorEnabled, resolveLabelPosition, setAlignmentClass, applyLabelPosition, evalTemplateString, resolveTemplateCtrl, resolveSubChipPresentations, TEMPLATE_VALUE_KEYS, getTemplateEntityDependencies, templateNeedsEveryHassUpdate, formatLastChanged } from "../shared/presentation.js";


class OneLineRoomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._quickAddOpen = false;
    this._lastStates = new Map();
    this._lastRenderMetaSig = "";
    this._cachedEntityIds = null;
    this._templateDependencyEntityIds = null;
    this._activeTimers = new Set();
    this._lastChangedInterval = null;
    this._sparklineCache = new Map();
    this._sparklinePending = new Map();
    this._sparklineInterval = null;
    this._sparklineRefreshSec = 300;
    this._sparklineVisible = true;
    this._sparklineObserver = null;
    this._boundPageVisibilityChange = () => this._setupSparklineInterval();
    this._closeDialog = null;
    this._sparklineDialogRequest = 0;
    this._headerImageRequest = 0;
    this._headerImageRequests = new WeakMap();
    this._adaptiveMediaQueries = [];
  }

  connectedCallback() {
    this._stopDrawerPreview?.();
    this._stopDrawerPreview = registerDrawerPreview(this, trigger => {
      this._showDetailDrawer(trigger);
      return !!this._detailDrawer;
    });
    document.addEventListener("visibilitychange", this._boundPageVisibilityChange);
    this._setupSparklineVisibilityObserver();
    if (this.config) {
      this._setupAdaptiveMediaQueries();
      this._setupLastChangedInterval();
      this._setupSparklineInterval();
      // HA may configure the card while detached, when header image commits are
      // intentionally ignored. Retry on connection, even with unchanged state.
      this.updateContent();
    }
  }

  disconnectedCallback() {
    this._stopDrawerPreview?.();
    this._stopDrawerPreview = null;
    this._detailDrawer?.close(false);
    this._closeDialog?.();
    this._closeDialog = null;
    this._sparklineDialogRequest += 1;
    this._headerImageRequest += 1;
    this._activeTimers.forEach(clearTimeout);
    this._activeTimers.clear();
    if (this._lastChangedInterval) {
      clearInterval(this._lastChangedInterval);
      this._lastChangedInterval = null;
    }
    if (this._sparklineInterval) {
      clearInterval(this._sparklineInterval);
      this._sparklineInterval = null;
    }
    document.removeEventListener("visibilitychange", this._boundPageVisibilityChange);
    this._sparklineObserver?.disconnect();
    this._sparklineObserver = null;
    this._sparklinePending.clear();
    this._clearAdaptiveMediaQueries();
  }

  _setupSparklineVisibilityObserver() {
    this._sparklineObserver?.disconnect();
    this._sparklineObserver = null;
    if (typeof IntersectionObserver !== "function") {
      this._sparklineVisible = true;
      return;
    }
    this._sparklineVisible = false;
    this._sparklineObserver = new IntersectionObserver((entries) => {
      const entry = entries.find((candidate) => candidate.target === this) || entries[0];
      const visible = !!entry?.isIntersecting && (entry.intersectionRatio === undefined || entry.intersectionRatio > 0);
      if (visible === this._sparklineVisible) return;
      this._sparklineVisible = visible;
      this._setupSparklineInterval();
    });
    this._sparklineObserver.observe(this);
  }

  _isSparklinePollingActive() {
    return this.isConnected && (this._sparklineVisible || !!this._detailDrawer) && document.hidden !== true;
  }

  _isControlRendered(ctrl) {
    // HA can configure/connect a card before providing its first state snapshot.
    if (!this._hass || ctrl.hide || !this._checkConditions(ctrl.visibility, this._hass)) return false;
    return (this._sparklineVisible && isControlInContext(ctrl, this.config, "card"))
      || (!!this._detailDrawer && isControlInContext(ctrl, this.config, "drawer"));
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) this.render();
    if (!this._shouldUpdateFromHass(hass)) {
      if (this._detailDrawer) this._syncDetailDrawer();
      return;
    }
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
    if (config.detail_drawer?.enabled !== true) this._detailDrawer?.close();
    this._sparklineRefreshSec = clampNum(config.sparkline_refresh, 60, 3600, 300);
    this._collapseKey = `oneline-room-card-collapsed:${this._getCollapseUniqueId(config)}`;
    if (this._collapseKey !== prevKey) {
      const stored = config.remember_state !== false ? localStorage.getItem(this._collapseKey) : null;
      this._collapsed = stored !== null ? stored === "1" : (config.default_state === "collapsed");
    }
    this._configChanged = true;
    this._lastStates = new Map();
    this._lastRenderMetaSig = "";
    this._cachedEntityIds = null;
    this._templateDependencyEntityIds = null;
    if (!this.content) this.render();
    this.updateContent();
    this._setupAdaptiveMediaQueries();
    this._setupLastChangedInterval();
    this._setupSparklineInterval();
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

  _clearAdaptiveMediaQueries() {
    (this._adaptiveMediaQueries || []).forEach(({ query, listener }) => {
      if (typeof query.removeEventListener === "function") query.removeEventListener("change", listener);
      else query.removeListener?.(listener);
    });
    this._adaptiveMediaQueries = [];
  }

  _setupAdaptiveMediaQueries() {
    this._clearAdaptiveMediaQueries();
    if (typeof window.matchMedia !== "function") return;
    const queries = new Set();
    const visit = (condition) => {
      if (!condition || typeof condition !== "object") return;
      if (condition.condition === "screen" && trimStr(condition.media_query)) queries.add(trimStr(condition.media_query));
      if (Array.isArray(condition.conditions)) condition.conditions.forEach(visit);
    };
    (Array.isArray(this.config?.adaptive_images) ? this.config.adaptive_images : [])
      .forEach((rule) => (Array.isArray(rule?.conditions) ? rule.conditions : []).forEach(visit));
    (Array.isArray(this.config?.status_groups) ? this.config.status_groups : []).forEach((group) => {
      (Array.isArray(group?.conditions) ? group.conditions : []).forEach(visit);
      (Array.isArray(group?.entities) ? group.entities : []).forEach((entry) => {
        if (entry && typeof entry === "object") (Array.isArray(entry.conditions) ? entry.conditions : []).forEach(visit);
      });
    });
    queries.forEach((mediaQuery) => {
      try {
        const query = window.matchMedia(mediaQuery);
        const listener = () => this.updateContent();
        if (typeof query.addEventListener === "function") query.addEventListener("change", listener);
        else query.addListener?.(listener);
        this._adaptiveMediaQueries.push({ query, listener });
      } catch (_error) { }
    });
  }

  _hasSparklineControls() {
    return (this.config?.controls || []).some((ctrl) => {
      const domain = ctrl?.entity?.split?.(".")?.[0];
      return domain === "sensor" && ctrl.show_sparkline === true && this._isControlRendered(ctrl);
    });
  }

  _setupSparklineInterval() {
    if (this._sparklineInterval) {
      clearInterval(this._sparklineInterval);
      this._sparklineInterval = null;
    }
    if (!this._hasSparklineControls() || !this._isSparklinePollingActive()) return;
    this._sparklineInterval = setInterval(() => {
      this._refreshSparklineData();
    }, this._sparklineRefreshSec * 1000);
    this._refreshSparklineData();
  }

  _getSparklineCacheKey(entity, hours) {
    return `${entity}|${hours}`;
  }

  async _fetchSparklineData(entity, hours) {
    if (!entity || !this._hass) return { samples: [], error: "unavailable" };
    const key = this._getSparklineCacheKey(entity, hours);
    if (this._sparklinePending.has(key)) return this._sparklinePending.get(key);
    const now = Date.now();
    const sharedEntry = SHARED_SPARKLINE_CACHE.get(key);
    if (sharedEntry && now - sharedEntry.fetchedAt < this._sparklineRefreshSec * 1000) {
      sharedEntry.lastAccess = now;
      SHARED_SPARKLINE_CACHE.delete(key);
      SHARED_SPARKLINE_CACHE.set(key, sharedEntry);
      this._sparklineCache.set(key, sharedEntry.data);
      this._updateSparklineElements(key, sharedEntry.data);
      return sharedEntry.data;
    }
    let promise = SHARED_SPARKLINE_PENDING.get(key);
    if (!promise) {
      promise = fetchHistorySamples((message) => this._hass.callWS(message), entity, hours);
      SHARED_SPARKLINE_PENDING.set(key, promise);
    }
    this._sparklinePending.set(key, promise);
    try {
      const data = await promise;
      const completedAt = Date.now();
      SHARED_SPARKLINE_CACHE.delete(key);
      SHARED_SPARKLINE_CACHE.set(key, { data, fetchedAt: completedAt, lastAccess: completedAt });
      pruneSharedSparklineCache(completedAt);
      this._sparklineCache.set(key, data);
      this._updateSparklineElements(key, data);
      return data;
    } finally {
      if (SHARED_SPARKLINE_PENDING.get(key) === promise) SHARED_SPARKLINE_PENDING.delete(key);
      if (this._sparklinePending.get(key) === promise) this._sparklinePending.delete(key);
    }
  }

  async _refreshSparklineData() {
    if (!this._hasSparklineControls() || !this._hass || !this._isSparklinePollingActive()) return;
    const requests = [];
    for (const ctrl of this.config.controls || []) {
      if (!this._isControlRendered(ctrl)) continue;
      if (ctrl?.show_sparkline !== true) continue;
      const domain = ctrl?.entity?.split?.(".")?.[0];
      if (domain !== "sensor") continue;
      const hours = clampNum(ctrl.sparkline_hours, 1, 168, 24);
      const key = this._getSparklineCacheKey(ctrl.entity, hours);
      requests.push(this._fetchSparklineData(ctrl.entity, hours));
      if (!this._sparklineCache.has(key)) this._sparklineCache.set(key, { samples: [], error: null });
    }
    await Promise.all(requests);
  }

  _updateSparklineElements(key, data) {
    const wrappers = [this._cardSurface, this._detailDrawer?.surface].filter(Boolean)
      .flatMap(surface => Array.from(surface.root.querySelectorAll(`.btn-sparkline[data-sparkline-key="${key}"]`)));
    wrappers.forEach(wrapper => {
      const btn = wrapper.closest(".btn");
      if (!btn) return;
      const stroke = getComputedStyle(btn).getPropertyValue("--icon-color") || "currentColor";
      const points = normalizeSparklineSamples(data?.samples);
      if (points.length === 0) {
        wrapper.style.display = "none";
        const svg = wrapper.querySelector("svg"); if (svg) svg.replaceChildren();
      } else {
        wrapper.style.display = "block";
        this._drawSparkline(wrapper, points, stroke.trim() || "currentColor");
      }
    });
  }

  _drawSparkline(wrapper, normalizedPoints, stroke) {
    const svg = wrapper.querySelector("svg");
    if (!svg) return;
    if (!normalizedPoints || normalizedPoints.length === 0) {
      svg.replaceChildren();
      return;
    }
    const points = normalizedPoints.map(p => ({
      x: Math.max(0, Math.min(100, p.x * 100)),
      y: Number.isFinite(p.y) ? p.y : 0
    }));
    const maxVal = Math.max(...points.map(p => p.y));
    const minVal = Math.min(...points.map(p => p.y));
    const range = maxVal - minVal;
    const scaled = points.map(p => {
      const y = range === 0
        ? 11
        : Math.max(2, Math.min(20, 20 - ((p.y - minVal) / range) * 18));
      return `${p.x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const svgNs = "http://www.w3.org/2000/svg";
    const baseline = document.createElementNS(svgNs, "line");
    Object.entries({ x1: "0", y1: "20", x2: "100", y2: "20", stroke, "stroke-opacity": "0.2", "stroke-width": "1", "vector-effect": "non-scaling-stroke" })
      .forEach(([name, value]) => baseline.setAttribute(name, String(value)));
    const polyline = document.createElementNS(svgNs, "polyline");
    Object.entries({ points: scaled, fill: "none", stroke, "stroke-opacity": "0.95", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
      .forEach(([name, value]) => polyline.setAttribute(name, String(value)));
    svg.replaceChildren(baseline, polyline);
  }

  _renderBtnSparkline(btn, ctrl, color) {
    const entityId = ctrl.entity;
    const domain = entityId?.split?.(".")?.[0];
    const enabled = ctrl.show_sparkline === true && domain === "sensor";
    const hours = clampNum(ctrl.sparkline_hours, 1, 168, 24);
    const key = this._getSparklineCacheKey(entityId, hours);
    let wrapper = btn.querySelector(".btn-sparkline");
    if (!enabled) {
      if (wrapper) wrapper.remove();
      btn.classList.remove("has-sparkline");
      return;
    }
    const interactive = ctrl.sparkline_detail === true;
    if (wrapper && ((interactive && wrapper.tagName !== "BUTTON") || (!interactive && wrapper.tagName === "BUTTON"))) {
      wrapper.remove();
      wrapper = null;
    }
    if (!wrapper) {
      wrapper = document.createElement(interactive ? "button" : "div");
      wrapper.className = "btn-sparkline";
      if (interactive) {
        wrapper.type = "button";
        wrapper.addEventListener("pointerdown", (event) => event.stopPropagation());
        wrapper.addEventListener("pointerup", (event) => event.stopPropagation());
        wrapper.addEventListener("pointercancel", (event) => event.stopPropagation());
        wrapper.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this._showSparklineDialog(wrapper.dataset.sparklineEntity, Number(wrapper.dataset.sparklineHours), wrapper);
        });
        wrapper.addEventListener("keydown", (event) => event.stopPropagation());
      }
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 22");
      svg.setAttribute("preserveAspectRatio", "none");
      wrapper.appendChild(svg);
      btn.appendChild(wrapper);
    }
    btn.classList.add("has-sparkline");
    wrapper.dataset.sparklineKey = key;
    wrapper.dataset.sparklineEntity = entityId || "";
    wrapper.dataset.sparklineHours = String(hours);
    if (interactive) {
      const stateObj = this._hass?.states?.[entityId];
      const name = ctrl.name || stateObj?.attributes?.friendly_name || entityId;
      wrapper.setAttribute("aria-label", `${getTranslation(this._hass, "sparkline_detail")}: ${name}`);
    }
    const data = this._sparklineCache.has(key) ? this._sparklineCache.get(key) : undefined;
    const points = normalizeSparklineSamples(data?.samples);
    if (points.length === 0) {
      wrapper.style.display = "none";
    } else {
      wrapper.style.display = "block";
      this._drawSparkline(wrapper, points, color || "currentColor");
    }
    if (this._isSparklinePollingActive() && this._isControlRendered(ctrl) && !this._sparklinePending.has(key) && !this._sparklineCache.has(key)) {
      this._fetchSparklineData(entityId, hours);
    }
  }

  _formatSparklineValue(entityId, value) {
    const stateObj = this._hass?.states?.[entityId];
    const numericState = Number(value).toFixed(6).replace(/\.?0+$/, "");
    if (!stateObj) return numericState;
    return formatEntityStateForDisplay(this._hass, { ...stateObj, state: numericState });
  }

  _showSparklineDialog(entityId, initialHours = 24, trigger) {
    if (!entityId || !this._hass) return;
    const stateObj = this._hass.states?.[entityId];
    const name = stateObj?.attributes?.friendly_name || entityId;
    const previouslyFocused = trigger || this.shadowRoot.activeElement || document.activeElement;
    const container = document.createElement("div");
    container.className = "sparkline-dialog-container";
    const backdrop = document.createElement("div");
    backdrop.className = "sparkline-dialog-backdrop";
    backdrop.dataset.dialogBackdrop = "";
    backdrop.setAttribute("aria-hidden", "true");
    const panel = document.createElement("div");
    panel.className = "sparkline-dialog";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "sparkline-dialog-title");
    const header = document.createElement("div");
    header.className = "sparkline-dialog-header";
    const heading = document.createElement("h2");
    heading.id = "sparkline-dialog-title";
    heading.textContent = `${name} · ${getTranslation(this._hass, "sparkline_detail_title")}`;
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "sparkline-dialog-close";
    closeButton.setAttribute("aria-label", getTranslation(this._hass, "a11y_close"));
    closeButton.textContent = "✕";
    header.append(heading, closeButton);
    const content = document.createElement("div");
    content.className = "sparkline-dialog-content";
    const current = document.createElement("div");
    current.className = "sparkline-current";
    current.textContent = `${getTranslation(this._hass, "sparkline_current")}: ${stateObj ? formatEntityStateForDisplay(this._hass, stateObj) : "—"}`;
    const ranges = document.createElement("div");
    ranges.className = "sparkline-ranges";
    const rangeOptions = [{ hours: 6, label: "6h" }, { hours: 24, label: "24h" }, { hours: 168, label: "7d" }];
    const rangeButtons = rangeOptions.map((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.hours = String(option.hours);
      button.textContent = option.label;
      ranges.appendChild(button);
      return button;
    });
    const chart = document.createElement("div");
    chart.className = "sparkline-detail-chart";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 22");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    chart.appendChild(svg);
    const message = document.createElement("p");
    message.className = "sparkline-dialog-message";
    message.setAttribute("role", "status");
    const stats = document.createElement("dl");
    stats.className = "sparkline-stats";
    const statNodes = {};
    [["min", "sparkline_min"], ["max", "sparkline_max"], ["average", "sparkline_average"]].forEach(([key, labelKey]) => {
      const item = document.createElement("div");
      const label = document.createElement("dt");
      label.textContent = getTranslation(this._hass, labelKey);
      const value = document.createElement("dd");
      value.dataset.stat = key;
      item.append(label, value);
      stats.appendChild(item);
      statNodes[key] = value;
    });
    content.append(current, ranges, chart, message, stats);
    panel.append(header, content);
    container.append(backdrop, panel);
    const style = document.createElement("style");
    style.textContent = `
      .sparkline-dialog-container { position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; }
      .sparkline-dialog-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.5); cursor:pointer; }
      .sparkline-dialog { position:relative; z-index:10001; width:90%; max-width:520px; max-height:80vh; overflow:auto; color:var(--primary-text-color); background:var(--ha-card-background, white); border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,.35); }
      .sparkline-dialog-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px; border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12)); }
      .sparkline-dialog-header h2 { margin:0; font-size:18px; font-weight:600; }
      .sparkline-dialog-close { width:32px; height:32px; border:0; border-radius:6px; color:inherit; background:transparent; font-size:24px; cursor:pointer; }
      .sparkline-dialog-content { padding:16px; }
      .sparkline-current { margin-bottom:12px; font-size:16px; font-weight:600; }
      .sparkline-ranges { display:flex; gap:8px; margin-bottom:14px; }
      .sparkline-ranges button { min-width:52px; padding:7px 12px; border:1px solid var(--divider-color, rgba(0,0,0,.2)); border-radius:999px; color:inherit; background:transparent; cursor:pointer; }
      .sparkline-ranges button[aria-pressed="true"] { color:var(--text-primary-color, white); background:var(--primary-color, #03a9f4); border-color:var(--primary-color, #03a9f4); }
      .sparkline-detail-chart { min-height:148px; display:flex; align-items:center; padding:12px; border-radius:12px; background:rgba(128,128,128,.08); }
      .sparkline-detail-chart svg { width:100%; height:124px; overflow:visible; }
      .sparkline-dialog-message { min-height:20px; margin:10px 0 0; color:var(--secondary-text-color); }
      .sparkline-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:14px 0 0; }
      .sparkline-stats div { padding:10px; border-radius:10px; background:rgba(128,128,128,.08); }
      .sparkline-stats dt { font-size:12px; color:var(--secondary-text-color); }
      .sparkline-stats dd { margin:4px 0 0; font-weight:600; }
      .sparkline-dialog button:focus-visible { outline:2px solid var(--primary-color, #03a9f4); outline-offset:2px; }
    `;
    container.appendChild(style);
    this._openDialog(container, panel, closeButton, previouslyFocused, () => { this._sparklineDialogRequest += 1; });

    const loadRange = async (hours) => {
      const requestId = ++this._sparklineDialogRequest;
      panel.setAttribute("aria-busy", "true");
      message.textContent = getTranslation(this._hass, "sparkline_loading");
      chart.style.display = "none";
      stats.style.display = "none";
      rangeButtons.forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.hours) === hours)));
      const data = await this._fetchSparklineData(entityId, hours);
      if (requestId !== this._sparklineDialogRequest || !container.isConnected) return;
      panel.removeAttribute("aria-busy");
      const points = normalizeSparklineSamples(data?.samples);
      if (data?.error) {
        message.textContent = getTranslation(this._hass, "sparkline_error");
        return;
      }
      if (points.length === 0) {
        message.textContent = getTranslation(this._hass, "sparkline_empty");
        return;
      }
      message.textContent = "";
      chart.style.display = "flex";
      stats.style.display = "grid";
      this._drawSparkline(chart, points, "var(--primary-color, #03a9f4)");
      const values = getSparklineStats(data.samples);
      statNodes.min.textContent = this._formatSparklineValue(entityId, values.min);
      statNodes.max.textContent = this._formatSparklineValue(entityId, values.max);
      statNodes.average.textContent = this._formatSparklineValue(entityId, values.average);
    };
    rangeButtons.forEach((button) => button.addEventListener("click", () => loadRange(Number(button.dataset.hours))));
    const supportedInitialHours = rangeOptions.some((option) => option.hours === Number(initialHours)) ? Number(initialHours) : 24;
    loadRange(supportedInitialHours);
  }

  getCardSize() {
    const c = (Array.isArray(this.config?.controls) ? this.config.controls : [])
      .filter(ctrl => isControlInContext(ctrl, this.config, "card"));
    const hasRoomModes = (Array.isArray(this.config?.room_modes) ? this.config.room_modes : [])
      .some((mode) => ["scene", "script"].includes(getEntityDomain(mode?.entity)));
    return 3 + (hasRoomModes ? 1 : 0) + Math.ceil(c.length / 2.5);
  }

  static getStubConfig(hass) {
    return { name: "", entity: "", collapsible: true, controls: [] };
  }

  _createSurface(root, kind) {
    root.innerHTML = getRoomSurfaceMarkup(this._hass);
    const surface = { root, kind, controls: root.getElementById("ctrls"), signature: null };
    surface.controls.dataset.renderContext = kind;
    return surface;
  }

  render() {
    if (!this.config) return;
    this._cardSurface = this._createSurface(this.shadowRoot, "card");

    this.content = this.shadowRoot.querySelector(".container");
    this.controls = this.shadowRoot.getElementById("ctrls");
    const imageBox = this.shadowRoot.querySelector(".img-box");
    if (imageBox) this._attachHeaderActions(imageBox);
    const detailsButton = this.shadowRoot.getElementById("details-btn");
    for (const eventName of ["pointerdown", "pointerup", "pointercancel", "keydown", "keyup"]) detailsButton.addEventListener(eventName, event => event.stopPropagation());
    detailsButton.addEventListener("click", event => {
      event.stopPropagation();
      this._showDetailDrawer(detailsButton);
    });
    const collapseButton = this.shadowRoot.getElementById("collapse-btn");
    if (collapseButton) {
      ["pointerdown", "pointerup", "pointercancel"].forEach((eventName) => {
        collapseButton.addEventListener(eventName, (event) => event.stopPropagation());
      });
      collapseButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this._toggleCollapse();
      });
    }

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
    return controls.some((ctrl) => !ctrl?.hide && ctrl?.type === "template" && templateNeedsEveryHassUpdate(ctrl));
  }

  _hasAdaptiveEnvironmentCondition() {
    const visit = (condition) => {
      if (!condition || typeof condition !== "object") return false;
      if (["time", "screen", "user"].includes(condition.condition)) return true;
      return Array.isArray(condition.conditions) && condition.conditions.some(visit);
    };
    const adaptive = (Array.isArray(this.config?.adaptive_images) ? this.config.adaptive_images : [])
      .some((rule) => Array.isArray(rule?.conditions) && rule.conditions.some(visit));
    if (adaptive) return true;
    return (Array.isArray(this.config?.status_groups) ? this.config.status_groups : []).some((group) => {
      if (Array.isArray(group?.conditions) && group.conditions.some(visit)) return true;
      return (Array.isArray(group?.entities) ? group.entities : []).some((entry) =>
        entry && typeof entry === "object" && Array.isArray(entry.conditions) && entry.conditions.some(visit));
    });
  }

  _getTemplateDependencyEntityIds() {
    const ids = new Set();
    const add = (entityId) => {
      if (typeof entityId === "string" && entityId.trim()) ids.add(entityId.trim());
    };
    for (const ctrl of (Array.isArray(this.config?.controls) ? this.config.controls : [])) {
      if (ctrl?.type !== "template") continue;
      getTemplateEntityDependencies(ctrl).forEach(add);
      (Array.isArray(ctrl.sub_chips) ? ctrl.sub_chips : []).forEach((chip) => add(chip?.entity));
    }
    return ids;
  }

  _getRelevantEntityIds() {
    const cfg = this.config || {};
    const ids = new Set();
    const add = (id) => {
      if (typeof id === "string" && id.trim()) ids.add(id.trim());
    };
    add(cfg.entity);
    add(cfg.image_entity);
    add(cfg.presence_sensor);
    add(cfg.temp_sensor);
    add(cfg.target_temp_sensor);
    add(cfg.humid_sensor);
    (Array.isArray(cfg.window_sensors) ? cfg.window_sensors : []).forEach(add);
    (Array.isArray(cfg.battery_sensors) ? cfg.battery_sensors : []).forEach(add);
    (Array.isArray(cfg.alert_sensors) ? cfg.alert_sensors : []).forEach((s) => add(typeof s === "string" ? s : s?.entity));
    (Array.isArray(cfg.room_modes) ? cfg.room_modes : []).forEach((mode) => {
      add(mode?.entity);
      getConditionEntityDependencies(mode?.active_when).forEach(add);
    });
    (Array.isArray(cfg.adaptive_images) ? cfg.adaptive_images : []).forEach((rule) => {
      getConditionEntityDependencies(rule?.conditions).forEach(add);
    });
    (Array.isArray(cfg.status_groups) ? cfg.status_groups : []).forEach((group) => {
      getConditionEntityDependencies(group?.conditions).forEach(add);
      (Array.isArray(group?.entities) ? group.entities : []).forEach((entry) => {
        add(typeof entry === "string" ? entry : entry?.entity);
        if (entry && typeof entry === "object") getConditionEntityDependencies(entry.conditions).forEach(add);
      });
    });
    (Array.isArray(cfg.controls) ? cfg.controls : []).forEach((ctrl) => {
      add(ctrl?.entity);
      if (ctrl?.type === "template") getTemplateEntityDependencies(ctrl).forEach(add);
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

  _getStateSignature(entityId, stateObj, hass, trackFullState = false) {
    if (!stateObj) return "__missing__";
    const attrs = stateObj.attributes || {};
    const registryEntry = hass?.entities?.[entityId] || {};
    if (trackFullState) {
      let serializedState = "";
      try {
        serializedState = JSON.stringify({
          entity_id: stateObj.entity_id ?? entityId,
          state: stateObj.state ?? "",
          attributes: attrs,
          last_changed: stateObj.last_changed ?? "",
          last_updated: stateObj.last_updated ?? "",
          context: stateObj.context ?? null
        });
      } catch (error) {
        serializedState = `${stateObj.state ?? ""}|${String(attrs)}`;
      }
      return [
        serializedState,
        registryEntry.display_precision ?? "",
        registryEntry.unit_of_measurement ?? "",
        registryEntry.device_class ?? ""
      ].join("|");
    }
    const rgb = Array.isArray(attrs.rgb_color) ? attrs.rgb_color.join(",") : "";
    return [
      stateObj.state ?? "",
      attrs.unit_of_measurement ?? "",
      attrs.device_class ?? "",
      registryEntry.display_precision ?? "",
      registryEntry.unit_of_measurement ?? "",
      registryEntry.device_class ?? "",
      attrs.current_temperature ?? "",
      attrs.temperature ?? "",
      attrs.current_humidity ?? "",
      attrs.friendly_name ?? "",
      attrs.hvac_action ?? "",
      attrs.fan_mode ?? "",
      attrs.icon ?? "",
      attrs.current_position ?? "",
      attrs.color_temp ?? "",
      attrs.brightness ?? "",
      rgb
    ].join("|");
  }

  _normalizeAlertSensorConfig(cfg) {
    return normalizeAlertSensorConfig(cfg);
  }

  _isAlertSensorActive(alertCfg, stateObj) {
    return isAlertSensorActive(alertCfg, stateObj, (config) => this._normalizeAlertSensorConfig(config));
  }

  _openDialog(container, panel, closeButton, previouslyFocused, onClose) {
    this._closeDialog?.(false);
    const coordinator = getDialogCoordinator();
    (this._detailDrawer?.root || this.shadowRoot).appendChild(container);
    let closing = false;
    const closeDialog = (restoreFocus = true) => {
      if (closing) return;
      closing = true;
      container.remove();
      onClose?.();
      if (this._closeDialog === closeDialog) this._closeDialog = null;
      coordinator.remove(entry, restoreFocus);
    };
    const entry = { panel, initialFocus: closeButton, restoreTarget: previouslyFocused, close: closeDialog };
    this._closeDialog = closeDialog;
    const dismiss = () => { if (coordinator.isTop(entry)) closeDialog(); };
    closeButton.addEventListener("click", dismiss);
    container.querySelector("[data-dialog-backdrop]")?.addEventListener("click", dismiss);
    coordinator.push(entry);
    return closeDialog;
  }

  _showAlertDialog(alerts, dialogTitle = getTranslation(this._hass, "active_alerts"), accentColor = "#FF5252") {
    const previouslyFocused = deepActiveElement();
    const container = document.createElement("div");
    container.className = "alert-dialog-container";

    const backdrop = document.createElement("div");
    backdrop.className = "alert-dialog-backdrop";
    backdrop.dataset.dialogBackdrop = "";
    backdrop.setAttribute("aria-hidden", "true");

    const panel = document.createElement("div");
    panel.className = "alert-dialog";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "alert-dialog-title");

    const header = document.createElement("div");
    header.className = "alert-dialog-header";
    const heading = document.createElement("h2");
    heading.id = "alert-dialog-title";
    heading.textContent = dialogTitle;
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "alert-dialog-close";
    closeButton.setAttribute("aria-label", getTranslation(this._hass, "a11y_close"));
    closeButton.textContent = "✕";
    header.append(heading, closeButton);

    const content = document.createElement("div");
    content.className = "alert-dialog-content";
    const list = document.createElement("div");
    list.className = "alert-entity-list";
    alerts.forEach((alert) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "alert-entity-row";
      row.dataset.entity = alert.entity_id;
      row.setAttribute("aria-label", `${alert.friendly_name}: ${alert.state}`);
      const icon = document.createElement("ha-icon");
      icon.setAttribute("icon", alert.icon);
      icon.style.cssText = `color:${accentColor}!important;--mdc-icon-size:24px`;
      const name = document.createElement("span");
      name.className = "alert-entity-name";
      name.textContent = alert.friendly_name;
      const state = document.createElement("span");
      state.className = "alert-entity-state";
      state.textContent = alert.state;
      row.append(icon, name, state);
      list.appendChild(row);
    });
    content.appendChild(list);
    panel.append(header, content);
    container.append(backdrop, panel);

    const style = document.createElement("style");
    style.textContent = `
      .alert-dialog-container { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; }
      .alert-dialog-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); cursor: pointer; }
      .alert-dialog { position: relative; z-index: 10001; background: var(--ha-card-background, white); border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); max-height: 80vh; width: 90%; max-width: 400px; display: flex; flex-direction: column; }
      .alert-dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.1); }
      .alert-dialog-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
      .alert-dialog-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--primary-text-color, #000); padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
      .alert-dialog-close:hover { background: rgba(0,0,0,0.05); border-radius: 4px; }
      .alert-dialog-content { flex: 1; overflow-y: auto; padding: 0; }
      .alert-entity-list { display: flex; flex-direction: column; }
      .alert-entity-row { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 0; border-bottom: 1px solid rgba(0,0,0,0.05); background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; transition: background-color 0.15s; }
      .alert-entity-row:last-child { border-bottom: none; }
      .alert-entity-row:hover { background-color: rgba(0,0,0,0.03); }
      .alert-dialog-close:focus-visible, .alert-entity-row:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: -2px; }
      .alert-entity-name { flex: 1; font-weight: 500; color: var(--primary-text-color); }
      .alert-entity-state { font-size: 12px; color: var(--secondary-text-color, #888); text-transform: capitalize; }
    `;
    container.appendChild(style);
    const closeDialog = this._openDialog(container, panel, closeButton, previouslyFocused);
    list.querySelectorAll(".alert-entity-row").forEach(row => {
      row.addEventListener("click", () => {
        const entityId = row.dataset.entity;
        if (entityId && this._hass) {
          if (this._detailDrawer) row.focus({ preventScroll: true });
          this._fireAction("tap", { entity: entityId, tap_action: { action: "more-info" } });
        }
        // Preserve status details underneath HA more-info when inside a drawer.
        if (!this._detailDrawer) closeDialog();
      });
    });
  }

  _renderStatusGroups(container, config, hass) {
    if (!container) return;
    (Array.isArray(config?.status_groups) ? config.status_groups : []).forEach((group, index) => {
      const result = getStatusGroupResult(group, hass);
      if (!result.visible) return;
      const interactive = group?.details === true && result.contributors.length > 0;
      const chip = document.createElement(interactive ? "button" : "div");
      if (interactive) chip.type = "button";
      chip.className = "chip status-group-chip";
      chip.dataset.statusGroup = String(index);
      const icon = document.createElement("ha-icon");
      icon.setAttribute("icon", result.error ? "mdi:alert-circle-outline" : (trimStr(group?.icon) || "mdi:information-outline"));
      icon.style.setProperty("--mdc-icon-size", "14px");
      const name = trimStr(group?.name) || getTranslation(hass, "status_groups");
      const text = group?.show_name === true ? `${name}: ${result.value}` : result.value;
      chip.append(icon, document.createTextNode(` ${text}`));
      chip.setAttribute("aria-label", result.error ? `${name}: ${getTranslation(hass, result.error)}` : `${name}: ${result.value}`);
      if (result.error) chip.title = getTranslation(hass, result.error);
      const color = trimStr(group?.color);
      if (color) {
        chip.style.color = color;
        chip.style.background = /^#[0-9a-f]{6}$/i.test(color) ? `${color}26` : `color-mix(in srgb, ${color} 15%, transparent)`;
      }
      if (interactive) {
        ["pointerdown", "pointerup", "pointercancel"].forEach((eventName) => chip.addEventListener(eventName, (event) => event.stopPropagation()));
        chip.addEventListener("click", (event) => {
          event.stopPropagation();
          this._showAlertDialog(result.contributors, name, "var(--primary-color, #03a9f4)");
        });
      }
      container.appendChild(chip);
    });
  }

  _getRenderMetaSignature(hass) {
    const lang = hass?.language || "";
    const localeLanguage = hass?.locale?.language || "";
    const numberFormat = hass?.locale?.number_format || "";
    const unitSystem = hass?.config?.unit_system || {};
    const unitSystemSignature = Object.keys(unitSystem)
      .sort()
      .map((key) => `${key}:${unitSystem[key] ?? ""}`)
      .join(",");
    return `${lang}|${localeLanguage}|${numberFormat}|${unitSystemSignature}`;
  }

  _buildStateSnapshot(hass) {
    const states = hass?.states || {};
    if (!this._cachedEntityIds) this._cachedEntityIds = this._getRelevantEntityIds();
    if (!this._templateDependencyEntityIds) {
      this._templateDependencyEntityIds = this._getTemplateDependencyEntityIds();
    }
    const next = new Map();
    this._cachedEntityIds.forEach((id) => next.set(
      id,
      this._getStateSignature(id, states[id], hass, this._templateDependencyEntityIds.has(id))
    ));
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
    if (this._hasAdaptiveEnvironmentCondition()) return true;
    const nextMetaSig = this._getRenderMetaSignature(hass);
    const nextStates = this._buildStateSnapshot(hass);
    return !this._isSameSnapshot(nextStates, nextMetaSig);
  }

  _captureStateSnapshot(hass) {
    if (!this.config || !hass) return;
    this._lastRenderMetaSig = this._getRenderMetaSignature(hass);
    this._lastStates = this._buildStateSnapshot(hass);
  }

  _syncCollapseUI() {
    const config = this.config || {};
    const isCollapsible = config.collapsible === true;
    const isCollapsed = isCollapsible && this._collapsed === true;
    const collapseLabel = getTranslation(this._hass, isCollapsed ? "a11y_expand" : "a11y_collapse");
    const collapseButton = this.shadowRoot.getElementById("collapse-btn");
    if (collapseButton) {
      collapseButton.style.display = isCollapsible ? "flex" : "none";
      collapseButton.classList.toggle("open", !isCollapsed);
      collapseButton.setAttribute("aria-label", collapseLabel);
      collapseButton.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
      collapseButton.tabIndex = isCollapsible ? 0 : -1;
    }

    if (this.controls) {
      this.controls.classList.toggle("collapsed", isCollapsed);
      if (isCollapsed) {
        this.controls.setAttribute("inert", "");
        this.controls.setAttribute("aria-hidden", "true");
      } else {
        this.controls.removeAttribute("inert");
        this.controls.removeAttribute("aria-hidden");
      }
    }

    const imageBox = this.shadowRoot.querySelector(".img-box");
    if (!imageBox) return;
    const hasExplicitTap = config.tap_action !== undefined;
    const headerTogglesCollapse = isCollapsible && !hasExplicitTap;
    const hasExplicitAction = [config.tap_action, config.hold_action, config.double_tap_action]
      .some((action) => action?.action && action.action !== "none");
    if (headerTogglesCollapse || hasExplicitAction) {
      imageBox.setAttribute("role", "button");
      imageBox.tabIndex = 0;
      imageBox.setAttribute("aria-label", headerTogglesCollapse
        ? collapseLabel
        : (config.name || getTranslation(this._hass, "a11y_activate").replace("{name}", "RoomCard")));
      if (headerTogglesCollapse) imageBox.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
      else imageBox.removeAttribute("aria-expanded");
    } else {
      imageBox.removeAttribute("role");
      imageBox.removeAttribute("tabindex");
      imageBox.removeAttribute("aria-label");
      imageBox.removeAttribute("aria-expanded");
    }
  }

  _applyHeaderImage(image, selection) {
    if (!image) return;
    const targetUrl = selection?.url || "/static/images/card_media/cover.png";
    image.style.objectPosition = selection?.position || "50% 50%";
    if (image.dataset.roomImageUrl === targetUrl) {
      this._headerImageRequests.set(image, null);
      return;
    }
    const request = {};
    this._headerImageRequests.set(image, request);
    const commit = () => {
      if (request !== this._headerImageRequests.get(image) || !image.isConnected) return;
      image.src = targetUrl;
      image.dataset.roomImageUrl = targetUrl;
    };
    if (!image.getAttribute("src") || typeof Image !== "function") {
      commit();
      return;
    }
    const preload = new Image();
    preload.onload = commit;
    preload.onerror = () => {};
    preload.src = targetUrl;
  }

  _updateContentState() {
    if (!this.config || !this._hass || !this.content) return;
    this._syncDetailDrawer();
    this._updateSurfaceState(this._cardSurface);
    if (this._detailDrawer?.surface) this._updateSurfaceState(this._detailDrawer.surface);
    this._configChanged = false;
    const shouldPoll = this._hasSparklineControls() && this._isSparklinePollingActive();
    if (shouldPoll !== !!this._sparklineInterval) this._setupSparklineInterval();
  }

  _updateSurfaceState(surface) {
    if (!this.config || !this._hass || !this.content) return;
    const h = this._hass, c = this.config;
    const effectiveEntity = c.entity;
    const effectiveTempSensor = c.temp_sensor;
    const effectiveHumidSensor = c.humid_sensor;
    const effectiveWindowSensors = c.window_sensors || [];
    const effectiveBatterySensors = c.battery_sensors || [];
    const systemTempUnit = normalizeTemperatureUnit(h.config.unit_system.temperature) || "°C";
    const configuredTempUnit = normalizeTemperatureUnit(c.temp_unit);

    const bgEl = surface.root.getElementById("bg");
    this._applyHeaderImage(bgEl, resolveAdaptiveRoomImage(c, h));
    if (c.image_entity && h.states[c.image_entity]) {
      const isOff = !isEntityActive(h.states[c.image_entity], c.image_entity);
      bgEl.classList.toggle("grayscale", isOff);
    } else {
      bgEl.classList.remove("grayscale");
    }
    const imgBox = surface.root.querySelector(".img-box");
    if (imgBox) {
      const hh = c.header_height !== undefined ? Number(c.header_height) : NaN;
      const hideImg = c.show_image === false;
      if (Number.isFinite(hh) && hh >= 0) imgBox.style.height = hh + "px";
      else if (hideImg) imgBox.style.height = "auto";
      else imgBox.style.height = "120px";
      imgBox.classList.toggle("no-image", hideImg);
    }
    const nameEl = surface.root.getElementById("name");
    nameEl.innerText = c.name || "Room";
    nameEl.style.display = c.show_name === false ? "none" : "";
    const ico = surface.root.getElementById("icon");
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

    const climateState = effectiveEntity ? h.states[effectiveEntity] : null;
    let t = null, hm = null, tar = null;
    let tempState = null, humidState = null, targetTempState = null;
    if (effectiveTempSensor && h.states[effectiveTempSensor]) {
      tempState = h.states[effectiveTempSensor];
      t = tempState.state;
    } else if (climateState?.attributes?.current_temperature !== undefined) {
      t = climateState.attributes.current_temperature;
    }

    if (climateState?.attributes?.temperature !== undefined) tar = climateState.attributes.temperature;
    if (c.target_temp_sensor && h.states[c.target_temp_sensor]) {
      targetTempState = h.states[c.target_temp_sensor];
      tar = targetTempState.state;
    }

    if (effectiveHumidSensor && h.states[effectiveHumidSensor]) {
      humidState = h.states[effectiveHumidSensor];
      hm = humidState.state;
    } else if (climateState?.attributes?.current_humidity !== undefined) {
      hm = climateState.attributes.current_humidity;
    }

    const infoPos = c.info_line_position || "header";
    const infoEl = surface.root.getElementById("info");
    const infoBarEl = surface.root.getElementById("info-bar");
    const infoParts = [];
    const standardHeaderBadgeBackground = trimStr(c.header_info_background);
    if (t != null && t !== "-" && !isNaN(parseFloat(t))) {
      let tStr = tempState
        ? formatTemperatureStateForDisplay(h, tempState, configuredTempUnit, systemTempUnit)
        : formatTemperatureAttributeForDisplay(h, climateState, "current_temperature", t, configuredTempUnit, systemTempUnit);
      const tempDisplayLabel = trimStr(c.temp_sensor_label);
      const targetTempDisplayLabel = trimStr(c.target_temp_sensor_label);
      if (tempDisplayLabel) tStr = `${tempDisplayLabel}: ${tStr}`;
      if (tar != null && tar !== "-") {
        const targetValue = targetTempState
          ? formatTemperatureStateForDisplay(h, targetTempState, configuredTempUnit, systemTempUnit)
          : formatTemperatureAttributeForDisplay(h, climateState, "temperature", tar, configuredTempUnit, systemTempUnit);
        const tarStr = targetTempDisplayLabel ? `${targetTempDisplayLabel}: ${targetValue}` : targetValue;
        tStr += " (" + tarStr + ")";
      }
      infoParts.push({ text: tStr, background: standardHeaderBadgeBackground });
    }
    if (hm != null && hm !== "-" && !isNaN(parseFloat(hm))) {
      const humidDisplayLabel = trimStr(c.humid_sensor_label);
      const humidValue = humidState
        ? formatEntityStateForDisplay(h, humidState, "%")
        : formatEntityAttributeForDisplay(h, climateState, "current_humidity", hm, "%");
      const hmStr = humidDisplayLabel ? `${humidDisplayLabel}: ${humidValue}` : humidValue;
      infoParts.push({ text: hmStr, background: standardHeaderBadgeBackground });
    }

    (Array.isArray(c.header_badges) ? c.header_badges : []).forEach(badge => {
      if (!badge?.entity) return;
      const st = h.states[badge.entity];
      if (!st) return;
      const val = st.state;
      if (val === "unavailable" || val === "unknown") return;
      const showBadgeName = badge.show_name !== false;
      const displayLabel = badge.label || st.attributes.friendly_name || badge.entity;
      const isLastChanged = badge.show_last_changed === true && st.last_changed;
      const displayVal = isLastChanged ? formatLastChanged(st.last_changed, h) : formatEntityStateForDisplay(h, st);
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

    const textEl = surface.root.querySelector(".text");
    const nameOffset = Number(c.header_name_offset ?? 0);
    const infoOffset = infoPos === "header" ? Number(c.header_info_offset ?? 0) : 0;
    if (textEl) textEl.style.flex = (nameOffset > 0 || infoOffset > 0) ? "1" : "";

    // Title horizontal offset
    this._applyHeaderOffset(nameEl, nameOffset, textEl);

    // Info line horizontal offset (only relevant when inside the header)
    if (infoPos === "header") this._applyHeaderOffset(infoEl, infoOffset, textEl);

    const ch = surface.root.getElementById("chips");
    ch.replaceChildren();
    const createHeaderChip = (className, iconName, text, tagName = "div") => {
      const chip = document.createElement(tagName);
      chip.className = className;
      const icon = document.createElement("ha-icon");
      icon.setAttribute("icon", String(iconName));
      icon.style.setProperty("--mdc-icon-size", "14px");
      chip.append(icon, document.createTextNode(` ${text}`));
      return chip;
    };
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
    if (batteryWarn) ch.appendChild(createHeaderChip("chip alert", "mdi:battery-alert", al));

    const humidNum = hm != null ? parseFloat(hm) : NaN;
    const thresholdRaw = c.humidity_warning_threshold ?? 60;
    const humidThreshold = Number.isFinite(Number(thresholdRaw)) ? Number(thresholdRaw) : 60;
    const humidityWarn = Number.isFinite(humidNum) && humidNum > humidThreshold;
    if (humidityWarn) {
      const txt = getTranslation(h, "high_humidity");
      ch.appendChild(createHeaderChip("chip humidity", "mdi:water-alert", txt));
    }
    if (c.presence_sensor && h.states[c.presence_sensor]) {
      const pState = h.states[c.presence_sensor];
      const isActive = ["on", "home", "active", "detected"].includes(String(pState.state).toLowerCase().trim());
      if (isActive) {
        const pLabel = trimStr(c.presence_sensor_label) || pState.attributes?.friendly_name || getTranslation(h, "presence_detected");
        const isPerson = String(pState.entity_id).startsWith("person.");
        const pIcon = pState.attributes?.icon || (isPerson ? "mdi:account" : "mdi:motion-sensor");
        const presenceColor = trimStr(c.presence_chip_color) || "#4CAF50";
        const solidPresenceBackground = c.presence_solid_background === true;
        const isHex = /^#[0-9A-F]{6}$/i.test(presenceColor);
        const presenceBackground = solidPresenceBackground
          ? presenceColor
          : (isHex ? hexToRgba(presenceColor, 0.15) : `color-mix(in srgb, ${presenceColor} 15%, transparent)`);
        const presenceTextColor = solidPresenceBackground
          ? (readableTextForHex(presenceColor) || "var(--primary-text-color)")
          : presenceColor;
        const chip = document.createElement("div");
        chip.className = "chip";
        chip.style.background = presenceBackground;
        chip.style.color = presenceTextColor;
        const chipIcon = document.createElement("ha-icon");
        chipIcon.icon = pIcon;
        chipIcon.style.setProperty("--mdc-icon-size", "14px");
        chip.appendChild(chipIcon);
        chip.appendChild(document.createTextNode(` ${pLabel}`));
        ch.appendChild(chip);
      }
    }
    const effectiveAlertSensors = Array.isArray(c.alert_sensors) ? c.alert_sensors : [];
    const normalizedAlertSensors = effectiveAlertSensors
      .map(s => this._normalizeAlertSensorConfig(s))
      .filter(Boolean);
    let alertSensorWarn = false;
    const activeAlerts = [];
    normalizedAlertSensors.forEach(cfg => {
      const st = h.states[cfg.entity];
      if (!st) return;
      if (this._isAlertSensorActive(cfg, st)) {
        alertSensorWarn = true;
        activeAlerts.push({
          entity_id: cfg.entity,
          friendly_name: st.attributes?.friendly_name || cfg.entity,
          icon: st.attributes?.icon || "mdi:alert-circle-outline",
          state: st.state
        });
      }
    });
    const alertChipMode = c.alert_chip_mode || "expanded";
    if (alertChipMode === "collapsed" && activeAlerts.length > 0) {
      const chip = createHeaderChip("chip alert", "mdi:alert", activeAlerts.length, "button");
      chip.type = "button";
      chip.setAttribute("aria-label", `${getTranslation(h, "active_alerts")}: ${activeAlerts.length}`);
      chip.style.cursor = "pointer";
      chip.addEventListener("click", () => this._showAlertDialog(activeAlerts));
      ch.appendChild(chip);
    } else if (alertChipMode === "expanded" && activeAlerts.length > 0) {
      activeAlerts.forEach(alert => {
        ch.appendChild(createHeaderChip("chip alert", alert.icon, alert.friendly_name));
      });
    }

    const windowAlwaysShow = c.window_always_show === true;
    const windowOpenColor = trimStr(c.window_open_color) || "#FFA000";
    const windowClosedColor = trimStr(c.window_closed_color) || "#9E9E9E";
    // Configurable open states — "on" is always included for backward compatibility
    const windowOpenStates = Array.isArray(c.window_open_states) && c.window_open_states.length > 0
      ? [...new Set(["on", ...c.window_open_states.map(s => String(s).toLowerCase().trim())])]
      : ["on", "open"];
    // Optional per-state color overrides (object: { stateName: "#color" })
    const windowStateColors = (c.window_state_colors && typeof c.window_state_colors === "object") ? c.window_state_colors : {};
    const windowLabels = (c.window_labels && typeof c.window_labels === "object") ? c.window_labels : {};
    const windowSolidBackground = c.window_solid_background === true;
    (Array.isArray(effectiveWindowSensors) ? effectiveWindowSensors : []).forEach(s => {
      const st = h.states[s];
      if (!st) return;
      const stateVal = String(st.state).toLowerCase().trim();
      const isOpen = windowOpenStates.includes(stateVal);
      if (!isOpen && !windowAlwaysShow) return;
      // Per-state color override takes priority, then open/closed default
      const perStateColor = windowStateColors[st.state] || windowStateColors[stateVal];
      const chipColor = perStateColor || (isOpen ? windowOpenColor : windowClosedColor);
      const isHex = /^#[0-9A-F]{6}$/i.test(chipColor);
      const chipBg = windowSolidBackground
        ? chipColor
        : (isHex ? chipColor + "33" : `color-mix(in srgb, ${chipColor} 20%, transparent)`);
      const chipTextColor = windowSolidBackground
        ? (readableTextForHex(chipColor) || "var(--primary-text-color)")
        : chipColor;
      const icon = isOpen ? "mdi:window-open-variant" : "mdi:window-shutter";
      const label = trimStr(windowLabels[s]) || st.attributes.friendly_name || getTranslation(h, "window");
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.style.background = chipBg;
      chip.style.color = chipTextColor;
      const chipIcon = document.createElement("ha-icon");
      chipIcon.icon = icon;
      chipIcon.style.setProperty("--mdc-icon-size", "14px");
      chip.appendChild(chipIcon);
      chip.appendChild(document.createTextNode(` ${label}`));
      ch.appendChild(chip);
    });

    this._renderStatusGroups(ch, c, h);

    const cardEl = surface.root.querySelector("ha-card");
    if (cardEl) {
      const showStatusBorder = c.show_status_border !== false;
      cardEl.classList.toggle("no-header-text-shadow", c.show_header_text_shadow === false);
      cardEl.classList.toggle("no-chip-shadow", c.show_chip_shadow === false);
      cardEl.classList.toggle("warning-battery", showStatusBorder && batteryWarn);
      cardEl.classList.toggle("warning-humidity", showStatusBorder && !batteryWarn && humidityWarn);
      cardEl.classList.toggle("alert-sensor", showStatusBorder && !batteryWarn && !humidityWarn && alertSensorWarn);
      if (trimStr(c.alert_border_color)) cardEl.style.setProperty("--rc-alert-border-color", trimStr(c.alert_border_color));
      else cardEl.style.removeProperty("--rc-alert-border-color");

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

    this._renderRoomModes(c, h, surface.root);
    if (surface.kind === "card") this._syncCollapseUI();

    let visibleCtrls = (c.controls || []).filter(ctrl => {
      if (!isControlInContext(ctrl, c, surface.kind)) return false;
      if (ctrl.hide) return false;
      if (Array.isArray(ctrl.visibility) && ctrl.visibility.length > 0) {
        if (!this._checkConditions(ctrl.visibility, h)) return false;
      }
      return (ctrl.entity || ctrl.type === "template");
    });

    if (surface.kind === "card" && c.auto_climate_button && c.entity && getEntityDomain(c.entity) === "climate") {
      const alreadyPresent = visibleCtrls.some(ctrl => ctrl.entity === c.entity);
      if (!alreadyPresent) {
        const climateState = h.states[c.entity];
        visibleCtrls = [{ entity: c.entity, name: climateState?.attributes?.friendly_name || "", width: 60, height: 60 }, ...visibleCtrls];
      }
    }

    const controlsSig = JSON.stringify(visibleCtrls);

    if (this._configChanged || surface.signature !== controlsSig) {
      surface.signature = controlsSig;
      for (const node of surface.controls.children) node._disposeActions?.();
      surface.controls.replaceChildren();
      visibleCtrls.forEach(ctrl => {
        const btn = this._createBtn(ctrl);
        surface.controls.appendChild(btn);
        this._updateBtnState(btn, ctrl, h);
      });
    } else {
      visibleCtrls.forEach((ctrl, i) => {
        const btn = surface.controls.children[i];
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

  _renderRoomModes(config, hass, root = this.shadowRoot) {
    const container = root.getElementById("room-modes");
    if (!container) return;
    const modes = (Array.isArray(config?.room_modes) ? config.room_modes : [])
      .filter((mode) => ["scene", "script"].includes(getEntityDomain(mode?.entity)));
    const signature = JSON.stringify(modes.map((mode) => ({
      entity: mode.entity,
      name: mode.name || "",
      icon: mode.icon || "",
      color: mode.color || "",
      active_when: mode.active_when || null
    })));
    if (container.dataset.configSignature !== signature) {
      const active = deepActiveElement();
      const focusedEntity = container.contains(active) ? active?.closest?.(".room-mode")?.dataset?.entity : null;
      const buttons = modes.map((mode) => {
        const domain = getEntityDomain(mode.entity);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "room-mode";
        button.dataset.entity = mode.entity;
        button.dataset.domain = domain;
        ["pointerdown", "pointerup", "pointercancel"].forEach((eventName) => {
          button.addEventListener(eventName, (event) => event.stopPropagation());
        });
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (button.disabled || !["scene", "script"].includes(domain)) return;
          this._hass?.callService(domain, "turn_on", { entity_id: mode.entity });
        });
        const icon = document.createElement("ha-icon");
        icon.setAttribute("icon", mode.icon || (domain === "scene" ? "mdi:palette-outline" : "mdi:play-circle-outline"));
        const label = document.createElement("span");
        label.textContent = mode.name || hass.states?.[mode.entity]?.attributes?.friendly_name || mode.entity;
        button.append(icon, label);
        return button;
      });
      container.replaceChildren(...buttons);
      container.dataset.configSignature = signature;
      if (focusedEntity) Array.from(container.querySelectorAll(".room-mode")).find((button) => button.dataset.entity === focusedEntity)?.focus();
    }
    modes.forEach((mode, index) => {
      const button = container.children[index];
      if (!button) return;
      const stateObj = hass.states?.[mode.entity];
      const disabled = !stateObj || isEntityOffline(stateObj);
      button.disabled = disabled;
      const label = mode.name || stateObj?.attributes?.friendly_name || mode.entity;
      const labelNode = button.querySelector("span");
      if (labelNode) labelNode.textContent = label;
      button.setAttribute("aria-label", getTranslation(hass, "a11y_activate").replace("{name}", label));
      const condition = evaluateRoomModeActiveWhen(mode.active_when, hass);
      button.classList.toggle("active", condition.valid && condition.active);
      if (condition.valid) button.setAttribute("aria-pressed", condition.active ? "true" : "false");
      else button.removeAttribute("aria-pressed");
      const color = trimStr(mode.color);
      if (color) button.style.setProperty("--room-mode-color", color);
      else button.style.removeProperty("--room-mode-color");
    });
  }

  _checkConditions(conditions, h) {
    if (!Array.isArray(conditions) || conditions.length === 0) return true;
    return conditions.every(c => this._checkCondition(c, h));
  }

  _checkCondition(c, h) {
    return evaluateVisibilityCondition(c, h, (query) => window.matchMedia(query), (condition) => this._checkCondition(condition, h));
  }

  _getSliderCapabilities(domain, st, ctrl) {
    return getSliderCapabilities(domain, st, ctrl, !st || this._isEntityUnavailable(ctrl.entity));
  }

  _getInlineButtons(domain) {
    return getInlineButtons(domain);
  }

  _supportsMediaFeature(stateObj, feature) {
    return supportsMediaFeature(stateObj, feature);
  }

  _updateBtnState(btn, ctrl, h) {
    const systemTempUnit = normalizeTemperatureUnit(h.config.unit_system.temperature) || "°C";
    const configuredTempUnit = normalizeTemperatureUnit(this.config?.temp_unit);
    const st = ctrl.entity ? h.states[ctrl.entity] : null;
    const s = st ? st.state : "N/A";
    const domain = ctrl.entity ? ctrl.entity.split(".")[0] : "";
    const isTemplate = ctrl.type === "template";
    const subChipPresentations = resolveSubChipPresentations(ctrl, h);
    const activeElement = deepActiveElement();
    const focusedControlKey = activeElement && btn.contains(activeElement)
      ? activeElement.dataset?.rcFocusKey || ""
      : "";

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
      const templateOutputSig = JSON.stringify({ template: tpl, subChips: subChipPresentations });
      if (!this._configChanged && btn.dataset.templateOutputSig === templateOutputSig) return;
      btn.dataset.templateOutputSig = templateOutputSig;
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

    // --- NEW: USE DYNAMIC UNIT IN TEMPLATE ---
    const climateHasSlider = typ === "climate" && (ctrl.control_mode === "slider" || ctrl.control_mode === "full");
    const mediaTitleText = (() => {
      if (domain !== "media_player" || !st) return "";
      const title = trimStr(st.attributes?.media_title);
      const artist = trimStr(st.attributes?.media_artist);
      const album = trimStr(st.attributes?.media_album_name);
      if (title && artist) return `${title} · ${artist}`;
      if (title && album) return `${title} · ${album}`;
      return title || artist || album || "";
    })();
    const stateText = isTemplate
      ? (tpl?.state || "")
      : (mediaTitleText || (typ === "climate"
        ? (() => {
          const cur = st?.attributes?.current_temperature;
          const tar = st?.attributes?.temperature;
          const curDisplay = cur != null
            ? formatTemperatureAttributeForDisplay(h, st, "current_temperature", cur, configuredTempUnit, systemTempUnit)
            : "";
          const tarDisplay = tar != null
            ? formatTemperatureAttributeForDisplay(h, st, "temperature", tar, configuredTempUnit, systemTempUnit)
            : "";
          if (climateHasSlider && cur != null && tar != null) return `${curDisplay} → ${tarDisplay}`;
          if (climateHasSlider && tar != null) return tarDisplay;
          if (cur != null) return curDisplay;
          return s;
        })()
        : typ === "shutter" && st?.attributes?.current_position != null
          ? `${100 - Math.round(st.attributes.current_position)}% closed`
        : typ === "light" && s === "on" && ctrl.show_brightness_value !== false && st?.attributes?.brightness != null
          ? `${s} · ${Math.round((st.attributes.brightness / 255) * 100)} %`
          : domain === "sensor" && st
            ? formatEntityStateForDisplay(h, st)
            : s));
    const showState = isTemplate ? ctrl.show_state === true : ctrl.show_state !== false;
    const showLabel = ctrl.show_label !== false;
    const showLastChanged = ctrl.show_last_changed === true && !isTemplate && !!st?.last_changed;
    const elapsedText = showLastChanged ? formatLastChanged(st.last_changed, h) : "";
    const showIcon = ctrl.show_icon !== false;
    const stateFirst = ctrl.state_first === true;

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
    const chipsPos = ctrl.chips_position === "top" ? "top" : "bottom";
    let chipsEl = null;
    if (subChipPresentations.length > 0) {
      chipsEl = document.createElement("div");
      chipsEl.className = `btn-chips${chipsPos === "top" ? " chips-top" : ""}`;
      for (const chip of subChipPresentations) {
        const chipEl = document.createElement("div");
        chipEl.className = "btn-chip";
        if (chip.icon) {
          const chipIcon = document.createElement("ha-icon");
          chipIcon.setAttribute("icon", String(chip.icon));
          chipEl.appendChild(chipIcon);
        }
        if (chip.label) {
          const chipText = document.createElement("span");
          chipText.style.marginLeft = chip.icon ? "4px" : "0";
          chipText.textContent = chip.label;
          chipEl.appendChild(chipText);
        }
        chipsEl.appendChild(chipEl);
      }
      if (chipsEl.childElementCount === 0) chipsEl = null;
    }

    btn.replaceChildren();
    if (showIcon) {
      const iconBox = document.createElement("div");
      iconBox.className = "icon-box";
      const icon = document.createElement("ha-icon");
      icon.setAttribute("icon", String(resolvedIcon));
      icon.style.setProperty("--mdc-icon-size", iconSizePx);
      iconBox.appendChild(icon);
      btn.appendChild(iconBox);
    }
    const textEl = document.createElement("div");
    textEl.className = "btn-txt";
    if (chipsPos === "top" && chipsEl) textEl.appendChild(chipsEl);
    const labelEl = showLabel ? document.createElement("span") : null;
    if (labelEl) {
      labelEl.className = "btn-name";
      // Explicit compatibility boundary: only trusted template configuration may opt in to HTML.
      if (isTemplate && ctrl.trusted_html === true) labelEl.innerHTML = String(nameTxt);
      else labelEl.textContent = String(nameTxt);
    }
    const stateEl = (showState || showLastChanged) ? document.createElement("span") : null;
    if (stateEl) {
      stateEl.className = "btn-state";
      stateEl.textContent = showState && showLastChanged
        ? `${stateText} · ${elapsedText}`
        : (showState ? String(stateText) : elapsedText);
    }
    if (stateFirst) {
      if (stateEl) textEl.appendChild(stateEl);
      if (labelEl) textEl.appendChild(labelEl);
    } else {
      if (labelEl) textEl.appendChild(labelEl);
      if (stateEl) textEl.appendChild(stateEl);
    }
    if (chipsPos === "bottom" && chipsEl) textEl.appendChild(chipsEl);
    btn.appendChild(textEl);
    if (isUnavail) {
      const warning = document.createElement("ha-icon");
      warning.className = "warn warn-offline";
      warning.setAttribute("icon", "mdi:lan-disconnect");
      warning.title = unavailableText;
      btn.appendChild(warning);
    }

    btn.classList.toggle("state-unavailable", isUnavail);
    if (!isTemplate) {
      btn.style.cursor = isUnavail ? "default" : "pointer";
      btn.setAttribute("role", "button");
      btn.tabIndex = isUnavail ? -1 : 0;
      btn.setAttribute("aria-label", [nameTxt, showState ? stateText : ""].filter(Boolean).join(", "));
      btn.setAttribute("aria-disabled", isUnavail ? "true" : "false");
    } else {
      btn.removeAttribute("role");
      btn.removeAttribute("tabindex");
      btn.removeAttribute("aria-label");
      btn.removeAttribute("aria-disabled");
    }
    if (isUnavail) btn.title = unavailableText;
    else btn.removeAttribute("title");

    // Apply dynamic colors via CSS custom properties
    btn.style.setProperty("--icon-color", col);
    btn.style.setProperty("--btn-bg", bg);

    this._renderBtnSparkline(btn, ctrl, col);

    // Inline controls
    const controlMode = ctrl.control_mode;
    const sliderCaps = this._getSliderCapabilities(domain, st, ctrl);
    const inlineBtns = this._getInlineButtons(domain);
    const isFullControl = controlMode === "full";
    const isSelectDomain = domain === "select" || domain === "input_select";
    const isBgSlider = controlMode === "slider" && ctrl.slider_style === "background" && !isUnavail && sliderCaps.supported && !isSelectDomain;
    const isInlineSlider = ((controlMode === "slider" && ctrl.slider_style !== "background") || isFullControl) && !isUnavail && sliderCaps.supported && !isSelectDomain;
    const hasInlineBtns = (controlMode === "buttons" || (isFullControl && !isSelectDomain)) && !isUnavail && inlineBtns.length > 0;
    const hasCoverPresets = ctrl.show_cover_presets === true && domain === "cover" && !isUnavail;
    const hasClimatePresets = ctrl.show_climate_presets === true && domain === "climate" && !isUnavail;
    const hasBrightnessPresets = ctrl.show_brightness_presets === true && domain === "light" && !isUnavail;
    const hasColorFavorites = ctrl.show_color_favorites === true && domain === "light" && !isUnavail;
    const hasSelectOptions = isSelectDomain && !isUnavail && Array.isArray(st?.attributes?.options) && st.attributes.options.length > 0;
    const isMediaFull = domain === "media_player" && !isUnavail && (controlMode === "full" || !controlMode || controlMode === "default");

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

    if (isInlineSlider || hasInlineBtns || hasCoverPresets || hasClimatePresets || hasBrightnessPresets || hasColorFavorites || hasSelectOptions || isMediaFull) {
      btn.classList.add("has-inline-ctrl");
      const topDiv = document.createElement("div");
      topDiv.className = "btn-top";
      while (btn.firstChild) {
        if (btn.firstChild.className === "bg-slider-fill") break; // Keep background behind topDiv if they somehow co-exist
        topDiv.appendChild(btn.firstChild);
      }
      btn.appendChild(topDiv);

      if (isMediaFull) {
        // Layout: [Thumbnail] [Name + Title + Controls]
        const thumbUrl = st?.attributes?.entity_picture;
        // Remove the icon-box from topDiv (we use thumbnail or keep icon as fallback)
        const iconBox = topDiv.querySelector(".icon-box");

        const layout = document.createElement("div");
        layout.className = "media-full-layout";

        if (thumbUrl) {
          const img = document.createElement("img");
          img.className = "media-thumb";
          img.src = thumbUrl;
          img.alt = "";
          layout.appendChild(img);
          if (iconBox) iconBox.remove();
        } else if (iconBox) {
          iconBox.remove();
        }

        // Right side: text + control bar
        const rightDiv = document.createElement("div");
        rightDiv.className = "media-right";
        // Move text content from topDiv into rightDiv
        const txtDiv = topDiv.querySelector(".btn-txt");
        if (txtDiv) rightDiv.appendChild(txtDiv);

        const createMediaButton = (className, icon, label, service) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = className;
          button.dataset.rcFocusKey = service;
          button.setAttribute("aria-label", label);
          const buttonIcon = document.createElement("ha-icon");
          buttonIcon.setAttribute("icon", icon);
          button.appendChild(buttonIcon);
          button.addEventListener("pointerdown", e => e.stopPropagation());
          button.addEventListener("click", e => {
            e.stopPropagation();
            if (!this._isEntityUnavailable(ctrl.entity)) {
              this._hass.callService("media_player", service, { entity_id: ctrl.entity });
            }
          });
          return button;
        };

        // Transport row: [Previous] [Play/Pause] [Next]
        const transportRow = document.createElement("div");
        transportRow.className = "media-transport-row";
        if (this._supportsMediaFeature(st, MEDIA_PLAYER_FEATURES.PREVIOUS_TRACK)) {
          transportRow.appendChild(createMediaButton("media-ctrl-btn media-previous", "mdi:skip-previous", getTranslation(h, "a11y_previous_track"), "media_previous_track"));
        }
        if (this._supportsMediaFeature(st, MEDIA_PLAYER_FEATURES.PLAY) || this._supportsMediaFeature(st, MEDIA_PLAYER_FEATURES.PAUSE)) {
          transportRow.appendChild(createMediaButton("media-ctrl-btn media-play-pause", "mdi:play-pause", getTranslation(h, "a11y_play_pause"), "media_play_pause"));
        }
        if (this._supportsMediaFeature(st, MEDIA_PLAYER_FEATURES.NEXT_TRACK)) {
          transportRow.appendChild(createMediaButton("media-ctrl-btn media-next", "mdi:skip-next", getTranslation(h, "a11y_next_track"), "media_next_track"));
        }
        if (transportRow.childElementCount > 0) rightDiv.appendChild(transportRow);

        // Volume row: [Mute] [---Slider---] [Percentage]
        const volumeRow = document.createElement("div");
        volumeRow.className = "media-volume-row";
        let currentMuted = st?.attributes?.is_volume_muted === true;
        const muteBtn = document.createElement("button");
        muteBtn.type = "button";
        muteBtn.className = `media-ctrl-btn${currentMuted ? " muted" : ""}`;
        muteBtn.dataset.rcFocusKey = "volume_mute";
        muteBtn.setAttribute("aria-label", getTranslation(h, "a11y_mute"));
        muteBtn.setAttribute("aria-pressed", currentMuted ? "true" : "false");
        const muteIcon = document.createElement("ha-icon");
        muteIcon.setAttribute("icon", currentMuted ? "mdi:volume-off" : "mdi:volume-high");
        muteBtn.appendChild(muteIcon);
        muteBtn.addEventListener("pointerdown", e => e.stopPropagation());
        muteBtn.addEventListener("click", e => {
          e.stopPropagation();
          if (!this._isEntityUnavailable(ctrl.entity)) {
            const newMuted = !currentMuted;
            currentMuted = newMuted;
            this._hass.callService("media_player", "volume_mute", { entity_id: ctrl.entity, is_volume_muted: newMuted });
            if (!newMuted) {
              // Also restore volume explicitly for players that don't handle unmute well
              const vol = st?.attributes?.volume_level ?? sliderCaps.value / 100;
              this._hass.callService("media_player", "volume_set", { entity_id: ctrl.entity, volume_level: vol });
            }
            // Immediate visual feedback
            muteBtn.querySelector("ha-icon").setAttribute("icon", newMuted ? "mdi:volume-off" : "mdi:volume-high");
            muteBtn.classList.toggle("muted", newMuted);
            muteBtn.setAttribute("aria-pressed", newMuted ? "true" : "false");
            if (newMuted) {
              slider.style.setProperty("--slider-pct", "0%");
              volLabel.textContent = "0%";
            } else {
              const vol = sliderCaps.value;
              const pct = ((vol - sliderCaps.min) / (sliderCaps.max - sliderCaps.min)) * 100;
              slider.value = vol;
              slider.style.setProperty("--slider-pct", `${pct}%`);
              volLabel.textContent = `${Math.round(vol)}%`;
            }
          }
        });
        if (this._supportsMediaFeature(st, MEDIA_PLAYER_FEATURES.VOLUME_MUTE)) volumeRow.appendChild(muteBtn);
        // Volume slider
        const wrap = document.createElement("div");
        wrap.className = "btn-slider-wrap";
        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "btn-slider";
        slider.dataset.rcFocusKey = "volume_level";
        slider.min = sliderCaps.min; slider.max = sliderCaps.max; slider.step = sliderCaps.step; slider.value = sliderCaps.value;
        slider.setAttribute("aria-label", getTranslation(h, "a11y_volume"));
        slider.setAttribute("aria-valuetext", `${Math.round(sliderCaps.value)}%`);
        slider.style.setProperty("--slider-pct", `${sliderCaps.pct}%`);
        const volLabel = document.createElement("span");
        volLabel.className = "vol-label";
        volLabel.textContent = `${Math.round(sliderCaps.value)}%`;
        slider.addEventListener("pointerdown", e => e.stopPropagation());
        slider.addEventListener("click", e => e.stopPropagation());
        slider.addEventListener("input", e => {
          const v = +e.target.value;
          const pct = ((v - sliderCaps.min) / (sliderCaps.max - sliderCaps.min)) * 100;
          e.target.style.setProperty("--slider-pct", `${pct}%`);
          e.target.setAttribute("aria-valuetext", `${Math.round(v)}%`);
          volLabel.textContent = `${Math.round(v)}%`;
        });
        slider.addEventListener("change", e => {
          const v = +e.target.value;
          this._hass.callService("media_player", "volume_set", { entity_id: ctrl.entity, volume_level: v / 100 });
        });
        wrap.appendChild(slider);
        if (sliderCaps.supported && this._supportsMediaFeature(st, MEDIA_PLAYER_FEATURES.VOLUME_SET)) {
          volumeRow.appendChild(wrap);
          volumeRow.appendChild(volLabel);
        }
        if (volumeRow.childElementCount > 0) rightDiv.appendChild(volumeRow);
        layout.appendChild(rightDiv);
        // Replace topDiv content with the full layout
        topDiv.replaceChildren();
        topDiv.appendChild(layout);
      } else if (isInlineSlider) {
        const wrap = document.createElement("div");
        wrap.className = "btn-slider-wrap";
        const slider = document.createElement("input");
        slider.type = "range";
        slider.className = "btn-slider";
        slider.min = sliderCaps.min; slider.max = sliderCaps.max; slider.step = sliderCaps.step; slider.value = sliderCaps.value;
        slider.setAttribute("aria-label", getTranslation(h, "a11y_set_value").replace("{name}", nameTxt));
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
              const curDisplay = cur != null
                ? formatTemperatureAttributeForDisplay(h, st, "current_temperature", cur, configuredTempUnit, systemTempUnit)
                : "";
              const targetDisplay = formatTemperatureAttributeForDisplay(h, st, "temperature", v, configuredTempUnit, systemTempUnit);
              stateEl.textContent = cur != null ? `${curDisplay} → ${targetDisplay}` : targetDisplay;
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
          } else if (sliderCaps.action === "brightness" && ctrl.show_brightness_value !== false) {
            const stateEl = topDiv.querySelector(".btn-state");
            if (stateEl) stateEl.textContent = `${s} · ${Math.round(v)} %`;
          } else if (sliderCaps.action === "position") {
            const stateEl = topDiv.querySelector(".btn-state");
            if (stateEl) stateEl.textContent = `${100 - Math.round(v)}% closed`;
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

      if (hasInlineBtns && !isMediaFull) {
        const actDiv = document.createElement("div");
        actDiv.className = "btn-cover-actions";
        inlineBtns.forEach(({ icon, action, service, custom }) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "cover-action-btn";
          b.setAttribute("aria-label", (service || custom || action).replaceAll("_", " ").replace(".", " "));
          const actionIcon = document.createElement("ha-icon");
          actionIcon.setAttribute("icon", icon);
          b.appendChild(actionIcon);
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
              else if (custom === "select_prev" || custom === "select_next") {
                const options = Array.isArray(st?.attributes?.options) ? st.attributes.options : [];
                if (options.length > 0) {
                  const currentIdx = options.indexOf(st?.state);
                  const fallbackIdx = custom === "select_prev" ? options.length - 1 : 0;
                  const delta = custom === "select_prev" ? -1 : 1;
                  const nextIdx = currentIdx >= 0 ? (currentIdx + delta + options.length) % options.length : fallbackIdx;
                  this._hass.callService(domain, "select_option", { entity_id: ctrl.entity, option: options[nextIdx] });
                }
              }
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
          const pb = document.createElement("button");
          pb.type = "button";
          pb.className = "preset-btn";
          pb.textContent = `${pos}%`;
          pb.setAttribute("aria-label", `${getTranslation(h, "a11y_set_value").replace("{name}", nameTxt)}: ${pos}%`);
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
          const pb = document.createElement("button");
          pb.type = "button";
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
            label = formatTemperatureAttributeForDisplay(h, st, "temperature", val, configuredTempUnit, systemTempUnit);
            isActive = Math.abs(currentTarget - val) < 0.5;
          }
          pb.textContent = label;
          pb.setAttribute("aria-label", `${getTranslation(h, "a11y_set_value").replace("{name}", nameTxt)}: ${label}`);
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

      // Climate HVAC mode chips
      if (domain === "climate" && ctrl.show_hvac_modes === true) {
        const modes = Array.isArray(st?.attributes?.hvac_modes) ? st.attributes.hvac_modes : [];
        if (modes.length > 0) {
          const current = String(st?.state || "").toLowerCase();
          const div = document.createElement("div");
          div.className = "btn-cover-presets";
          const iconForMode = {
            off: "mdi:power", auto: "mdi:thermostat-auto", heat: "mdi:fire", cool: "mdi:snowflake",
            heat_cool: "mdi:sun-snowflake", dry: "mdi:water-percent", fan_only: "mdi:fan"
          };
          modes.forEach(mode => {
            const pb = document.createElement("button");
            pb.type = "button";
            pb.className = "preset-btn";
            const ic = iconForMode[String(mode).toLowerCase()];
            if (ic) {
              const icon = document.createElement("ha-icon");
              icon.setAttribute("icon", ic);
              icon.style.setProperty("--mdc-icon-size", "14px");
              pb.append(icon, document.createTextNode(` ${mode}`));
            } else {
              pb.textContent = String(mode);
            }
            pb.setAttribute("aria-label", `${getTranslation(h, "a11y_select_option").replace("{name}", nameTxt)}: ${mode}`);
            if (String(mode).toLowerCase() === current) pb.classList.add("active");
            pb.addEventListener("pointerdown", e => e.stopPropagation());
            pb.addEventListener("click", e => {
              e.stopPropagation();
              if (!this._isEntityUnavailable(ctrl.entity)) {
                this._hass.callService("climate", "set_hvac_mode", { entity_id: ctrl.entity, hvac_mode: mode });
              }
            });
            div.appendChild(pb);
          });
          btn.appendChild(div);
        }
      }

      // Climate fan mode chips
      if (domain === "climate" && ctrl.show_fan_modes === true) {
        const modes = Array.isArray(st?.attributes?.fan_modes) ? st.attributes.fan_modes : [];
        if (modes.length > 0) {
          const current = String(st?.attributes?.fan_mode || "").toLowerCase();
          const div = document.createElement("div");
          div.className = "btn-cover-presets";
          modes.forEach(mode => {
            const pb = document.createElement("button");
            pb.type = "button";
            pb.className = "preset-btn";
            const icon = document.createElement("ha-icon");
            icon.setAttribute("icon", "mdi:fan");
            icon.style.setProperty("--mdc-icon-size", "14px");
            pb.append(icon, document.createTextNode(` ${mode}`));
            pb.setAttribute("aria-label", `${getTranslation(h, "a11y_select_option").replace("{name}", nameTxt)}: ${mode}`);
            if (String(mode).toLowerCase() === current) pb.classList.add("active");
            pb.addEventListener("pointerdown", e => e.stopPropagation());
            pb.addEventListener("click", e => {
              e.stopPropagation();
              if (!this._isEntityUnavailable(ctrl.entity)) {
                this._hass.callService("climate", "set_fan_mode", { entity_id: ctrl.entity, fan_mode: mode });
              }
            });
            div.appendChild(pb);
          });
          btn.appendChild(div);
        }
      }

      // Light brightness presets
      if (domain === "light" && ctrl.show_brightness_presets === true) {
        const rawPresets = Array.isArray(ctrl.brightness_presets) ? ctrl.brightness_presets
          : typeof ctrl.brightness_presets === "string"
            ? ctrl.brightness_presets.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
            : [25, 50, 75, 100];
        const presets = [...new Set(rawPresets
          .map(v => Math.max(1, Math.min(100, Math.round(Number(v)))))
          .filter(v => Number.isFinite(v)))];
        const currentBrightness = st?.attributes?.brightness != null
          ? Math.round((st.attributes.brightness / 255) * 100)
          : 0;
        const presetsDiv = document.createElement("div");
        presetsDiv.className = "btn-cover-presets";
        presets.forEach(pct => {
          const pb = document.createElement("button");
          pb.type = "button";
          pb.className = "preset-btn";
          pb.textContent = `${pct}%`;
          pb.setAttribute("aria-label", `${getTranslation(h, "a11y_set_value").replace("{name}", nameTxt)}: ${pct}%`);
          const isActive = st?.state === "on" && Math.abs(currentBrightness - pct) < 2;
          if (isActive) pb.classList.add("active");
          pb.addEventListener("pointerdown", e => e.stopPropagation());
          pb.addEventListener("click", e => {
            e.stopPropagation();
            if (!this._isEntityUnavailable(ctrl.entity)) {
              this._hass.callService("light", "turn_on", { entity_id: ctrl.entity, brightness_pct: pct });
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
            const sw = document.createElement("button");
            sw.type = "button";
            sw.className = "color-swatch";
            sw.style.background = `rgb(${rgb.join(",")})`;
            sw.setAttribute("aria-label", `${getTranslation(h, "a11y_set_value").replace("{name}", nameTxt)}: RGB ${rgb.join(", ")}`);
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

      // Select: dropdown (default/buttons) or option chips (full mode)
      if (isSelectDomain && !isUnavail) {
        const options = Array.isArray(st?.attributes?.options) ? st.attributes.options : [];
        if (options.length > 0) {
          const currentOption = st?.state;
          if (controlMode === "full") {
            // Full mode: show all options as tappable chips
            const optionsDiv = document.createElement("div");
            optionsDiv.className = "btn-cover-presets btn-select-options";
            options.forEach(option => {
              const pb = document.createElement("button");
              pb.type = "button";
              pb.className = "preset-btn";
              pb.textContent = option;
              pb.title = option;
              pb.setAttribute("aria-label", `${getTranslation(h, "a11y_select_option").replace("{name}", nameTxt)}: ${option}`);
              if (currentOption === option) pb.classList.add("active");
              pb.addEventListener("pointerdown", e => e.stopPropagation());
              pb.addEventListener("click", e => {
                e.stopPropagation();
                if (!this._isEntityUnavailable(ctrl.entity)) {
                  this._hass.callService(domain, "select_option", { entity_id: ctrl.entity, option: option });
                }
              });
              optionsDiv.appendChild(pb);
            });
            btn.appendChild(optionsDiv);
          } else {
            // Default / buttons: native dropdown
            const wrapDiv = document.createElement("div");
            wrapDiv.className = "btn-select-dropdown";
            const sel = document.createElement("select");
            sel.setAttribute("aria-label", getTranslation(h, "a11y_select_option").replace("{name}", nameTxt));
            options.forEach(option => {
              const opt = document.createElement("option");
              opt.value = option;
              opt.textContent = option;
              if (option === currentOption) opt.selected = true;
              sel.appendChild(opt);
            });
            sel.addEventListener("pointerdown", e => e.stopPropagation());
            sel.addEventListener("click", e => e.stopPropagation());
            sel.addEventListener("change", e => {
              e.stopPropagation();
              if (!this._isEntityUnavailable(ctrl.entity)) {
                this._hass.callService(domain, "select_option", { entity_id: ctrl.entity, option: sel.value });
              }
            });
            wrapDiv.appendChild(sel);
            btn.appendChild(wrapDiv);
          }
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
    Array.from(btn.querySelectorAll("button,input,select,textarea,a[href],[tabindex]")).forEach((element, index) => {
      element.dataset.rcFocusKey ||= `${element.localName}:${index}`;
    });
    if (focusedControlKey && !btn.closest(".controls")?.hasAttribute("inert")) {
      const replacement = Array.from(btn.querySelectorAll("[data-rc-focus-key]"))
        .find((element) => element.dataset.rcFocusKey === focusedControlKey);
      replacement?.focus();
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
      const id = setTimeout(() => { this._activeTimers.delete(id); if (node.isConnected) fn(); }, ms);
      this._activeTimers.add(id);
      return id;
    };
    const cancelTimeout = (id) => { clearTimeout(id); this._activeTimers.delete(id); };
    node._disposeActions = () => { cancelTimeout(timer); cancelTimeout(holdTimer); timer = null; holdTimer = null; };
    const triggerTap = () => {
      if (this._isEntityUnavailable(ctrl.entity) || held) return;
      if (config.double_tap_action.action !== "none") {
        if (timer) { cancelTimeout(timer); timer = null; this._fireAction("double_tap", config); }
        else { timer = trackTimeout(() => { timer = null; this._fireAction("tap", config); }, 250); }
      } else { this._fireAction("tap", config); }
    };
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
      if (isDragging || held) return;
      triggerTap();
    });
    node.addEventListener("keydown", (e) => {
      if (e.target !== node || !["Enter", " "].includes(e.key) || e.repeat || this._isEntityUnavailable(ctrl.entity)) return;
      e.preventDefault();
      held = false;
      if (config.hold_action.action !== "none") {
        holdTimer = trackTimeout(() => { held = true; this._fireAction("hold", config); }, 500);
      }
    });
    node.addEventListener("keyup", (e) => {
      if (e.target !== node || !["Enter", " "].includes(e.key) || this._isEntityUnavailable(ctrl.entity)) return;
      e.preventDefault();
      if (holdTimer) { cancelTimeout(holdTimer); holdTimer = null; }
      if (held) { held = false; return; }
      triggerTap();
    });
    node.addEventListener("blur", cancel);
  }

  _attachHeaderActions(node, context = "card") {
    const getActionContext = () => {
      const config = this.config || {};
      return {
        cardConfig: config,
        actionConfig: {
          entity: config.entity,
          tap_action: config.tap_action,
          hold_action: config.hold_action || { action: "none" },
          double_tap_action: config.double_tap_action || { action: "none" }
        },
        hasExplicitTap: config.tap_action !== undefined
      };
    };
    node.style.touchAction = "manipulation";
    let timer = null, held = false, holdTimer = null;
    const trackTimeout = (fn, ms) => {
      const id = setTimeout(() => { this._activeTimers.delete(id); if (node.isConnected) fn(); }, ms);
      this._activeTimers.add(id);
      return id;
    };
    const cancelTimeout = (id) => { clearTimeout(id); this._activeTimers.delete(id); };
    const handleTap = () => {
      const { cardConfig, actionConfig, hasExplicitTap } = getActionContext();
      if (context === "drawer" && !hasExplicitTap) return;
      if (!hasExplicitTap && cardConfig.collapsible === true) { this._toggleCollapse(); return; }
      this._fireAction("tap", actionConfig);
    };
    const cancel = () => {
      if (holdTimer) { cancelTimeout(holdTimer); holdTimer = null; }
    };
    node._disposeActions = () => { cancelTimeout(timer); cancelTimeout(holdTimer); timer = null; holdTimer = null; };
    node.addEventListener("pointerdown", () => {
      held = false;
      const { actionConfig } = getActionContext();
      if (actionConfig.hold_action?.action !== "none") {
        holdTimer = trackTimeout(() => { held = true; this._fireAction("hold", actionConfig); }, 500);
      }
    });
    node.addEventListener("pointerup", (e) => {
      if (holdTimer) cancelTimeout(holdTimer);
      if (held) { held = false; return; }
      const { actionConfig } = getActionContext();
      if (actionConfig.double_tap_action.action !== "none") {
        if (timer) { cancelTimeout(timer); timer = null; this._fireAction("double_tap", actionConfig); }
        else { timer = trackTimeout(() => { timer = null; handleTap(); }, 250); }
      } else { handleTap(); }
    });
    node.addEventListener("pointerleave", cancel);
    node.addEventListener("pointercancel", cancel);
    node.addEventListener("keydown", (e) => {
      if (e.target !== node || !["Enter", " "].includes(e.key) || e.repeat) return;
      e.preventDefault();
      held = false;
      const { actionConfig } = getActionContext();
      if (actionConfig.hold_action?.action !== "none") {
        holdTimer = trackTimeout(() => { held = true; this._fireAction("hold", actionConfig); }, 500);
      }
    });
    node.addEventListener("keyup", (e) => {
      if (e.target !== node || !["Enter", " "].includes(e.key)) return;
      e.preventDefault();
      if (holdTimer) { cancelTimeout(holdTimer); holdTimer = null; }
      if (held) { held = false; return; }
      const { actionConfig } = getActionContext();
      if (actionConfig.double_tap_action.action !== "none") {
        if (timer) { cancelTimeout(timer); timer = null; this._fireAction("double_tap", actionConfig); }
        else { timer = trackTimeout(() => { timer = null; handleTap(); }, 250); }
      } else { handleTap(); }
    });
    node.addEventListener("blur", cancel);
  }

  _fireAction(type, config) {
    if (config?.[`${type}_action`]?.action === "room-details") {
      this._showDetailDrawer(deepActiveElement());
      return;
    }
    if (config.entity && this._isEntityUnavailable(config.entity)) return;
    const eventDetail = buildHassActionDetail(type, config, this._hass);
    this.dispatchEvent(new CustomEvent("hass-action", { bubbles: true, composed: true, detail: eventDetail }));
  }

  _toggleCollapse() {
    this._collapsed = !this._collapsed;
    if (this._collapseKey && this.config?.remember_state !== false) localStorage.setItem(this._collapseKey, this._collapsed ? "1" : "0");
    this._syncCollapseUI();
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

  _showDetailDrawer(trigger) {
    if (!this.isConnected || this.config?.detail_drawer?.enabled !== true || this._detailDrawer) return;
    this._closeDialog?.(false);
    const t = key => getTranslation(this._hass, key);
    this._detailDrawer = createDetailDrawer({
      title: this.config.detail_drawer.title || this.config.name || t("room_details"),
      closeLabel: t("a11y_close"), trigger,
      onClose: () => {
        this._closeDialog?.(false);
        for (const node of this._detailDrawer?.surface?.controls.children || []) node._disposeActions?.();
        this._detailDrawer?.surface?.root.querySelector(".img-box")?._disposeActions?.();
        this._detailDrawer = null;
        this.shadowRoot.getElementById("details-btn")?.setAttribute("aria-expanded", "false");
        this._setupSparklineInterval();
      }
    });
    const actions = document.createElement("div");
    actions.className = "drawer-actions";
    for (const [name, action] of [
      ["more", event => {
        event.currentTarget.focus({ preventScroll: true });
        this._fireAction("tap", { entity: this.config.entity, tap_action: { action: "more-info" } });
      }],
      ["history", event => this._showSparklineDialog(this._drawerHistoryEntity(), 24, event.currentTarget)],
      ["status", () => this._showAlertDialog(this._drawerStatusRows(), t("status_groups"))]
    ]) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.drawerAction = name;
      button.addEventListener("click", action);
      actions.append(button);
    }
    const surfaceHost = document.createElement("div");
    surfaceHost.dataset.roomSurface = "drawer";
    this._detailDrawer.content.append(actions, surfaceHost);
    this._detailDrawer.surface = this._createSurface(surfaceHost.attachShadow({ mode: "open" }), "drawer");
    this._attachHeaderActions(this._detailDrawer.surface.root.querySelector(".img-box"), "drawer");
    this._syncDetailDrawer();
    this._updateSurfaceState(this._detailDrawer.surface);
    this._setupSparklineInterval();
  }

  _drawerHistoryEntity() {
    return (this.config?.controls || []).find(ctrl => ctrl.entity?.startsWith("sensor.") && ctrl.show_sparkline === true)?.entity
      || (this.config?.temp_sensor?.startsWith("sensor.") ? this.config.temp_sensor : "");
  }

  _drawerStatusRows() {
    return (Array.isArray(this.config?.status_groups) ? this.config.status_groups : []).flatMap(group => {
      const result = getStatusGroupResult(group, this._hass);
      return result.visible ? result.contributors : [];
    });
  }

  _syncDetailDrawer() {
    const t = key => getTranslation(this._hass, key);
    const enabled = this.config?.detail_drawer?.enabled === true;
    const button = this.shadowRoot.getElementById("details-btn");
    if (button) {
      button.hidden = !enabled;
      button.textContent = t("room_details");
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-expanded", String(!!this._detailDrawer));
    }
    if (!this._detailDrawer) return;
    this._detailDrawer.update({ title: this.config.detail_drawer.title || this.config.name || t("room_details"), closeLabel: t("a11y_close"), themeSource: this });
    const header = this._detailDrawer.surface?.root.querySelector(".img-box");
    const hasAction = [this.config.tap_action, this.config.hold_action, this.config.double_tap_action].some(action => action?.action && action.action !== "none");
    if (header) {
      header.tabIndex = hasAction ? 0 : -1;
      if (hasAction) header.setAttribute("role", "button");
      else header.removeAttribute("role");
      header.setAttribute("aria-label", this.config.name || t("room_details"));
    }
    const more = this._detailDrawer.content.querySelector('[data-drawer-action="more"]');
    more.textContent = t("act_more");
    more.disabled = !this.config.entity || !this._hass?.states?.[this.config.entity] || this._isEntityUnavailable(this.config.entity);
    const history = this._detailDrawer.content.querySelector('[data-drawer-action="history"]');
    history.textContent = t("sparkline_detail_title");
    history.disabled = !this._drawerHistoryEntity() || !this._hass?.states?.[this._drawerHistoryEntity()];
    const status = this._detailDrawer.content.querySelector('[data-drawer-action="status"]');
    status.textContent = t("status_groups");
    status.disabled = this._drawerStatusRows().length === 0;
  }
}

export { OneLineRoomCard };
