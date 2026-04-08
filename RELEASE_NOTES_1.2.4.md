## 🆕 What's new in 1.2.4

### Climate Inline Slider (#44)

`control_mode: slider` now works for **climate** entities, enabling direct target temperature control without opening a detail dialog.

**How it works:**
* The button displays **current → target** temperature while dragging (e.g. `21.5°C → 22°C`).
* On release, `climate.set_temperature` is called with the selected value.
* Slider range is read from `min_temp` / `max_temp` attributes (fallback: 5–35 °C), step is `0.5`.
* Unavailable entities fall back to normal disabled display.

**Configuration:**
```yaml
controls:
  - entity: climate.living_room
    name: Heizung
    control_mode: slider
```

---

### Dedicated Buttons Tab (#42)

Button configuration has moved to its own **Buttons** tab in the editor.

The editor now has two tabs:

| Tab | Contents |
|---|---|
| **Konfiguration** | Card Behavior, Header (all card-level and header settings) |
| **Buttons** | Global Label Position, Quick Add, Bulk Expand/Collapse, Individual button configs |

No YAML changes required — this is a pure UI reorganisation.

---

### Editor Restructure: Card Behavior + Header (#43)

The former **"General"** section is split into two collapsible sections:

| Section | Contents |
|---|---|
| **Card Behavior** | Name, Show Title, Live Preview, Collapsible, Default State, Navigation Path |
| **Header** | Header Height, Typography, Main Climate Device, Icon/Color, Header Badges, Background Image |

Both sections can be collapsed independently for a cleaner editing experience.

---

### Fix: Expand/Collapse All Buttons

The `><` bulk toggle in the Buttons section now correctly tracks and toggles the open/closed state for all button entries.

---

### State-Dependent Button Colors (`color_map`) (#49)

Buttons can now change their icon color and background automatically based on the entity's current state.

**How it works:**
* Define a `color_map` with state → color entries (any CSS color or hex value).
* Optional `default` key acts as fallback for unmapped states.
* Priority: `force_color` > `color_map` > domain logic (rgb_color, hvac_action, theme).
* Hex colors get a 20 % tinted background automatically; named colors use `color-mix`.

**YAML configuration:**
```yaml
controls:
  - entity: light.living_room
    color_map:
      "on": gold
      "off": grey
      default: steelblue
```

**Editor UI:**
Open the **Buttons** tab → expand a button → scroll down below "Manuelle Farbe erzwingen" → **Zustandsfarben / State Colors** section. Use "Farbe hinzufügen / Add State Color" to add entries visually with a color picker.

---

---

### Configurable Icon Size per Button (#48)

Set a custom icon size per button, or a global default for all buttons.

**YAML:**
```yaml
global_icon_size: 24   # applies to all buttons (default: 20)

controls:
  - entity: light.living_room
    icon_size: 28       # overrides global for this button
```

**Editor UI:**
- Global size: **Buttons** tab → **Global Icon Size (px)** next to label position.
- Per-button: expand a button → **Icon Size** field at the top of the entity section.

| Option | Scope | Default |
|---|---|---|
| `global_icon_size` | All buttons | `20` (px) |
| `icon_size` | Per button | inherits global |

---

---

### Info Line Position Slider (#47)

A slider in the **Header** section lets you drag the info line (temperature, humidity, badges) left, center, or right across the card header.

* Drag freely between 0 and 100.
* Snaps automatically to **left (0)**, **center (50)**, and **right (100)** when within 5 units.
* **YAML:** `header_info_offset: 50` (0 = left, 50 = center, 100 = right)

| Option | Default | Effect |
|---|---|---|
| `header_info_offset` | `0` (left) | Horizontal position of the info line in the header (0–100) |

---

No breaking changes. Existing YAML configurations are unaffected.
