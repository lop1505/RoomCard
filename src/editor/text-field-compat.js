class OneLineRoomCardTextField extends HTMLElement {
  static get observedAttributes() {
    return [
      "label", "placeholder", "type", "min", "max", "step", "rows",
      "multiline", "disabled", "readonly", "required", "icon"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open", delegatesFocus: true });
    this._value = this.getAttribute("value") || "";
    this._committedValue = this._value;
    this._control = null;
    this._watchedDefinitions = false;
  }

  connectedCallback() {
    this._renderControl();
    this._watchForHomeAssistantInputs();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._renderControl();
  }

  get value() { return this._value; }
  set value(value) {
    this._value = value == null ? "" : String(value);
    this._committedValue = this._value;
    if (this._control && this._control.value !== this._value) {
      this._control.value = this._value;
    }
  }

  get hass() { return this._hass; }
  set hass(hass) {
    this._hass = hass;
    if (this._control && "hass" in this._control) this._control.hass = hass;
  }

  get label() { return this.getAttribute("label") || ""; }
  set label(value) { this._setStringAttribute("label", value); }
  get placeholder() { return this.getAttribute("placeholder") || ""; }
  set placeholder(value) { this._setStringAttribute("placeholder", value); }
  get type() { return this.getAttribute("type") || "text"; }
  set type(value) { this._setStringAttribute("type", value || "text"); }
  get min() { return this.getAttribute("min"); }
  set min(value) { this._setOptionalAttribute("min", value); }
  get max() { return this.getAttribute("max"); }
  set max(value) { this._setOptionalAttribute("max", value); }
  get step() { return this.getAttribute("step"); }
  set step(value) { this._setOptionalAttribute("step", value); }
  get rows() { return Number(this.getAttribute("rows") || 3); }
  set rows(value) { this._setOptionalAttribute("rows", value); }
  get multiline() { return this.hasAttribute("multiline"); }
  set multiline(value) { this.toggleAttribute("multiline", Boolean(value)); }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled", Boolean(value)); }
  get readonly() { return this.hasAttribute("readonly"); }
  set readonly(value) { this.toggleAttribute("readonly", Boolean(value)); }
  get required() { return this.hasAttribute("required"); }
  set required(value) { this.toggleAttribute("required", Boolean(value)); }

  focus(options) { this._control?.focus(options); }
  select() { this._control?.select?.(); }
  checkValidity() { return this._control?.checkValidity?.() ?? true; }
  reportValidity() { return this._control?.reportValidity?.() ?? true; }

  _setStringAttribute(name, value) {
    this.setAttribute(name, value == null ? "" : String(value));
  }

  _setOptionalAttribute(name, value) {
    if (value == null || value === "") this.removeAttribute(name);
    else this.setAttribute(name, String(value));
  }

  _watchForHomeAssistantInputs() {
    if (this._watchedDefinitions) return;
    this._watchedDefinitions = true;
    const tags = this.multiline
      ? ["ha-textarea", "ha-textfield"]
      : ["ha-input", "ha-textfield"];
    Promise.race(tags.map((tag) => customElements.whenDefined(tag))).then(() => {
      if (this.isConnected) this._renderControl();
    });
  }

  _preferredControlTag() {
    if (this.multiline) {
      if (customElements.get("ha-textarea")) return "ha-textarea";
      if (customElements.get("ha-textfield")) return "ha-textfield";
      return "textarea";
    }
    if (customElements.get("ha-input")) return "ha-input";
    if (customElements.get("ha-textfield")) return "ha-textfield";
    return "input";
  }

  _renderControl() {
    const tag = this._preferredControlTag();
    if (this._control?.localName === tag) {
      this._syncControlProperties();
      return;
    }

    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; box-sizing: border-box; width: 100%; }
      *, *::before, *::after { box-sizing: border-box; }
      .native-wrap { position: relative; width: 100%; }
      .native-label {
        position: absolute; z-index: 1; inset: 7px 12px auto 12px;
        color: var(--secondary-text-color, #727272); font: 400 12px/16px sans-serif;
        pointer-events: none;
      }
      input, textarea {
        display: block; width: 100%; min-height: 56px; margin: 0; padding: 20px 12px 6px;
        border: 0; border-bottom: 1px solid var(--divider-color, #9e9e9e); border-radius: 4px 4px 0 0;
        outline: none; resize: vertical; font: inherit;
        color: var(--mdc-text-field-ink-color, var(--primary-text-color, #212121));
        background: var(--mdc-text-field-fill-color, var(--secondary-background-color, #f5f5f5));
      }
      .native-wrap.no-label input, .native-wrap.no-label textarea { padding-top: 6px; }
      input:focus, textarea:focus { border-bottom: 2px solid var(--primary-color, #03a9f4); }
      input:disabled, textarea:disabled { opacity: .55; cursor: not-allowed; }
      ha-input, ha-textfield, ha-textarea { display: block; width: 100%; }
    `;

    const control = document.createElement(tag);
    this._control = control;
    this._syncControlProperties();
    control.addEventListener("input", (event) => this._forwardValueEvent(event, "input"));
    control.addEventListener("change", (event) => this._forwardValueEvent(event, "change"));
    if (tag === "input" || tag === "textarea") {
      control.addEventListener("blur", (event) => this._forwardValueEvent(event, "change"));
    }

    const fragment = document.createDocumentFragment();
    fragment.appendChild(style);
    if (tag === "input" || tag === "textarea") {
      const wrap = document.createElement("div");
      wrap.className = `native-wrap${this.label ? "" : " no-label"}`;
      if (this.label) {
        const label = document.createElement("label");
        label.className = "native-label";
        label.textContent = this.label;
        wrap.appendChild(label);
      }
      wrap.appendChild(control);
      fragment.appendChild(wrap);
    } else {
      if (this.getAttribute("icon") && tag === "ha-input") {
        const icon = document.createElement("ha-icon");
        icon.slot = "start";
        icon.icon = this.getAttribute("icon");
        control.appendChild(icon);
      }
      fragment.appendChild(control);
    }
    this.shadowRoot.replaceChildren(fragment);
  }

  _syncControlProperties() {
    const control = this._control;
    if (!control) return;
    control.value = this._value;
    control.label = this.label;
    control.placeholder = this.placeholder;
    if (control.localName !== "textarea" && control.localName !== "ha-textarea") {
      control.type = this.type;
    }
    ["min", "max", "step"].forEach((name) => {
      const value = this.getAttribute(name);
      if (value == null) control.removeAttribute(name);
      else control.setAttribute(name, value);
    });
    if (this.multiline) {
      control.rows = this.rows;
      if (control.localName === "ha-textfield") control.multiline = true;
    }
    control.disabled = this.disabled;
    control.readonly = this.readonly;
    control.required = this.required;
    if (this._hass && "hass" in control) control.hass = this._hass;
    if (this.getAttribute("icon") && control.localName === "ha-textfield") {
      control.icon = this.getAttribute("icon");
    }
  }

  _forwardValueEvent(event, type) {
    event.stopPropagation();
    this._value = this._control?.value == null ? "" : String(this._control.value);
    if (type === "change") {
      if (this._committedValue === this._value) return;
      this._committedValue = this._value;
    }
    this.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
  }
}

export { OneLineRoomCardTextField };
