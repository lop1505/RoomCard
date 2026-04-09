# Changelog

All notable changes to OneLine Room Card are documented here.

---

## [1.2.4]

* Runtime: **Climate Inline Slider** — `control_mode: slider` now works for `climate` entities. Drag to set the target temperature; the button state shows current → setpoint and updates live while dragging. Closes [#44](https://github.com/lop1505/RoomCard/issues/44).
* Runtime: **Window Sensor Chip Colors** — window/door sensor chips in the header support custom colors for open and closed states, plus an option to always show the chip even when closed. Closes [#49](https://github.com/lop1505/RoomCard/issues/49).
* Runtime: **State-Dependent Button Colors (`color_map`)** — buttons can automatically change icon color and background based on the entity's current state.
* Runtime: **Configurable Icon Size** — set `icon_size` per button or `global_icon_size` as a card-level default (in px). Closes [#48](https://github.com/lop1505/RoomCard/issues/48).
* Runtime: **Light Color Favorites** — tap-to-set color swatches on light buttons. Define up to N favorite colors per button; the active color is highlighted automatically. Closes [#40](https://github.com/lop1505/RoomCard/issues/40).
* Runtime: **Header Position Sliders** — drag the header info line (temp/humidity/badges) and the title left, center, or right with sliders. A new **Synchronize Positions** toggle lets you link them together. The info line now also prevents text wrapping to maintain a clean layout. Closes [#47](https://github.com/lop1505/RoomCard/issues/47).
* Runtime: **CSS Custom Properties for Buttons** — expose `--rc-btn-bg` and `--rc-icon-color` for advanced `card-mod` styling. Closes [#46](https://github.com/lop1505/RoomCard/issues/46).
* Runtime: **Cover Position Presets** — tap-to-set preset buttons for covers/blinds (default: 0%, 50%, 100%), configurable per button. Active position highlighted automatically. Closes [#41](https://github.com/lop1505/RoomCard/issues/41).
* Runtime: **Climate Temperature Presets** — tap-to-set temperature presets for thermostats. Supports fixed values, `auto` (HVAC mode) and `max` (entity's max temperature). Active preset highlighted automatically.
* Editor UX: **Dedicated Buttons Tab** — button configuration (Quick Add, bulk toggle, individual buttons) is now on its own **Buttons** tab, keeping **Konfiguration** focused on card and header settings. Closes [#42](https://github.com/lop1505/RoomCard/issues/42).
* Editor UX: **Redesigned General Settings** — the "General" section is now split into **Card Behavior** (name, live preview, collapsible) and **Header** (height, typography, icon, image), each collapsible independently. Closes [#43](https://github.com/lop1505/RoomCard/issues/43).
* Editor UX: **Merged Sensors Section** — "Sensors (Manual)" and "Batteries (List)" are now a single collapsible **Sensors** section with a unified badge count.
* Editor UX: **Fixed Expand/Collapse All Buttons** — the `><` bulk toggle now correctly tracks open/closed state for all button entries.

---

## [1.2.3]

* Editor UX: **Header Typography** section — customize the room name and info line font settings (size, weight, style, color) without CSS.
* Runtime: Expose header fonts as CSS Custom Properties (`--rc-header-name-size`, `--rc-header-info-size`, etc.) for advanced `card-mod` usage.

---

## [1.2.2]

* Config: `header_height` — set the header image area height in pixels (default: 120). Set to `0` to fully hide the header image.
* Editor UX: New **Header Height (px)** number field in General settings.

---

## [1.2.1]

* Runtime: **Collapsible card** — toggle the button grid by clicking the header image. State persists across reloads via `localStorage`.
* Config: `collapsible: true` enables the feature; `default_state: collapsed` starts the card folded.
* Editor UX: New **Collapsible** toggle and **Default State** dropdown in General settings.

---

## [1.2.0]

* Runtime: **Inline Slider Controls** — add a brightness slider directly on light buttons, or a position slider on cover buttons (`control_mode: slider`).
* Runtime: **Inline Cover Buttons** — add Open / Stop / Close buttons directly on cover tiles (`control_mode: buttons`).
* Editor UX: New **Control Mode** dropdown per button (Default / Inline Slider / Inline Buttons).

---

## [1.1.1]

* Runtime: **Dynamic state icons** — buttons automatically show state-dependent icons for common domains (Light, Switch, Fan, Lock, Cover, Media Player). No configuration needed for new buttons; existing buttons with a manually set icon are unaffected.
* Runtime: Custom `icon_map` per button for explicit per-state icon overrides (highest priority, supports YAML `on`/`off` boolean keys automatically).
* Runtime: **Custom header badges** in the info line with per-badge label toggle and optional `rgba(...)` background.
* Runtime: Built-in main climate header info supports optional `rgba(...)` badge background (`header_info_background`).
* Editor UX: Quick Add type selector no longer resets visually on HA state updates. Closes [#32](https://github.com/lop1505/RoomCard/issues/32).
* Fix: Removed `MigrationWarningCard` / `room-card` alias to prevent conflicts with other custom cards using the same element name.

---

## [1.1.0]

* Runtime: Improved handling for `unavailable` / `unknown` entities — dimmed controls, offline indicator, blocked actions.
* Runtime: Header icon uses the same dynamic state-based color logic as buttons.
* Runtime: Header icon supports Force Color override with safe fallback to dynamic/theme color.
* Editor UX: New **Live preview** toggle (enabled by default).
* Performance: Internal state-signature caching reduces unnecessary DOM/UI updates.
* Internal: Centralized state definitions for active/offline checks — no user config change required.

---

## [1.0.9]

* Runtime: High-humidity warning chip and blue card outline with configurable threshold (`humidity_warning_threshold`, default `60`).
* Runtime: Label/status position modes — **right / left / top / bottom** — with per-button `label_position` and global `global_label_position`.
* Runtime: Battery and humidity warnings now highlight the card outline.
* Editor UX: Quick Add accordion to add buttons from existing entity types.
* Editor UX: Collapsible sections for Image, Manual Sensors, and Battery list.
* Editor UX: Drag & drop reordering plus bulk expand/collapse button settings.
* Fix: Editing a button no longer collapses entries or jumps the editor scroll.
