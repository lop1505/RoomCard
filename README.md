# OneLine Room Card

[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-%2341BDF5.svg?logo=home-assistant&logoColor=white)](https://www.home-assistant.io)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/github/v/release/lop1505/RoomCard)](https://github.com/lop1505/RoomCard/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/lop1505/RoomCard)](https://github.com/lop1505/RoomCard/stargazers)

A clean, performant, and fully visually configurable room card for Home Assistant.
Developed with a focus on stability, simple design, and maximum flexibility.

![Preview](preview.png)
![Preview](preview_dark.png)

**Collapsed**

![Preview](preview_collapsed.png)

---

## ✨ Features

**Editor**
* 🖱️ Full visual editor — no YAML required, with live preview
* 🖼️ Built-in image uploader — upload room backgrounds directly in the editor
* 🧭 Quick Add — add buttons from existing entity types in one click
* 🖱️ Drag & drop reordering, bulk expand/collapse, collapsible button entries

**Header**
* 🌡️ Smart climate integration — temperature, humidity and target temp auto-populated
* 🌍 Dynamic unit support — Celsius / Fahrenheit from HA system settings
* 🏷️ Custom header badges — any entity with optional label, name toggle and `rgba(...)` background
* 📐 Configurable header height — set in px, or `0` to hide completely
* 🎨 Header typography — font size, weight, style and color per element
* 📍 Header position sliders — drag title and info line left/right with snap points
* 🪟 Window sensor chips — custom colors for open/closed states
* 🔋 Battery warning chips — Critical / Low / Empty with card outline
* 💧 Humidity warning chip — configurable threshold with card outline
* 🗂️ Collapsible card — click header to collapse/expand, state persists

**Buttons**
* 📏 Flexible sizing — width (1/3, 1/4, …) and height per button
* 🎛️ Inline slider — brightness (light), position (cover), temperature (climate)
* 🔘 Inline cover buttons — Open / Stop / Close directly on the tile
* 🎨 Color Favorites — tap-to-set RGB swatches on light buttons
* 🌡️ Climate presets — tap-to-set temperature presets (fixed, `auto`, `max`)
* 📐 Cover position presets — tap-to-set position presets (default: 0% / 50% / 100%)
* 🎨 State-dependent colors (`color_map`) — icon color and background by entity state
* 💡 Dynamic state icons — auto icon per state for Light, Switch, Fan, Lock, Cover, Media Player
* 🎨 Custom icon map (`icon_map`) — per-state icon overrides
* 📐 Configurable icon size — per button or global default
* 🧼 Show/hide state, label, icon per button
* � Sensor sparklines — `show_sparkline: true` enables a small history line chart on sensor buttons with configurable `sparkline_hours`
* �🕐 Time since last change — `show_last_changed: true` shows elapsed time on the button (e.g. "2h 15min"), combined with state as "on · 2h"
* ↕️ Label position — Right / Left / Top / Bottom per button and global default
* 👆 Configurable actions — Tap / Hold / Double Tap per button
* 🧩 Action service payloads — `call-service` actions now support inline `service_data` JSON in the visual editor
* 📂 Nested Card Behavior actions — action settings are grouped under `Card Behavior` and default to collapsed
* 🎯 Button visibility toggle
* 📴 Unavailable / offline handling — dimmed, non-interactive, with indicator

**Advanced**
* 🖌️ CSS Custom Properties — `--rc-btn-bg`, `--rc-icon-color` for `card-mod` styling
* 📝 Template buttons — arbitrary HTML content, icon, color and state via Jinja2
* ⚡ Vanilla JS, no external dependencies — fast load, no build step

---

## 📥 Installation

### Via HACS (Recommended)
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=lop1505&repository=RoomCard&category=plugin)

Or manually: HACS → Frontend → ⋮ → Custom repositories → paste URL → Category: Lovelace.

