# OneLine Room Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/github/v/release/lop1505/RoomCard)](https://github.com/lop1505/RoomCard/releases)

A clean, performant, and fully visually configurable room card for Home Assistant.
Developed with a focus on stability, simple design, and maximum flexibility.

![Preview](preview.png)
![Preview](preview_dark.png)

## ⚠️ Important: Renaming / Migration
To ensure compatibility and avoid conflicts with other cards, this card has been renamed.
* **Old Type:** `custom:room-card`
* **New Type:** `custom:oneline-room-card`

If you are updating from an older version, please update your YAML configuration. The old type will show a migration warning.

## ✨ Features

* 🖱️ **Full Visual Editor:** No YAML required. The optimized editor ensures smooth configuration without focus loss.
* 📱 **Responsive Flex Layout:** Buttons intelligently wrap on smaller screens (Mobile/Tablet) while maintaining your preferred relative widths. No more cut-off content!
* 🌡️ **Smart Climate Integration:** Optionally select a main climate device (e.g., Tado, Netatmo) to automatically display temperature and humidity in the header.
* 🌍 **Dynamic Unit Support:** Automatically adapts to your Home Assistant system settings (Celsius, Fahrenheit).
* 🧭 **Label & Status Position:** Choose where label/status appear (**Right / Left / Top / Bottom**) per button, with a global default.
* 📏 **Flexible Sizing:** Buttons can take up 1/3, 1/4, 1/5, etc. of the width. Important buttons can be taller, others smaller.
* 🔋 **Advanced Status Chips:** Automatically alerts you about room status:
  * **Windows:** Shows open windows immediately.
  * **Batteries:** Differentiates between "Critical" (≤ 5%), "Low" (≤ 15%), or "Empty" (Binary Sensors).
* 💧 **Humidity Warning:** Optional high-humidity chip and blue outline with configurable threshold.
* ⚡ **Performance:** Vanilla JS, no external dependencies, loads extremely fast.
* 🖱️ **Sortable:** Reorder buttons via drag & drop or arrow keys in the editor.
* 🖼️ **Built-in Image Uploader:** Upload your room background images directly in the card editor. No file manager needed!
* ⚡ **Quick Add (Editor):** Add buttons quickly from existing entity types using the Quick Add accordion.
* 🧩 **Editor Sections:** Collapsible sections for Image, Manual Sensors, and Batteries.
* 🧭 **Bulk Expand/Collapse (Editor):** Expand or collapse all button settings at once.
* 👆 **Configurable Actions:** Define what happens on **Tap**, **Hold**, and **Double Tap** for every single button (Toggle, More Info, Navigate, etc.).
* 🌡️ **Target Temperature:** Optionally display the setpoint/target temperature next to the current room temperature.
* 🧩 **Collapsible Button Editor:** Each button configuration can be expanded/collapsed for faster navigation in large cards.
* 🧼 **Cleaner Buttons:** Toggle **Show State**, **Show Label**, and **Show Icon** per button to reduce visual noise.
* ↕️ **Text Order:** Choose which text comes first (State/Value or Name) per button.
* 🎯 **Button Visibility:** Hide/show individual buttons without deleting them.
* 🎛️ **Manual Color Override:** Force a custom color for a button icon even when the entity is inactive.
* 🧭 **Device Picker:** Select a device and let the editor auto-pick a suitable entity.
* 🧩 **Template Presets:** Add buttons using type presets (Light/Switch/Climate/Cover/Media).

## 🆕 What’s new in 1.0.9

* Runtime: High-humidity warning chip and blue outline with configurable threshold (`humidity_warning_threshold`, default `60`).
* Runtime: Label/status position modes (**right/left/top/bottom**) with per-button `label_position` and global `global_label_position`.
* Runtime: Battery and humidity warnings now highlight the card outline.
* Editor UX: Quick Add accordion to add buttons from existing entity types.
* Editor UX: Collapsible sections for Image, Manual Sensors, and Battery list.
* Editor UX: Drag & drop reordering plus bulk expand/collapse button settings.
* Fix: Editing a button no longer collapses entries or jumps the editor scroll.

## 📥 Installation

### Via HACS (Recommended)
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=lop1505&repository=RoomCard&category=plugin)

or

1. Open HACS -> Frontend.
2. Click the menu (three dots) in the top right corner -> **Custom repositories**.
3. Paste the URL of this repository.
4. Select category **Lovelace** (or **Dashboard**).
5. Click "Add" and then "Install".

### Manual Installation
1. Download the `room-card.js` file from the latest release.
2. Copy it to your `/config/www/` folder.
3. Add the resource to your Dashboard configuration:
   - URL: `/local/room-card.js`
   - Type: JavaScript Module

## ⚙️ Configuration

Simply add the card via "Add Card" in your dashboard and select **"OneLine Room Card"**.
The visual editor guides you through all settings:

* **General:** Name, Icon, Colors, Background Image, and optional **Tap → Navigate** path.
* **Sensors:** Select your temperature (current & target), humidity, window, and battery sensors. Optional humidity warning threshold.
* **Buttons:** Add devices/entities, set width/height, alignment, and actions (Tap/Hold/Double Tap).
* **Cleaner Buttons:** Toggle **Show State**, **Show Label**, **Show Icon**, and **Visible** per button.
* **Text Order:** Choose whether **State/Value** or **Name** appears first.
* **Label Position:** Set **Right / Left / Top / Bottom** per button and a global default.
* **Manual Color:** Force a custom icon color (always visible).
* **Template Presets:** Add buttons from type presets, or switch a row to **Template**.
* **Editor UX:** Button entries are collapsible for better overview.

### New in 1.0.9 (YAML options)
```
type: custom:oneline-room-card
humidity_warning_threshold: 60
global_label_position: bottom  # right | left | top | bottom
controls:
  - entity: light.living_room
    label_position: bottom      # global | right | left | top | bottom
```

## ⚠️ Migration 1.0.8 → 1.0.9

No breaking changes. `global_label_position` is new; existing configs using `buttons_label_position` remain supported as a fallback.

### Template Buttons (Optional)
You can switch a button row to **Template** to render dynamic text/icon/color/state.

* Use **JavaScript** inside `${ ... }`.
* Helpers available: `hass`, `states`, `entity(id)`, `attr(id, name)`, `ctrl`.

Example:
```
content: ${entity("climate.living_room")?.state?.toUpperCase() ?? "—"}
icon: ${(({heat:"mdi:fire",cool:"mdi:snowflake"}[(entity("climate.living_room")?.state||"").toLowerCase()]) ?? "mdi:help-circle")}
color: ${(({heat:"#FF5722",cool:"#2196F3"}[(entity("climate.living_room")?.state||"").toLowerCase()]) ?? "#9E9E9E")}
state: ${attr("climate.living_room","hvac_action") ?? ""}
```

---

## ☕ Support

Do you like my work? I develop this card in my free time. I would be very happy about a coffee!

<a href="https://www.buymeacoffee.com/oneline1505" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

---
*Developed by OneLine*
