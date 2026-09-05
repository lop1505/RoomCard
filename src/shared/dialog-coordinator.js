// Only modal ordering and focus live here; configuration and HA data stay with
// the owning card. Share the coordinator even when a second bundle is loaded.
const KEY = Symbol.for("room-card.dialog-coordinator");

export const deepActiveElement = (root = document) => {
  let active = root.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
};

const focusableElements = (root) => {
  const result = [];
  const visit = (parent) => {
    for (const node of parent.children || []) {
      if (node.hidden || node.inert || node.getAttribute("aria-hidden") === "true") continue;
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (node.tabIndex >= 0 && !node.disabled) result.push(node);
      visit(node.shadowRoot || node);
    }
  };
  visit(root);
  return result;
};

const containsFocusTarget = (panel, target) => {
  for (let node = target; node; node = node.parentNode || node.host) {
    if (node === panel) return true;
  }
  return false;
};

export const getDialogCoordinator = (doc = document) => {
  if (doc[KEY]) return doc[KEY];
  const stack = [];
  let listening = false;
  const top = () => stack.at(-1);
  const focus = (target) => {
    if (target?.isConnected) target.focus({ preventScroll: true });
  };
  const sync = () => {
    for (const entry of stack) {
      if (!entry.panel) continue;
      const paused = entry !== top();
      entry.panel.inert = paused;
      entry.panel.setAttribute("aria-modal", String(!paused));
      if (paused) entry.panel.setAttribute("aria-hidden", "true");
      else entry.panel.removeAttribute("aria-hidden");
    }
    if (stack.length && !listening) {
      doc.addEventListener("keydown", keydown, true);
      doc.addEventListener("focusin", focusin, true);
      listening = true;
    } else if (!stack.length && listening) {
      doc.removeEventListener("keydown", keydown, true);
      doc.removeEventListener("focusin", focusin, true);
      listening = false;
    }
  };
  const keydown = (event) => {
    const current = top();
    if (!current?.panel) return; // HA owns the active external dialog.
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      current.close();
    } else if (event.key === "Tab") {
      const nodes = focusableElements(current.panel);
      const index = nodes.indexOf(deepActiveElement(doc));
      const next = event.shiftKey ? (index <= 0 ? nodes.length - 1 : index - 1) : (index + 1) % nodes.length;
      event.preventDefault();
      event.stopImmediatePropagation();
      focus(nodes[next] || current.panel);
    }
  };
  const focusin = (event) => {
    const current = top();
    if (!current?.panel || event.composedPath().includes(current.panel)) return;
    focus(current.initialFocus || current.panel);
  };
  const coordinator = {
    push(entry) {
      entry.restoreTarget ??= deepActiveElement(doc);
      stack.push(entry);
      sync();
      focus(entry.initialFocus);
      return entry;
    },
    remove(entry, restore = true) {
      const index = stack.indexOf(entry);
      if (index < 0) return;
      const wasTop = entry === top();
      stack.splice(index, 1);
      sync();
      if (restore && wasTop) {
        const current = top();
        const target = entry.restoreTarget;
        if (!current || (current.panel && target?.isConnected && containsFocusTarget(current.panel, target))) focus(target);
        else if (current?.panel) focus(current.initialFocus || current.panel);
      }
    },
    isTop: (entry) => top() === entry,
    get size() { return stack.length; },
    replaceDrawer() {
      for (const entry of [...stack].reverse()) {
        if (entry.kind !== "ha") entry.close(false);
      }
    }
  };
  doc[KEY] = coordinator;
  return coordinator;
};