### Manual
1. Download `room-card.js` from the [latest release](https://github.com/lop1505/RoomCard/releases)
2. Copy to `/config/www/`
3. Add resource: URL `/local/room-card.js` · Type: JavaScript Module

---

## ⚙️ Configuration

Add the card via **"Add Card"** → select **OneLine Room Card**. The visual editor
covers all settings — no YAML required.

### Key YAML options

#### Card level
| Option | Default | Description |
|---|---|---|
| `name` | — | Room name |
| `entity` | — | Main entity (drives header icon color) |
| `image` | — | Header background image URL |
| `header_height` | `120` | Header image height in px (`0` = hidden) |
| `collapsible` | `false` | Enable click-to-collapse on header |
| `default_state` | `expanded` | `expanded` · `collapsed` |
| `tap_action` | — | Card tap action (e.g. `navigate`) |
| `hold_action` | `none` | Card hold action |
| `double_tap_action` | `none` | Card double tap action |
| `global_label_position` | `right` | Default label position for all buttons |
| `global_icon_size` | `20px` | Default icon size for all buttons |
| `global_button_background` | — | Default button background (e.g. `rgba(0,0,0,0)`) |
| `show_card_last_activity` | `false` | Show a header badge with elapsed time since the most recently changed button entity (e.g. `5 min`, `2h 15min`). Auto-refreshes every 60 s. |
| `sparkline_refresh` | `300` | Global refresh interval for sensor button sparklines in seconds. |

#### Sensors & chips
| Option | Default | Description |
|---|---|---|
| `temp_sensor` | — | Temperature sensor (overrides climate) |
| `target_temp_sensor` | — | Target temperature sensor |
| `humid_sensor` | — | Humidity sensor (overrides climate) |
| `humidity_warning_threshold` | `60` | Humidity warning threshold (%) |
| `window_sensors` | — | List of window/door sensors (`binary_sensor` or `sensor` domain) |
| `window_always_show` | `false` | Show chip even when closed |
| `window_open_color` | `#FFA000` | Chip color when open |
| `window_closed_color` | `#9E9E9E` | Chip color when closed |
| `window_open_states` | `["on","open"]` | List of state values treated as "open" (e.g. `["offen","gekippt"]` for custom sensors). `on` is always included automatically for backward compatibility. |
| `window_state_colors` | — | Per-state color overrides, e.g. `{ offen: "#FFA000", gekippt: "#FFD740" }` |
| `battery_sensors` | — | List of battery sensors |

#### Buttons (`controls`)
| Option | Default | Description |
|---|---|---|
| `entity` | — | Entity ID |
| `name` | — | Display label |
| `width` | `15` | Relative width (1–60) |
| `height` | `60` | Height in px |
| `control_mode` | — | `slider` · `buttons` (covers only) |
| `color_map` | — | Per-state icon color map |
| `icon_map` | — | Per-state icon map |
| `show_cover_presets` | `false` | Show cover position preset chips |
| `cover_presets` | `[0,50,100]` | Position preset values |
| `show_climate_presets` | `false` | Show climate temperature preset chips |
| `climate_presets` | — | Temperature preset values |
| `show_color_favorites` | `false` | Show light color favorite swatches |
| `color_favorites` | — | List of `#hex` or `r,g,b` colors |
| `show_state` | `true` | Show entity state text on button |
| `show_sparkline` | `false` | Show a sparkline history chart on sensor buttons. |
| `sparkline_hours` | `24` | History range in hours for the sensor sparkline. |
| `show_last_changed` | `false` | Show elapsed time since last state change (e.g. `2h 15min`). Combined with `show_state` renders as `on · 2h`. Auto-refreshes every 60 s. |
| `tap_action` | `more-info` | `toggle` · `more-info` · `none` |
| `hold_action` | `toggle` | — |
| `double_tap_action` | `none` | — |

## 🎨 Background Settings

The button background can be customized on two levels. The specific per-button setting overrides the global setting, which in turn overrides the default theme background.

```yaml
# Card-level default for all buttons
global_button_background: rgba(0,0,0,0)       # e.g., fully transparent

# Per-button override
controls:
  - entity: light.living_room
    button_background: rgba(128,128,128,0.18) # e.g., slightly tinted
```

Priority: `button_background` (per button) > `global_button_background` (all buttons) > *theme default*

---


## 🔧 CSS Custom Properties

Override via `card-mod` for advanced theming:

```yaml
card_mod:
  style: |
    ha-card {
      --rc-btn-bg: rgba(0,0,0,0);        /* button background */
      --rc-icon-color: white;             /* all icon colors */
    }
```

Per-button targeting via `data-entity` attribute (set on each `.btn` element):
```yaml
card_mod:
  style: |
    .btn[data-entity="light.living_room"] {
      --rc-btn-bg: rgba(255, 0, 0, 0.5) !important;
      --rc-icon-color: gold !important;
    }
```

---

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

---

## ☕ Support

If you enjoy this card, consider [buying me a coffee](https://www.buymeacoffee.com/OneLine1505)!
