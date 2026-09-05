import { deepActiveElement } from "./dialog-coordinator.js";

// HA ha-dialog/ha-bottom-sheet emit `opened`; their owners emit
// `dialog-closed` with { dialog: localName }. A request alone is not proof that
// a lazy-loaded HA dialog actually opened. No monkey-patching or polling.
export const observeHassDialogs = (coordinator, doc = document) => {
  const entries = new Map();
  const opened = (event) => {
    const path = event.composedPath();
    if (!path.some(node => ["HA-DIALOG", "HA-BOTTOM-SHEET", "HA-ADAPTIVE-DIALOG"].includes(node.tagName))) return;
    const owner = path.find(node => node.tagName?.startsWith("HA-") && typeof node.closeDialog === "function");
    if (!owner || entries.has(owner)) return;
    const entry = { kind: "ha", restoreTarget: deepActiveElement(doc) };
    entries.set(owner, entry);
    coordinator.push(entry);
  };
  const closed = (event) => {
    for (const [owner, entry] of entries) {
      if (event.detail?.dialog !== owner.localName || !event.composedPath().includes(owner)) continue;
      entries.delete(owner);
      // HA also restores focus. Run after its synchronous handlers, but never
      // resurrect a drawer that was closed or replaced during the handoff.
      queueMicrotask(() => coordinator.remove(entry));
    }
  };
  doc.addEventListener("opened", opened, true);
  doc.addEventListener("dialog-closed", closed, true);
  return () => {
    doc.removeEventListener("opened", opened, true);
    doc.removeEventListener("dialog-closed", closed, true);
    for (const entry of entries.values()) coordinator.remove(entry, false);
    entries.clear();
  };
};
