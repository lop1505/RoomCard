console.info(
  "%c ROOM-CARD %c 1.0.0 ",
  "color: white; background: #2c3e50; font-weight: 700;",
  "color: white; background: #3498db; font-weight: 700;"
);

// Helfer
const toList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return v
    .split(",")
    .map((s) => s.trim())
    .filter((x) => x);
};

const clampNum = (v, min, max, fallback) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(n, max));
};

// =============================================================================
// 1. DIE KARTE (Anzeige)
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

  static getStubConfig(hass) {
    const entities = Object.keys(hass.states);
    const light = entities.find((e) => e.startsWith("light.")) || "";
    return {
      name: "Wohnzimmer",
      icon: "mdi:sofa",
      color: "orange",
      controls: [
        { entity: light, name: "Info", type: "light", icon: "mdi:information", width: 60, height: 100 },
        { entity: light, name: "Licht", type: "light", icon: "mdi:lightbulb", width: 20, height: 60 },
      ],
    };
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ha-card { position: relative; overflow: hidden; border-radius: 16px; background: none; border: none; cursor: pointer; transition: all 0.2s; }
        .container { display: flex; flex-direction: column; background: var(--ha-card-background, rgba(255, 255, 255, 0.1)); border-radius: 16px; }
        .img-box { position: relative; width: 100%; height: 120px; overflow: hidden; border-radius: 16px 16px 0 0; background: #444; }
        .img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 12px; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); display: flex; align-items: center; gap: 12px; }
        .text { display: flex; flex-direction: column; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
        .primary { font-weight: bold; font-size: 14px; }
        .secondary { font-size: 12px; opacity: 0.9; }
        .chips { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 2; }
        .chip { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; background: #FFF8E1; color: #FFA000; }
        .chip.alert { background: #FFEBEE; color: #D32F2F; }

        /* SUPER-GRID: 60 Spalten */
        .controls {
          display: grid;
          grid-template-columns: repeat(60, 1fr);
          gap: 8px;
          padding: 12px;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 12px;
          border-radius: 12px;
          cursor: pointer;
          background: rgba(128, 128, 128, 0.05);
          transition: background 0.2s;
          min-width: 0;
        }
        .btn:hover { background: rgba(128, 128, 128, 0.1); }

        .icon-box { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
        .btn-txt { display: flex; flex-direction: column; text-align: left; overflow: hidden; }
        .btn-name { font-size: 12px; font-weight: bold; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .btn-state { font-size: 10px; color: var(--secondary-text-color); }
      </style>

      <ha-card>
        <div class="container">
          <div class="img-box">
            <img id="bg" class="img" src="">
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

    // Header
    this.shadowRoot.getElementById("bg").src = c.image || "/static/images/card_media/cover.png";
    this.shadowRoot.getElementById("name").innerText = c.name || "Raum";

    const icon = this.shadowRoot.getElementById("icon");
    icon.icon = c.icon || "mdi:home";
    icon.style.color = c.color || "white";

    const temp = c.temp_sensor && h.states[c.temp_sensor] ? h.states[c.temp_sensor].state : "-";
    const hum = c.humid_sensor && h.states[c.humid_sensor] ? h.states[c.humid_sensor].state : "-";
    this.shadowRoot.getElementById("info").innerText = `${temp}°C | ${hum}%`;

    // Chips (Hybrid: Binary + Numeric)
    const chips = this.shadowRoot.getElementById("chips");
    chips.innerHTML = "";

    let alert = false;
    toList(c.battery_sensors).forEach((s) => {
      const st = h.states[s];
      if (!st) return;
      if (st.state === "on") alert = true; // Binary
      const pct = parseFloat(st.state);
      if (!isNaN(pct) && pct <= 15) alert = true; // Numeric
    });

    if (alert) {
      chips.innerHTML += `<div class="chip alert"><ha-icon icon="mdi:battery-alert" style="--mdc-icon-size:14px"></ha-icon> Leer</div>`;
    }

    toList(c.window_sensors).forEach((s) => {
      const st = h.states[s];
      if (st?.state === "on") {
        chips.innerHTML += `<div class="chip"><ha-icon icon="mdi:window-open-variant" style="--mdc-icon-size:14px"></ha-icon> ${
          st.attributes.friendly_name || "Fenster"
        }</div>`;
      }
    });

    // Controls
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

      let col = "grey",
        bg = "rgba(128,128,128,0.1)";
      if (st && (["on", "open"].includes(state) || (type === "shutter" && state !== "closed"))) {
        if (type === "light") {
          col = "orange";
          bg = "rgba(255,165,0,0.2)";
        }
        if (type === "shutter") {
          col = "#2196F3";
          bg = "rgba(33,150,243,0.2)";
        }
        if (type === "climate") {
          col = "#FF5722";
          bg = "rgba(255,87,34,0.2)";
        }
      }

      let stateTxt = state;
      if (type === "climate" && st?.attributes?.current_temperature !== undefined) {
        stateTxt = `${st.attributes.current_temperature}°C`;
      }

      const btn = document.createElement("div");
      btn.className = "btn";

      const finalW = clampNum(ctrl.width, 1, 60, 15);
      const finalH = clampNum(ctrl.height, 40, 250, 60);

      btn.style.gridColumn = `span ${finalW}`;
      btn.style.height = `${finalH}px`;

      btn.innerHTML = `
        <div class="icon-box" style="background:${bg}">
          <ha-icon icon="${ctrl.icon || "mdi:circle"}" style="color:${col}; --mdc-icon-size:20px"></ha-icon>
        </div>
        <div class="btn-txt">
          <span class="btn-name">${ctrl.name || "Gerät"}</span>
          <span class="btn-state">${stateTxt}</span>
        </div>
      `;

      btn.onclick = (e) => {
        e.stopPropagation();
        if (type === "climate") {
          this.dispatchEvent(
            new CustomEvent("hass-more-info", {
              detail: { entityId: ctrl.entity },
              bubbles: true,
              composed: true,
            })
          );
        } else {
          h.callService("homeassistant", "toggle", { entity_id: ctrl.entity });
        }
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

  static getConfigElement() {
    return document.createElement("room-card-editor");
  }
}
customElements.define("room-card", RoomCard);

// =============================================================================
// 2. DER EDITOR
// =============================================================================
class RoomCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._timer = null;
  }

  setConfig(config) {
    this._config = config;
    if (!this._config.controls) this._config = { ...this._config, controls: [] };
    this.render();
    if (this._hass) this.updateHass();
  }

  set hass(hass) {
    this._hass = hass;
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
    this._timer = setTimeout(() => {
        this._fire(config);
    }, 300);
  }

  _fire(config) {
    this._config = config;
    this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config },
          bubbles: true,
          composed: true,
        })
    );
  }

  render() {
    if (this.shadowRoot.innerHTML !== "") {
      this.updateValues();
      this.renderButtons();
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        .section { padding: 12px 0; border-bottom: 1px solid var(--divider-color); }
        .section:last-child { border-bottom: none; }
        .stack { display: flex; flex-direction: column; gap: 12px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        h3 { margin: 0 0 12px 0; color: var(--primary-text-color); font-weight: 500; }

        .control-box {
          border: 1px solid var(--divider-color);
          padding: 12px;
          border-radius: 10px;
          background: var(--secondary-background-color);
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 12px;
          position: relative;
        }
        
        .box-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .actions {
            display: flex;
            gap: 4px;
        }
        .icon-btn {
            cursor: pointer;
            color: var(--secondary-text-color);
            transition: color 0.2s;
        }
        .icon-btn:hover { color: var(--primary-text-color); }
        .delete-btn { color: #D32F2F !important; }

        ha-textfield, ha-selector, ha-entity-picker, ha-icon-picker, ha-select { width: 100%; display: block; }
        mwc-button { width: 100%; margin-top: 8px; }
      </style>

      <div class="section">
        <h3>Allgemein</h3>
        <div class="stack">
          <ha-textfield label="Name" config="name" class="base"></ha-textfield>
          <div class="row">
            <ha-icon-picker label="Icon" config="icon" class="base"></ha-icon-picker>
            <ha-textfield label="Farbe" config="color" class="base"></ha-textfield>
          </div>
          <ha-textfield label="Bild URL" config="image" class="base"></ha-textfield>
          <ha-textfield label="Pfad (Tap Action)" config="nav_path" class="base"></ha-textfield>
        </div>
      </div>

      <div class="section">
        <h3>Sensoren</h3>
        <div class="stack">
          <ha-entity-picker label="Temperatur" config="temp_sensor" class="base" allow-custom-entity></ha-entity-picker>
          <ha-entity-picker label="Luftfeuchtigkeit" config="humid_sensor" class="base" allow-custom-entity></ha-entity-picker>
          <ha-selector config="window_sensors" class="base" label="Fenster (Liste)"></ha-selector>
          <ha-selector config="battery_sensors" class="base" label="Batterien (Liste)"></ha-selector>
        </div>
      </div>

      <div class="section">
        <h3>Buttons</h3>
        <div id="buttons"></div>
        <mwc-button id="add" raised label="Button hinzufügen">
          <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
        </mwc-button>
      </div>
    `;

    this.shadowRoot.querySelectorAll(".base").forEach((el) => {
      const key = el.getAttribute("config");
      
      if (key === "window_sensors") el.selector = { entity: { domain: "binary_sensor", multiple: true } };
      // FIX: Batterie offen lassen (Maximum Compatibility)
      if (key === "battery_sensors") el.selector = { entity: { multiple: true } };

      const ev = el.tagName === "HA-TEXTFIELD" ? "change" : "value-changed";
      el.addEventListener(ev, (e) => {
        e.stopPropagation();
        this._changed(e);
      });
      el.addEventListener("click", (e) => e.stopPropagation());
    });

    this.shadowRoot.getElementById("add").addEventListener("click", (e) => {
      e.stopPropagation();
      const c = [...(this._config.controls || [])];
      c.push({ entity: "", name: "", type: "light", width: 15, height: 60 });
      this._fireDebounced({ ...this._config, controls: c });
      this.renderButtons();
    });

    this.updateValues();
    this.renderButtons();
  }

  _moveControl(index, step) {
    const c = [...this._config.controls];
    const newIndex = index + step;
    if (newIndex < 0 || newIndex >= c.length) return;
    
    [c[index], c[newIndex]] = [c[newIndex], c[index]];
    
    // Instant Fire
    this._config = { ...this._config, controls: c };
    this._fire(this._config); 
    this.renderButtons();
  }

  renderButtons() {
    const div = this.shadowRoot.getElementById("buttons");
    if (!div) return;
    div.innerHTML = "";

    // FIX: String-Safety & Current-Value Check & Fallback
    const bindSelect = (el, callback) => {
      let current = String(el.value ?? "");
      const update = (newVal) => {
          const safeVal = String(newVal ?? "");
          if (safeVal === current) return;
          current = safeVal;
          callback(safeVal);
      };
      el.addEventListener("value-changed", (e) => { 
          e.stopPropagation(); 
          update(e.detail?.value ?? el.value); // FIX: Safe Fallback
      });
      el.addEventListener("closed", (e) => { 
          e.stopPropagation(); 
          update(el.value); 
      });
      el.addEventListener("click", (e) => e.stopPropagation());
    };

    const controls = this._config.controls || [];
    const lastIdx = controls.length - 1;

    controls.forEach((ctrl, i) => {
      const box = document.createElement("div");
      box.className = "control-box";
      box.addEventListener("click", (e) => e.stopPropagation());

      box.innerHTML = `
        <div class="box-header">
            <strong>Button ${i + 1}</strong>
            <div class="actions">
                ${i > 0 ? '<ha-icon class="icon-btn move-up" icon="mdi:arrow-up"></ha-icon>' : ''}
                ${i < lastIdx ? '<ha-icon class="icon-btn move-down" icon="mdi:arrow-down"></ha-icon>' : ''}
                <ha-icon class="icon-btn delete-btn" icon="mdi:delete"></ha-icon>
            </div>
        </div>

        <ha-entity-picker class="ep" label="Entität" allow-custom-entity></ha-entity-picker>

        <div class="row">
          <ha-textfield class="nm" label="Name"></ha-textfield>
          <ha-icon-picker class="ic" label="Icon"></ha-icon-picker>
        </div>

        <div class="row">
          <ha-select class="ty" label="Typ" fixedMenuPosition naturalMenuWidth>
            <mwc-list-item value="light">Licht</mwc-list-item>
            <mwc-list-item value="shutter">Rollo</mwc-list-item>
            <mwc-list-item value="climate">Heizung</mwc-list-item>
          </ha-select>

          <ha-selector class="ht" label="Höhe (px)"></ha-selector>
        </div>

        <ha-select class="wd" label="Breite" fixedMenuPosition naturalMenuWidth>
          <mwc-list-item value="60">Voll (1 pro Zeile)</mwc-list-item>
          <mwc-list-item value="40">2 Drittel (2/3)</mwc-list-item>
          <mwc-list-item value="30">Halb (1/2)</mwc-list-item>
          <mwc-list-item value="20">Drittel (1/3)</mwc-list-item>
          <mwc-list-item value="15">Viertel (1/4)</mwc-list-item>
          <mwc-list-item value="12">Fünftel (1/5)</mwc-list-item>
          <mwc-list-item value="10">Sechstel (1/6)</mwc-list-item>
        </ha-select>
      `;

      // Actions
      const upBtn = box.querySelector(".move-up");
      if(upBtn) upBtn.addEventListener("click", (e) => { e.stopPropagation(); this._moveControl(i, -1); });

      const downBtn = box.querySelector(".move-down");
      if(downBtn) downBtn.addEventListener("click", (e) => { e.stopPropagation(); this._moveControl(i, 1); });

      box.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const c = [...this._config.controls];
        c.splice(i, 1);
        this._fireDebounced({ ...this._config, controls: c });
        this.renderButtons();
      });

      // Inputs
      const ep = box.querySelector(".ep");
      ep.hass = this._hass;
      ep.value = ctrl.entity;
      ep.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        const val = e.detail.value;
        let type = ctrl.type;
        if (val?.startsWith("cover.")) type = "shutter";
        if (val?.startsWith("climate.")) type = "climate";
        this._updateControl(i, { entity: val, type });
      });
      ep.addEventListener("click", (e) => e.stopPropagation());

      const nm = box.querySelector(".nm");
      nm.value = ctrl.name || "";
      nm.addEventListener("change", (e) => {
        e.stopPropagation();
        this._updateControl(i, { name: e.target.value });
      });
      nm.addEventListener("click", (e) => e.stopPropagation());

      const ic = box.querySelector(".ic");
      const iconVal = ctrl.icon || "";
      ic.value = iconVal; ic.icon = iconVal;
      ic.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        this._updateControl(i, { icon: e.detail.value });
      });
      ic.addEventListener("click", (e) => e.stopPropagation());

      const ty = box.querySelector(".ty");
      ty.value = ctrl.type || "light";
      bindSelect(ty, (v) => this._updateControl(i, { type: v }));

      const wd = box.querySelector(".wd");
      wd.value = String(ctrl.width || 15);
      bindSelect(wd, (v) => this._updateControl(i, { width: clampNum(v, 1, 60, 15) }));

      const ht = box.querySelector(".ht");
      ht.hass = this._hass;
      ht.selector = { number: { min: 40, max: 250, mode: "box", unit_of_measurement: "px" } };
      ht.value = ctrl.height || 60;
      ht.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        const final = clampNum(e.detail.value, 40, 250, 60);
        this._updateControl(i, { height: final });
      });
      ht.addEventListener("click", (e) => e.stopPropagation());

      div.appendChild(box);
    });

    this.updateHass();
  }

  updateValues() {
    this.shadowRoot.querySelectorAll(".base").forEach((el) => {
      const key = el.getAttribute("config");
      let val = "";

      if (key === "nav_path") val = this._config.tap_action?.navigation_path || "";
      else val = this._config[key];

      if (key === "window_sensors" || key === "battery_sensors") {
        const next = Array.isArray(val) ? val : toList(val);
        el.value = next;
      } else {
        val = val || "";
        if (el.tagName === "HA-ICON-PICKER") {
          if (el.value !== val) el.value = val;
          if (el.icon !== val) el.icon = val;
        } else {
          if (el.value !== val) el.value = val;
        }
      }

      if (el.hass !== this._hass) el.hass = this._hass;
    });
  }

  _changed(e) {
    const key = e.target.getAttribute("config");
    const val = e.detail?.value !== undefined ? e.detail.value : e.target.value;

    const c = { ...this._config };

    if (key === "nav_path") {
      if (!val) delete c.tap_action;
      else c.tap_action = { action: "navigate", navigation_path: val };
    } else {
      const isEmptyArray = Array.isArray(val) && val.length === 0;
      if (val === "" || val === undefined || isEmptyArray) delete c[key];
      else c[key] = val;
    }

    this._fireDebounced(c);
  }

  _updateControl(index, changes) {
    const c = [...this._config.controls];
    c[index] = { ...c[index], ...changes };

    Object.keys(c[index]).forEach((k) => {
      if (c[index][k] === "" || c[index][k] === undefined) delete c[index][k];
    });

    this._fireDebounced({ ...this._config, controls: c });
    if (changes.entity) this.renderButtons();
  }
}
customElements.define("room-card-editor", RoomCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "room-card",
  name: "Room Card",
  preview: true,
  description: "Visuelle Karte für Räume",
});