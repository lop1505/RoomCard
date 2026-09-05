import { getDialogCoordinator } from "../shared/dialog-coordinator.js";
import { observeHassDialogs } from "../shared/ha-dialog-adapter.js";

export const createDetailDrawer = ({ title, closeLabel, trigger, onClose }) => {
  const coordinator = getDialogCoordinator();
  coordinator.replaceDrawer();
  const host = document.createElement("div");
  host.dataset.roomCardDrawer = "";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      :host { position:fixed; inset:0; z-index:5; color:var(--primary-text-color,#212121); font-family:var(--paper-font-body1_-_font-family, sans-serif); }
      * { box-sizing:border-box; }
      .backdrop { position:absolute; inset:0; background:rgba(0,0,0,.48); }
      .panel { position:absolute; inset:0 0 0 auto; display:flex; flex-direction:column; width:480px; max-width:100%; background:var(--ha-card-background,var(--card-background-color,#fff)); box-shadow:-6px 0 30px rgba(0,0,0,.25); animation:enter .18s ease-out; }
      header { flex:none; display:flex; align-items:center; gap:16px; padding:calc(16px + env(safe-area-inset-top,0px)) calc(16px + env(safe-area-inset-right,0px)) 16px calc(16px + env(safe-area-inset-left,0px)); border-bottom:1px solid var(--divider-color,#ddd); }
      h2 { flex:1; margin:0; font-size:20px; overflow-wrap:anywhere; }
      button { min-width:44px; min-height:44px; padding:10px; border:1px solid var(--divider-color,#ddd); border-radius:12px; background:transparent; color:inherit; font:inherit; cursor:pointer; }
      button:disabled { opacity:.5; cursor:default; }
      button:focus-visible { outline:2px solid var(--primary-color,#03a9f4); outline-offset:2px; }
      .content { flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; padding:16px calc(16px + env(safe-area-inset-right,0px)) calc(16px + env(safe-area-inset-bottom,0px)) calc(16px + env(safe-area-inset-left,0px)); }
      .prototype-actions { display:flex; flex-wrap:wrap; gap:10px; }
      .prototype-note { color:var(--secondary-text-color,#666); }
      @keyframes enter { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:none; } }
      @media (max-width:767px) {
        .panel { inset:auto 0 0; width:100%; max-height:90vh; max-height:90dvh; border-radius:20px 20px 0 0; animation-name:enter-bottom; }
        @keyframes enter-bottom { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
      }
      @media (prefers-reduced-motion:reduce) { .panel { animation:none; } }
    </style>
    <div class="backdrop" aria-hidden="true"></div>
    <section class="panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1">
      <header><h2 id="drawer-title"></h2><button type="button" class="close">✕</button></header>
      <div class="content"></div>
    </section>`;
  const panel = root.querySelector(".panel");
  const heading = root.querySelector("h2");
  const closeButton = root.querySelector(".close");
  const content = root.querySelector(".content");
  heading.textContent = title;
  closeButton.setAttribute("aria-label", closeLabel);
  let closed = false;
  const close = (restore = true) => {
    if (closed) return;
    closed = true;
    stopHass();
    window.removeEventListener("location-changed", navigation);
    window.removeEventListener("popstate", navigation);
    window.removeEventListener("hashchange", navigation);
    onClose?.();
    host.remove();
    coordinator.remove(entry, restore);
  };
  // HA more-info adds history entries too. Only a changed dashboard route
  // closes the owner drawer; dismissing an HA child must return to the drawer.
  const route = window.location.pathname + window.location.hash;
  const navigation = () => {
    if (window.location.pathname + window.location.hash !== route) close(false);
  };
  closeButton.addEventListener("click", () => { if (coordinator.isTop(entry)) close(); });
  root.querySelector(".backdrop").addEventListener("click", () => { if (coordinator.isTop(entry)) close(); });
  for (const name of ["click", "pointerdown", "pointerup", "keydown", "keyup"]) host.addEventListener(name, event => event.stopPropagation());
  document.body.append(host);
  const entry = { kind: "drawer", panel, initialFocus: closeButton, restoreTarget: trigger, close };
  const stopHass = observeHassDialogs(coordinator);
  coordinator.push(entry);
  window.addEventListener("location-changed", navigation);
  window.addEventListener("popstate", navigation);
  window.addEventListener("hashchange", navigation);
  return {
    host, root, panel, content, close,
    update({ title: nextTitle, closeLabel: nextCloseLabel, themeSource }) {
      heading.textContent = nextTitle;
      closeButton.setAttribute("aria-label", nextCloseLabel);
      const style = getComputedStyle(themeSource);
      host.style.cssText = "";
      for (let i = 0; i < style.length; i++) {
        const name = style.item(i);
        if (name.startsWith("--")) host.style.setProperty(name, style.getPropertyValue(name));
      }
    }
  };
};
