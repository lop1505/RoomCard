import { readFile } from "node:fs/promises";
import { Window } from "happy-dom";

const browserGlobals = [
  "Node",
  "Element",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLButtonElement",
  "Event",
  "CustomEvent",
  "KeyboardEvent",
  "MouseEvent",
  "PointerEvent",
  "MutationObserver",
  "ResizeObserver",
  "FormData",
  "File",
  "Blob",
  "URL",
  "CSS"
];

export const installDomEnvironment = () => {
  const window = new Window({ url: "http://localhost/lovelace/0" });
  const installGlobal = (name, value) => {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value
    });
  };

  installGlobal("window", window);
  installGlobal("document", window.document);
  installGlobal("customElements", window.customElements);
  installGlobal("navigator", window.navigator);
  installGlobal("localStorage", window.localStorage);
  installGlobal("history", window.history);
  installGlobal("location", window.location);
  installGlobal("getComputedStyle", window.getComputedStyle.bind(window));
  installGlobal("requestAnimationFrame", window.requestAnimationFrame.bind(window));
  installGlobal("cancelAnimationFrame", window.cancelAnimationFrame.bind(window));

  for (const name of browserGlobals) {
    if (window[name]) installGlobal(name, window[name]);
  }

  return window;
};

export const importRoomCard = async (extraExports = []) => {
  const sourceUrl = new URL("../../dist/room-card.js", import.meta.url);
  const source = await readFile(sourceUrl, "utf8");
  const exportStatement = extraExports.length > 0
    ? `\nexport { ${extraExports.join(", ")} };`
    : "";
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(`${source}${exportStatement}`).toString("base64")}`;
  return import(moduleUrl);
};

export const createHass = (overrides = {}) => {
  const serviceCalls = [];
  const hass = {
    language: "en",
    locale: { language: "en-US", number_format: "comma_decimal" },
    config: {
      unit_system: {
        temperature: "°C",
        length: "km",
        pressure: "Pa"
      }
    },
    user: { id: "test-user" },
    entities: {},
    states: {},
    panels: {},
    callService(domain, service, data) {
      serviceCalls.push({ domain, service, data });
    },
    callWS: async () => ({}),
    fetchWithAuth: async () => ({ ok: true, json: async () => ({ id: "image-id" }) }),
    connection: {
      sendMessagePromise: async () => ({ views: [] })
    },
    formatEntityState(stateObj) {
      const unit = stateObj?.attributes?.unit_of_measurement;
      return unit ? `${stateObj.state} ${unit}` : String(stateObj?.state ?? "");
    },
    formatEntityAttributeValue(stateObj, attribute) {
      return String(stateObj?.attributes?.[attribute] ?? "");
    },
    ...overrides
  };

  hass.__serviceCalls = serviceCalls;
  return hass;
};

export const wait = (milliseconds = 0) => new Promise((resolve) => setTimeout(resolve, milliseconds));
