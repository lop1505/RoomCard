# Changelog

All notable changes to OneLine Room Card are documented here.

## [1.2.6]

* Runtime & Editor: **Select / Input Select Support** — Added `select` and `input_select` as Quick Add templates. Select-style entities can now be added from the visual editor and controlled with inline previous/next buttons via `control_mode: buttons`. Closes [#70](https://github.com/lop1505/RoomCard/issues/70).
* Runtime & Editor: **Full Media Player Controls** — Media player buttons now support `control_mode: slider` for volume, `control_mode: buttons` for transport controls, and `control_mode: full` for both. Optional source chips, sound-mode chips, and media title display can be enabled per button. Closes [#71](https://github.com/lop1505/RoomCard/issues/71).
* Runtime: **Brightness Presets for Lights** — Light buttons can now show tappable brightness chips via `show_brightness_presets: true` and `brightness_presets` (default: `[25, 50, 75, 100]`). Tapping a preset calls `light.turn_on` with `brightness_pct`, and the current brightness is highlighted. Closes [#72](https://github.com/lop1505/RoomCard/issues/72).
* Editor UX: **Brightness Presets Editor** — Added a light-only editor section for enabling brightness presets and editing comma-separated brightness values.
* Bugfix: **Color Favorites Editor Visibility** — Restored the light-only Color Favorites editor controls so `show_color_favorites` and `color_favorites` can again be configured visually. Closes [#73](https://github.com/lop1505/RoomCard/issues/73).
* Bugfix: **Sub-Chips Delete UX** — Enlarged the Sub-Chip delete hit area and replaced the expensive full button-editor rebuild with an incremental chip-list refresh. Closes [#74](https://github.com/lop1505/RoomCard/issues/74).

---

## [1.2.5]

* Runtime: **Sub-Chips on Buttons** — Buttons can now display small overlay chips (e.g. for temperature or status of custom sensors). Fully configurable with icon, attribute, and label.
* Runtime: **Sub-Chip Label + State combined** — When a sub-chip has both a `label` and a state value, both are combined in the display (e.g. "Window: open"). `{state}` in the label is still replaced directly.
* Runtime: **Sub-Chip Position** — New per-button option `chips_position: top | bottom`. Controls whether sub-chips appear above or below the button title. Applies to all chips of a button together.
* Runtime: **Conditional Visibility for Buttons** — Buttons now use the native Home Assistant conditions editor (`ha-card-conditions-editor`), identical to the visibility tab of the card itself. Supports State, Numeric State, Screen, User, Time, AND/OR/NOT, etc.
* Runtime: **Badge Background Inheritance** — Individual badges automatically inherit the global background color (default badge background) when no custom background color is defined.
* Runtime: **Info Line Position** — New option `info_line_position: header | below_header`. Controls whether the info line (temperature, humidity, badges) appears inside the header image (default) or as a separate bar between the header and button grid. Closes [#51](https://github.com/lop1505/RoomCard/issues/51).
* Editor UX: **Action configuration section** now sits under `Card Behavior` and defaults to collapsed for a cleaner editor layout.
* Editor UX: **Service Data (JSON)** support for `call-service` actions on `tap_action`, `hold_action`, and `double_tap_action`.
* Refactor Editor UI: **Simplified Manual Color Logic** — removed the `force_color` (header) and `force_color` (buttons) toggle. Manual colors are now applied automatically whenever a value is present in the `color` field. Closes [#59](https://github.com/lop1505/RoomCard/issues/59).
* Refactor Editor UI: **Unified Collapse Mode dropdown** — The separate `collapsible` toggle, `default_state` dropdown, and `remember_state` toggle have been replaced by a single **Collapse Mode** dropdown with four options: **Disabled** (card is never collapsible), **Collapsed** (starts collapsed, ignores saved state), **Expanded** (starts expanded, ignores saved state), and **Remember** (collapsible, state persisted in `localStorage`). Closes [#65](https://github.com/lop1505/RoomCard/issues/65).
* Editor UX: **Layout Reorganization** — "Badge" and "Image" sections have been moved up for better accessibility. Added a new **Layout & Position** section for header alignment and offset settings.
* Editor UX: **Transparent Button Background Shortcuts** — added Editor presets (e.g. Transparent, Subtle, Tinted) to quickly apply pre-defined background colors to buttons. Applicable locally, and globally. Closes [#64](https://github.com/lop1505/RoomCard/issues/64).
* Runtime: **Per-Button CSS Custom Property Targeting** — Buttons now render a `data-entity` attribute in the DOM, making it very easy to target specific buttons with `card-mod` (e.g., `.btn[data-entity="light.living_room"]`). Closes [#53](https://github.com/lop1505/RoomCard/issues/53).
* Editor UX: **Unified Color Picker Synchronization** — Standardized all color fields to use native pickers + hex fields with real-time synchronization. Fixed bugs where color changes were not always reflected immediately.
* Editor UX: **Fix scroll jump in button editor** — the editor dialog no longer scrolls back to the top of the button section after every config change (toggle, dropdown, text input). Closes [#68](https://github.com/lop1505/RoomCard/issues/68).
* Bugfix: **Incomplete Conditions** — Conditions without a configured entity (e.g. immediately after adding one) no longer incorrectly hide the button.
* Bugfix: **Editor Stability** — The editor re-render cycle has been completely reworked (config-signature comparison instead of fragile boolean flags), so complex editors like the conditions editor are no longer destroyed while editing.
* Bugfix: **NOT Condition** — The NOT condition now correctly evaluates a `conditions` array (instead of a single `condition` object).
* Runtime: **Color Temperature Slider for Kelvin-native lights** — `control_mode: slider` + `slider_mode: color_temp` now fully supports lights that expose `min_color_temp_kelvin` / `max_color_temp_kelvin`. The slider range, live Kelvin readout, service call, and gradient direction all work correctly for both Kelvin and legacy mired-based lights.
* Runtime: **Time Since Last Change** — New per-button option `show_last_changed: true`. Displays the elapsed time since the entity last changed state directly on the button. Format: < 60 s → "just now", < 60 min → "12 min", < 24 h → "2h 15min", ≥ 24 h → "3d". When combined with `show_state: true`, both are shown as e.g. `on · 2h`. Auto-refreshes every 60 seconds. Closes [#61](https://github.com/lop1505/RoomCard/issues/61).
* Editor UX: **"Last Changed" toggle** — New per-button toggle in the Buttons tab (alongside Show State / Show Label / Show Icon) to enable `show_last_changed` without editing YAML.
* Runtime: **Card-Level Last Activity Badge** — New card-level option `show_card_last_activity: true`. Automatically finds the most recently changed entity among all button controls and displays the elapsed time as a badge in the header info line (e.g. "5 min", "2h 15min"). Updates every 60 s. Removed the now-redundant `last_activity_entity` / `last_activity_label` editor fields.
* Runtime: **Multi-State Window/Door Sensor Support** — Window sensor chips now support arbitrary sensor domains (not just `binary_sensor`) and configurable open states via `window_open_states` (default: `["on", "open"]`). The state `on` is always implicitly included regardless of configuration, so existing `binary_sensor` window chips continue to work without any YAML changes. Per-state color overrides via `window_state_colors` (object mapping state → color). Closes [#52](https://github.com/lop1505/RoomCard/issues/52).
* Editor UX: **Window Sensor enhancements** — Entity picker for window sensors now accepts `sensor` domain. New `window_open_states` text field (comma-separated, `on` always included automatically) and `window_state_colors` key-value section in the Sensors editor.

---

## [1.2.4]

* Runtime: **Climate Inline Slider** — `control_mode: slider` now works for `climate` entities. Drag to set the target temperature; the button state shows current → setpoint and updates live while dragging. Closes [#44](https://github.com/lop1505/RoomCard/issues/44).
* Runtime & Editor: **Universal Sliders and Inline Buttons** — Major architectural update: Sliders and inline buttons are no longer artificially restricted to Lights or Covers! Select `Inline Slider` or `Inline Buttons` natively for any supporting domain (Media Player, Fan, Climate, Numbers, Lights, Covers).
* Runtime: **Background Slider Mode** — Added a highly requested `Slider Style` selector in the editor! You can now choose between the standard `Inline` slider or a sleek `Background` slider (where the entire button itself turns into a touch-enabled slider track overlaying your button's content — heavily inspired by `slider-button-card`).
* Runtime: **Smart Tap-vs-Drag Gestures** — If a button has a background slider attached, the system tracks horizontal gestures dynamically. Tapping the button still perfectly triggers standard on/off toggles, while dragging horizontally overrides the tap and fluidly controls the slider level.
* Runtime: **Color Temperature Slider for Light Buttons** — Extended `control_mode: slider` to allow setting color temperature (mireds) directly. A new dropdown "Slider Mode" lets you toggle between Brightness and Color Temperature in the editor. Includes live Kelvin value readout on drag. Closes [#56](https://github.com/lop1505/RoomCard/issues/56).
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

* Editor UX: **Action configuration section** now sits under `Card Behavior` and defaults to collapsed for a cleaner editor layout.
* Editor UX: **Service Data (JSON)** support for `call-service` actions on `tap_action`, `hold_action`, and `double_tap_action`.
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

