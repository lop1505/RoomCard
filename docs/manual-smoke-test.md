# Manual Home Assistant smoke-test matrix

Run this matrix before approving a build-pipeline or modularization gate. Record
the Home Assistant version, browser, viewport, theme, commit SHA, and result.

| Area | Check | Expected result |
|---|---|---|
| Fresh load | Hard-refresh a dashboard containing minimal and fully configured RoomCards | Cards load without console errors, duplicate registration, or extra module requests |
| Live bundle replacement | Keep an editor open while replacing an already registered 1.3.1 bundle with the candidate bundle | The open editor rebuilds immediately and shows status-border, sparkline-refresh, focal-point, and upload-status controls |
| Cold editor | Open the visual editor before HA internal text fields have been used elsewhere | Native fallback is editable; delayed HA input registration does not clear values |
| Editor persistence | Change fields with live preview on/off, save, close, and reopen | Preview and saved YAML agree; no pending change is lost |
| Responsive layout | Check narrow mobile and desktop widths | Controls wrap without clipping; media artwork remains square |
| Themes | Check light and dark themes | Text, badges, chips, focus outlines, and controls remain readable |
| Collapse | Test fixed, collapsed, expanded, and remembered states across navigation/reload; tab through a collapsed card; combine collapse with an explicit header action | State and persistence match configuration; hidden controls are skipped; the header performs its configured action and the separate collapse button remains operable |
| Actions | Exercise tap, hold, double tap, navigation, toggle, and service actions | Exactly one expected HA action/service call occurs |
| Controls | Exercise climate slider/presets, cover actions/presets, light brightness/colors, media transport/volume, and select options; leave keyboard focus on a media transport button during a state update | UI state and service payloads are correct; focus stays on the corresponding media control |
| Sensors | Trigger battery, humidity, presence, window, and configured alerts | Chips, optional status border, and alert dialog update correctly |
| Templates | Test static, inferred/declared dependency-tracked, arbitrary-attribute, sub-chip, and trusted-HTML template examples | Output and sub-chips update for relevant state or attribute changes only and follow the documented trust model |
| Sparklines | Use two cards with the same sensor, scroll them off/on screen, and hide/show the tab | History is shared, polling pauses, and stale data refreshes on return |
| Images | Select a preset, move focal point, and upload a valid/invalid image | Preview, validation, upload, and persisted configuration remain correct |
| Navigation cleanup | Repeatedly enter/leave the dashboard and recreate editor previews | No orphan timers, observers, dialogs, or increasing history traffic remain |

Gate approval requires all rows to pass. Attach failures to the gate PR; do not
continue to the next extraction phase while any result is unexplained.
