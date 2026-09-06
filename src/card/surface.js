import { getTranslation } from "../i18n/translations.js";

// Static package-owned scaffold. Each render context gets independent nodes.
export const getRoomSurfaceMarkup = (hass) => `
      <style>
        ha-card { position: relative; overflow: hidden; border-radius: 16px; background: none; border: none; cursor: default; }
        ha-card.warning-battery { outline: 2px solid var(--error-color, #d32f2f); outline-offset: -2px; }
        ha-card.warning-humidity { outline: 2px solid var(--info-color, #2196F3); outline-offset: -2px; box-shadow: 0 0 0 2px rgba(33,150,243,0.35), 0 0 12px rgba(33,150,243,0.35), 0 0 22px rgba(33,150,243,0.25); }
        ha-card.alert-sensor { outline: 2px solid var(--rc-alert-border-color, var(--error-color, #d32f2d)); outline-offset: -2px; box-shadow: 0 0 0 2px rgba(211,47,47,0.15); }
        .container { display: flex; flex-direction: column; background: var(--ha-card-background, rgba(255,255,255,0.1)); border-radius: 16px; }
        .img-box { position: relative; width: 100%; height: 120px; overflow: hidden; border-radius: 16px 16px 0 0; background: #444; cursor: pointer; }
        .img-box.no-image { background: transparent; }
        .img-box.no-image .img { display: none; }
        .img-box.no-image .overlay { background: none; position: relative; }
        .img { width: 100%; height: 100%; object-fit: cover; display: block; transition: filter 0.8s ease; }
        .img.grayscale { filter: grayscale(100%) brightness(0.6); }
        .overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 12px; box-sizing: border-box; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); display: flex; align-items: center; gap: 12px; }
        .text { display: flex; flex: 1; min-width: 0; flex-direction: column; align-items: flex-start; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
        ha-card.no-header-text-shadow .text { text-shadow: none; }
        ha-icon { color: var(--icon-color, white); }
        .primary { display: block; max-width: 100%; font-weight: var(--rc-header-name-weight, bold); font-size: var(--rc-header-name-size, 14px); font-style: var(--rc-header-name-style, normal); color: var(--rc-header-name-color, white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .secondary { max-width: 100%; min-width: 0; font-weight: var(--rc-header-info-weight, normal); font-size: var(--rc-header-info-size, 12px); font-style: var(--rc-header-info-style, normal); color: var(--rc-header-info-color, white); opacity: 0.9; display: flex; flex-wrap: nowrap; gap: 6px; align-items: center; overflow: hidden; }
        .info-item { display: inline-flex; align-items: center; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .info-item.badge { padding: 2px 6px; border-radius: 999px; }
        .chips { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 2; }
        .chip { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border: 0; border-radius: 8px; font-family: inherit; font-size: 11px; font-weight: bold; background: #FFF8E1; color: #FFA000; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .chip.status-group-chip { background:rgba(var(--rgb-primary-color, 3,169,244),.14); color:var(--primary-color, #03a9f4); }
        button.chip.status-group-chip { cursor:pointer; }
        button.chip.status-group-chip:focus-visible { outline:2px solid var(--primary-color, #03a9f4); outline-offset:2px; }
        .chip ha-icon { color: currentColor; }
        ha-card.no-chip-shadow .chip { box-shadow: none; }
        .chip.alert { background: #FFEBEE; color: #D32F2F; }
        .chip.humidity { background: #E3F2FD; color: #1976D2; }
        .chip.info { background: #E3F2FD; color: #1976D2; }
        .chip.custom { background: var(--chip-bg); color: var(--chip-color); }
        .controls { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; }
        .btn.has-sparkline { height: auto; align-items: stretch; overflow: visible; flex-wrap: wrap; padding-bottom: 6px; }
        .btn-sparkline { width: 100%; flex: 0 0 100%; order: 99; align-self: stretch; min-height: 28px; margin-top: 6px; display: flex; align-items: center; padding: 4px 6px; border: 0; border-radius: 12px; color: inherit; font: inherit; background: rgba(255,255,255,0.06); box-sizing: border-box; }
        button.btn-sparkline { cursor: pointer; }
        button.btn-sparkline:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
        .btn-sparkline svg { width: 100%; height: 22px; display: block; overflow: visible; }
        .btn-sparkline polyline { fill: none; vector-effect: non-scaling-stroke; }
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
        .btn:focus-visible, button:focus-visible, select:focus-visible, input:focus-visible, .img-box:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
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
        .cover-action-btn { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; background: rgba(128,128,128,0.1); border: 0; color: inherit; font: inherit; border-radius: 6px; padding: 4px 6px; cursor: pointer; transition: background 0.15s; touch-action: manipulation; }
        .cover-action-btn:hover { background: rgba(128,128,128,0.22); }
        .cover-action-btn ha-icon { --mdc-icon-size: 16px; color: var(--primary-text-color); }
        .media-transport-row, .media-volume-row { display: flex; align-items: center; gap: 6px; width: 100%; flex: 0 0 auto; }
        .media-transport-row { justify-content: center; padding-top: 2px; }
        .media-volume-row { padding: 2px 0 4px; }
        .media-ctrl-btn { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: inherit; cursor: pointer; transition: background 0.15s; touch-action: manipulation; }
        .media-ctrl-btn:hover { background: rgba(128,128,128,0.18); }
        .media-ctrl-btn ha-icon { --mdc-icon-size: 19px; color: var(--primary-text-color); }
        .media-ctrl-btn.muted ha-icon { color: var(--secondary-text-color); }
        .media-volume-row .btn-slider-wrap { flex: 1; min-width: 0; padding: 0; }
        .media-volume-row .btn-slider { height: 4px; }
        .media-volume-row .vol-label { font-size: 10px; font-weight: 600; color: var(--secondary-text-color); min-width: 32px; text-align: center; flex: 0 0 auto; }
        .media-thumb { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
        .media-full-layout { display: flex; gap: 10px; width: 100%; align-items: stretch; }
        .media-full-layout .media-thumb { width: 72px; height: 72px; aspect-ratio: 1; border-radius: 6px; align-self: center; object-fit: cover; }
        .media-full-layout .media-right { display: flex; flex-direction: column; flex: 1; min-width: 0; justify-content: center; gap: 2px; }
        .btn-cover-presets { display: flex; gap: 4px; width: 100%; flex: 0 0 auto; padding-bottom: 4px; }
        .preset-btn { flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(128,128,128,0.1); border: 0; border-radius: 6px; padding: 3px 4px; cursor: pointer; transition: background 0.15s, color 0.15s; font: inherit; font-size: 11px; font-weight: 600; color: var(--secondary-text-color); white-space: nowrap; touch-action: manipulation; }
        .preset-btn:hover { background: rgba(128,128,128,0.22); color: var(--primary-text-color); }
        .preset-btn.active { background: var(--icon-color, var(--primary-color, #ff9800)); color: #fff; }
        .btn-select-dropdown { width: 100%; padding-bottom: 4px; }
        .btn-select-dropdown select { width: 100%; padding: 4px 8px; border-radius: 6px; border: none; background: rgba(128,128,128,0.12); color: var(--primary-text-color); font-size: 12px; font-weight: 500; cursor: pointer; appearance: auto; outline: none; touch-action: manipulation; }
        .btn-select-dropdown select:focus { box-shadow: 0 0 0 1px var(--icon-color, var(--primary-color, #ff9800)); }
        .btn-select-options { flex-wrap: wrap; }
        .btn-select-options .preset-btn { flex: 0 1 auto; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .btn-color-favorites { display: flex; gap: 6px; width: 100%; flex: 0 0 auto; padding-bottom: 4px; flex-wrap: wrap; }
        .color-swatch { width: 20px; height: 20px; padding: 0; border-radius: 50%; cursor: pointer; flex-shrink: 0; border: 2px solid transparent; transition: transform 0.15s, border-color 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.25); touch-action: manipulation; }
        .color-swatch:hover { transform: scale(1.2); }
        .color-swatch.active { border-color: var(--primary-text-color); transform: scale(1.15); }
        .controls { transition: max-height 0.35s ease, padding 0.35s ease; overflow: hidden; max-height: 2000px; }
        .controls.collapsed { max-height: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }
        .collapse-btn { position: absolute; bottom: 8px; right: 8px; z-index: 3; width: 28px; height: 28px; padding: 0; border: 0; border-radius: 50%; background: rgba(0,0,0,0.38); display: none; align-items: center; justify-content: center; cursor: pointer; }
        .collapse-btn ha-icon { --mdc-icon-size: 18px; color: white; transition: transform 0.35s ease; }
        .collapse-btn.open ha-icon { transform: rotate(180deg); }
        .details-btn { position:absolute; top:8px; right:8px; z-index:3; min-width:44px; min-height:44px; padding:8px 12px; border:0; border-radius:12px; background:rgba(0,0,0,.55); color:white; font:inherit; cursor:pointer; }
        .details-btn[hidden] { display:none; }
        .details-btn:focus-visible { outline:2px solid var(--primary-color,#03a9f4); outline-offset:2px; }
        .btn-chips { display: flex; flex-direction: row; flex-wrap: wrap; gap: 2px; align-items: center; max-width: 100%; margin-top: 2px; }
        .btn-chips.chips-top { margin-top: 0; margin-bottom: 2px; }
        .btn.has-inline-ctrl .btn-chips { margin-top: 4px; padding-bottom: 2px; }
        .btn.has-inline-ctrl .btn-chips.chips-top { margin-top: 0; margin-bottom: 4px; padding-bottom: 0; padding-top: 2px; }
        .btn-chip { display: inline-flex; align-items: center; gap: 2px; padding: 2px 5px; background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12); color: var(--secondary-text-color, rgba(0,0,0,0.6)); border-radius: 6px; max-width: 100%; box-sizing: border-box; }
        .btn-chip span { font-size: 9px; line-height: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .btn-chip ha-icon { --mdc-icon-size: 11px; }
        .info-bar { display: none; flex-wrap: nowrap; gap: 6px; padding: 4px 12px 6px; align-items: center; overflow: hidden; font-size: var(--rc-header-info-size, 12px); font-weight: var(--rc-header-info-weight, normal); font-style: var(--rc-header-info-style, normal); color: var(--rc-header-info-color, var(--secondary-text-color)); }
        .info-bar.active { display: flex; }
        .room-modes { display: flex; gap: 7px; padding: 8px 10px; overflow-x: auto; overflow-y: hidden; scrollbar-width: thin; overscroll-behavior-inline: contain; border-top: 1px solid var(--divider-color, rgba(128,128,128,.18)); }
        .room-modes:empty { display: none; }
        .room-mode { flex: 0 0 auto; min-height: 34px; display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border: 1px solid var(--divider-color, rgba(128,128,128,.25)); border-radius: 999px; color: var(--primary-text-color); background: rgba(128,128,128,.08); font: inherit; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer; touch-action: manipulation; }
        .room-mode ha-icon { --mdc-icon-size: 18px; color: var(--room-mode-color, var(--primary-color)); }
        .room-mode.active { color: var(--text-primary-color, #fff); background: var(--room-mode-color, var(--primary-color)); border-color: var(--room-mode-color, var(--primary-color)); }
        .room-mode.active ha-icon { color: currentColor; }
        .room-mode:disabled { opacity: .45; cursor: not-allowed; }
        .room-mode:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
        @media (max-width: 480px) {
          .media-full-layout { gap: 8px; }
          .media-full-layout .media-thumb { width: 60px; height: 60px; }
          .media-ctrl-btn { width: 30px; height: 30px; }
        }
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
            <button id="collapse-btn" class="collapse-btn" type="button"><ha-icon icon="mdi:chevron-down"></ha-icon></button>
            <button id="details-btn" class="details-btn" type="button" hidden></button>
          </div>
          <div id="info-bar" class="info-bar"></div>
          <div id="room-modes" class="room-modes" role="group" aria-label="${getTranslation(hass, "room_modes")}"></div>
          <div id="ctrls" class="controls"></div>
        </div>
      </ha-card>`;

