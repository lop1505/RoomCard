# Changelog

All notable changes to OneLine Room Card are documented here.

## [Unreleased]

* Build: Introduce pinned esbuild 0.28.2 as the first isolated step toward #100. Keep runtime/editor behavior and the single-file HACS delivery unchanged; verify a fresh reproducible build, registration order, explicit helper test imports, and adjacent room-image assets. Source extraction and the Room Detail Drawer remain gated follow-up work for v1.5.0.

---

## [1.4.0]

* Localization: Complete missing French visibility, sub-chip, and climate-button labels; correct the German template-state key. Add automated translation-key parity, non-empty value, placeholder, and language-fallback checks for English, German, and French.
* Bugfix: Restore header images for cards initialized before dashboard attachment, including existing presets, custom URLs, and uploads without adaptive rules. Refresh the selected image on reconnection while retaining stale-load protection; cover returning to the default and removing the last image rule with regression tests.
* Runtime & Editor: Add configurable `status_groups` for neutral room summaries such as lights on, open windows, active media, or combined power. Count and numeric modes track only explicit entities, normalize compatible power units, reject incompatible sums, and can open an accessible contributor list with Home Assistant more-info. Closes [#126](https://github.com/lop1505/RoomCard/issues/126).
* Runtime & Editor: Add ordered `adaptive_images` rules for condition-based header backgrounds. The first valid match selects a custom/uploaded image or bundled preset with its own focal point; state, numeric, time, user, screen, and compound conditions update safely while the existing image remains the fallback. Closes [#125](https://github.com/lop1505/RoomCard/issues/125).
* Runtime & Editor: Add opt-in `sparkline_detail` for sensor controls. Interactive sparklines now open an accessible 6h/24h/7d history dialog with the current Home Assistant-formatted value and Min/Max/Average statistics, while preserving parent control actions and shared request caching. Closes [#123](https://github.com/lop1505/RoomCard/issues/123).
* Runtime & Editor: Add ordered, horizontally scrollable `room_modes` shortcuts for scenes and scripts. Optional nested state/numeric conditions highlight active modes, missing entities are disabled, and the mode strip remains available while room controls are collapsed. Closes [#124](https://github.com/lop1505/RoomCard/issues/124).
* Reliability & Accessibility: Refresh templates for arbitrary dependency-attribute changes, keep template sub-chips live, preserve media-control focus, remove collapsed controls from the tab order, expose a separate collapse button when the header has another action, and rebuild already-open editors after bundle upgrades.
* Runtime: Split full media-player controls into separate transport and volume rows, add Previous, respect `supported_features`, and keep artwork square on compact cards. Closes [#102](https://github.com/lop1505/RoomCard/issues/102).
* Accessibility: Add keyboard activation, ARIA state and labels, visible focus, semantic inline controls, and modal focus management for the alert dialog. Closes [#97](https://github.com/lop1505/RoomCard/issues/97).
* Runtime & Editor: Add a draggable and keyboard-adjustable header-image focal point through `image_position`, with safe validation and centered defaults. Closes [#103](https://github.com/lop1505/RoomCard/issues/103).
* Editor: Validate JPEG/PNG/WebP uploads up to 20 MB, decode before upload, downscale images larger than 2560 px, preserve suitable originals, localize errors, and prevent duplicate submissions. Closes [#104](https://github.com/lop1505/RoomCard/issues/104).
* Editor: Expose the card-level `sparkline_refresh` interval with localized validation and a 60–3600 second range. Closes [#101](https://github.com/lop1505/RoomCard/issues/101).
* Runtime: Make every sensor-chip icon inherit the resolved chip text color, including solid-background and alert variants. Closes [#105](https://github.com/lop1505/RoomCard/issues/105).
* Runtime & Editor: Add `show_status_border` (default `true`) so warning outlines and glow can be disabled without hiding active sensor chips. Closes [#106](https://github.com/lop1505/RoomCard/issues/106).
* Security: Render entity-derived labels, states, alert chips, modes, and sub-chips through DOM text APIs. Template content is text-only by default with an explicit `trusted_html: true` compatibility opt-in, and the JavaScript-template trust boundary is documented. Closes [#95](https://github.com/lop1505/RoomCard/issues/95).
* Performance: Track literal or declared template dependencies, skip unchanged template DOM work, share and bound sparkline history requests/cache across cards, and pause polling for hidden or off-screen cards. Closes [#98](https://github.com/lop1505/RoomCard/issues/98).
* CI: Document the manual release checklist, make syntax/release/test checks explicit, and add regression coverage for tag/version consistency. Closes [#99](https://github.com/lop1505/RoomCard/issues/99).
* Developer documentation: Select and gate the future single-artifact build approach, record modularization failure modes, and add a manual Home Assistant smoke-test matrix as the first deliverable for [#100](https://github.com/lop1505/RoomCard/issues/100).

---

## [1.3.1]

* Runtime & Editor: Add 16 bundled room-image presets with a visual thumbnail picker. Find them under **Configuration → Header → Image → Built-in room image**. Existing `image` URLs and Home Assistant uploads remain fully supported and take precedence over `image_preset` in YAML. HACS now installs the card and its optimized image assets together from `dist/`. Closes [#107](https://github.com/lop1505/RoomCard/issues/107).
* Runtime: Invalidate cached render snapshots when Home Assistant display precision, units, device class, locale number format, locale language, or unit-system metadata changes. Formatted sensor states, header badges, temperature, humidity, and climate values now update immediately even when the underlying entity state is unchanged. Fixes [#108](https://github.com/lop1505/RoomCard/issues/108).

---

## [1.3.0]

* Editor: Keep text and number inputs visible and editable on a cold Home Assistant dashboard load when the internal `ha-textfield` component has not been registered yet. The editor now uses a compatibility wrapper that supports the current `ha-input`, the legacy `ha-textfield`, and a native fallback. Fixes [#92](https://github.com/lop1505/RoomCard/issues/92).
* Runtime & Editor: Format sensor states and climate attributes with Home Assistant's locale-aware display helpers, so configured numeric precision and units are respected. Header text and sensor-chip shadows can now be disabled independently with `show_header_text_shadow: false` and `show_chip_shadow: false`. Fixes [#91](https://github.com/lop1505/RoomCard/issues/91).
* Documentation: Correct the template-control syntax from Jinja2 to JavaScript `${…}` expressions, document the available helpers, and add a working YAML example. Fixes [#90](https://github.com/lop1505/RoomCard/issues/90).
* Runtime & Editor: Add an optional per-card `temp_unit` override (`°C` or `°F`) in the visual Sensors editor. Header temperatures, climate-button states, live slider labels, and climate preset labels are converted for display without changing the values sent to Home Assistant services. Fixes [#89](https://github.com/lop1505/RoomCard/issues/89).
* Runtime & Editor: Make the presence chip color configurable with `presence_chip_color` and add `presence_solid_background` for a full-color chip with automatically selected readable text and icon colors. Both options are available next to the presence sensor in the visual editor. Fixes [#88](https://github.com/lop1505/RoomCard/issues/88).

---

## [1.2.9]

* Runtime & Editor: **Window Labels and Solid Backgrounds** — Window/door chips now support per-entity custom labels via `window_labels` and an optional `window_solid_background` mode for full-color chips with readable text contrast. Added visual editor controls under *Sensors* and documented the YAML options. Closes [#84](https://github.com/lop1505/RoomCard/issues/84).
* Runtime & Editor: **Manual Sensor Labels** — Presence, temperature, target temperature and humidity sensors now support optional custom labels (`presence_sensor_label`, `temp_sensor_label`, `target_temp_sensor_label`, `humid_sensor_label`) directly below their entity pickers in the Sensors editor.

---

## [1.2.8]

* Runtime & Editor: **Header Image Grayscale by Light State** — Restored the `image_entity` option (regressed in 1.2.6). When the configured light/switch/input_boolean/group is off, the header image fades to grayscale with a smooth 0.8 s transition. Configurable in the editor under the *Image* section. Re-closes [#66](https://github.com/lop1505/RoomCard/issues/66).
* Runtime & Editor: **Climate HVAC & Fan Speed Chips** — New per-button options `show_hvac_modes` and `show_fan_modes` for `climate` entities. When enabled, render tappable chips below the button using the entity's `attributes.hvac_modes` / `attributes.fan_modes` lists. Tapping calls `climate.set_hvac_mode` / `climate.set_fan_mode` directly. The currently active mode is highlighted. HVAC chips include matching MDI icons (off/auto/heat/cool/heat_cool/dry/fan_only). Editor: two switches in the *Climate* row of the button editor. Closes [#81](https://github.com/lop1505/RoomCard/issues/81).
* Runtime & Editor: **Hide Background Image** — New card-level option `show_image` (default `true`). When set to `false`, the header `<img>` and the placeholder `#444` background are hidden, and the dark overlay gradient drops, so the room name, icon, badges, chips and collapse button stay visible on a transparent header — useful for compact / minimal dashboards. Editor: new *Show background image* switch in the *Image* section. Closes [#82](https://github.com/lop1505/RoomCard/issues/82).
* Runtime & Editor: **Configurable Alert Sensors** — Restored the `alert_sensors` list plus `alert_chip_mode` and `alert_border_color` (regressed in 1.2.6). Configure sensors with `state`, `above`, or `below` thresholds; when active they appear as red header chips and the card outline turns red (color customizable). `alert_chip_mode: collapsed` collapses all active alerts into a single count badge that opens a list dialog on click. Editor section under *Sensors*. Re-closes [#57](https://github.com/lop1505/RoomCard/issues/57).
* Editor UX: **Area-Based Auto-Setup** — Restored the *Area Setup* section at the top of the *Configuration* tab (regressed in 1.2.6). Pick a Home Assistant area, click *Generate from Area* and the card auto-populates the climate entity, controls (light/switch/cover/fan/media_player/lock), temperature/humidity sensors, window/door sensors and battery sensors. Devices in the area are walked via `device_registry` + `entity_registry`. Existing controls are preserved — generated buttons are appended. Re-closes [#54](https://github.com/lop1505/RoomCard/issues/54).
* Runtime & Editor: **Sensor Sparklines on Buttons** — Restored the per-button `show_sparkline` option (regressed in 1.2.6) for `sensor` entities. Toggle the switch in the button row and optionally set `sparkline_hours` (1-168, default 24) to control the history range. Card-level `sparkline_refresh` (60-3600 s, default 300) controls the auto-refresh cadence. Re-closes [#55](https://github.com/lop1505/RoomCard/issues/55).
* Runtime & Editor: **Presence Indicator Chip** — Restored the `presence_sensor` option (regressed in 1.2.6). When the configured person / binary_sensor / device_tracker is active (`on`, `home`, `active`, `detected`), a green chip with the entity's friendly name appears in the header info line. Configurable in the editor under the *Sensors* section.

---

## [1.2.7]

* Runtime & Editor: **Show Brightness % on Light Buttons** — Light entities now display the current brightness percentage next to the on/off state (e.g. `on · 75 %`). The value updates live while dragging the inline slider. Configurable per button via `show_brightness_value` (default: `true`). Closes [#78](https://github.com/lop1505/RoomCard/issues/78).
* Performance: **Light-Only Editor Toggles** — Removed expensive full re-render (`renBtn()`) from brightness value, brightness presets, and color favorites toggles. These switches now respond instantly.
* Bugfix & Redesign: **Media Player Controls independently selectable** — `control_mode: slider` shows only volume, `control_mode: buttons` only transport. Default (no mode set) renders the new combined layout: album-art thumbnail, mute toggle with unmute restore, inline volume slider with live percentage, and transport buttons (play/pause, next). Media title is always displayed. Removed non-functional source/sound-mode chips and obsolete editor toggles. Closes [#79](https://github.com/lop1505/RoomCard/issues/79).
* Runtime: **Select / Input Select Inline Dropdown & Chips** — `select` and `input_select` entities now display a native dropdown inside the button by default. With `control_mode: buttons`, prev/next arrows allow cycling through options. With `control_mode: full` ("Alle Optionen"), all options are shown as tappable chips with the active one highlighted. `control_mode: slider` is hidden in the editor for select entities. Closes [#77](https://github.com/lop1505/RoomCard/issues/77).

---

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
