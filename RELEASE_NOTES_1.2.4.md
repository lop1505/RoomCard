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

No breaking changes. Existing YAML configurations are unaffected.
