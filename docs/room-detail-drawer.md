# Room Detail Drawer — architecture and test gates

Target: v1.5.0, issue #127. The source modularization passed its manual gate on
2026-09-05 against commit `5756362111f9ce8952eab4871cd087c51302bc21`.
The user confirmed editor/save, existing controls, mobile and light/dark checks.
The browser confirmed the pinned bundle URL and loaded header images.
The modularized baseline has 98 passing automated tests and green PR CI.
No quantitative cold-load timing was recorded; no performance gain is claimed.

## Integration candidate

The prototype landed separately in #150 after the owner's manual confirmation.
The integration uses `card/surface.js` for the static scaffold and
`_updateSurfaceState(surface)` for shared rendering. Each surface has its own
root, controls and configuration signature. The drawer surface has a nested
shadow root inside the modal host; it is not a second RoomCard instance.
Image requests are tracked per image node so card/drawer loads cannot invalidate
each other. Native control focus is restored within the correct surface.

`lib/control-placement.js` defines fallback/placement semantics. Header state,
images, information, status groups and modes are rendered from the owner's
configuration. `both` controls have independent listeners but share state and
history requests. Closed drawer-only or hidden controls do not request history;
the owner retains at most one sparkline polling interval across both locations.

`shared/drawer-preview.js` pairs the editor with its existing HA preview via
their common `hui-dialog-edit-card` scope. It never creates another card. If HA
has not mounted a unique preview, the UI explains how to open it from the saved
dashboard instead. Live-preview-off changes remain pending until Save.

Automated integration coverage includes placement/defaults, ordering, visibility,
separate nodes, single actions/service calls, unavailable controls, state updates,
shared history requests/timer, headers/status/modes, native-control focus,
cleanup, editor roundtrip/duplication, area setup and preview/save boundaries.
The suite currently passes 116 tests, including the earlier prototype lifecycle
tests. Local browser checks verified the integrated desktop view and 390×844
bottom sheet, plus history from a drawer control and Escape returning to it.
These checks use simulated data and do not replace the final real-HA test.

### Final manual integration gate — pending

- Assign one control to Card, one to Room details and one to Both; verify order,
  state updates, presets/sliders/actions and only one physical action per input.
- Collapse the card; drawer controls must remain accessible. Disable room details;
  all non-hidden controls must return to the card. Save and reopen the editor.
- Test live preview on/off, title changes, placement, duplicate/reorder and the
  editor's Room details preview button on the actual HA frontend.
- Recheck history/status/HA subdialogs, keyboard focus/Escape, route changes,
  multiple cards, desktop/mobile and light/dark after full integration.
- Capture final desktop/mobile release screenshots from actual HA, not the
  simulated fixture. Only then prepare the final v1.5.0 release gate.

## Primitive and ownership

The prototype uses a body-mounted, fixed-position host with its own shadow root.
It is outside every card layout container, so card transforms and overflow
cannot clip it. It is a 480px right sidebar at 768px and wider; smaller viewports
use a full-width bottom sheet capped at 90dvh. The title/close header remains
fixed while the content scrolls. CSS covers safe areas and reduced motion.
Theme custom properties are copied from the owner when it updates.

The card owns configuration, HA state and the drawer handle. The host only
owns its DOM and route listeners. The shared dialog coordinator owns modal
ordering and focus; it stores no HA state. It pauses lower panels and handles
only the top modal's Tab, Escape and backdrop. All listeners disappear after
the last modal closes. A document-scoped symbol also coordinates duplicate
bundle evaluations. Only one RoomCard drawer can be open at once.

The implementation does not clone or move active controls. It creates independent
DOM nodes through shared renderers, with the original `controls` list as the only
configuration source. Placement and the visual editor were added only after the
prototype gate passed.

## Child dialogs and cleanup

The existing history and status dialogs share the coordinator and render in
the drawer's shadow root when the drawer owns them. Closing a child restores
the triggering button without resetting the drawer scroll position. Opening an
empty drawer does not fetch history; visible drawer sparkline controls reuse
the owner's cache and polling interval.

`ha-dialog-adapter.js` observes confirmed HA `opened` events from dialog
primitives and matching owner `dialog-closed` events. A dispatched request
alone never suspends the drawer. HA owns focus and Escape while its dialog is
open. Events from unrelated owners cannot complete the handoff. Cleanup removes
the adapter, including pending handoffs, when the drawer is removed.

Official HA contracts inspected for this adapter:

- [ha-dialog](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-dialog.ts)
- [ha-adaptive-dialog](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-adaptive-dialog.ts)
- [more-info owner](https://github.com/home-assistant/frontend/blob/dev/src/dialogs/more-info/ha-more-info-dialog.ts)
- [dialog manager](https://github.com/home-assistant/frontend/blob/dev/src/dialogs/make-dialog-manager.ts)

Route changes, owner disconnection, disabling the option, or opening another
card's drawer close the previous drawer. HA history entries on the same route
do not close it. Live configuration updates keep the current nodes and scroll
position; the editor's existing deferred save remains the configuration boundary.

## Decisions and alternatives

- An in-card overlay would inherit clipping and containing blocks: rejected.
- A recursive RoomCard would duplicate lifecycle and polling: rejected.
- Native HA layout primitives vary by frontend version and do not provide the
  specified 768px/480px layout contract: a custom host was selected.
- A second control list would duplicate settings and ordering: rejected.
- Monkey-patching HA methods or polling for dialog visibility was rejected in
  favor of an isolated event adapter that can be verified on the actual HA build.

## Archived prototype gate (passed; final integration gate still pending)

The owner confirmed the actual HA prototype gate on 2026-09-05 against
`3bdbd2c780a39afed845970be0e68d61f8d4fe65`: HA details/history/status with
Escape returning to the drawer, mobile use and opening from the editor preview
worked. This permits control integration; it does not certify the not-yet-built
full feature or authorize skipping its final manual release gate.

Local browser fixture checks on 2026-09-05 passed: the desktop sidebar rendered
outside a transformed, clipped card container; at 390×844 CSS pixels the bottom
sheet measured 390px wide and ended at the viewport bottom. Light/dark rendering,
history opening and Escape focus restoration were checked, with no browser error
logs. This fixture uses simulated data, not the actual HA dialog implementation.
It can be served from the repository root and opened at
`tests/fixtures/drawer-prototype.html`. The automated suite passes 106 tests.

Add this to one existing card's YAML after loading the pinned prototype bundle:

```yaml
detail_drawer:
  enabled: true
  title: Wohnzimmer
```

The **Room details / Raumdetails** header button opened the prototype.
Existing controls stayed on the card during that phase. Optional explicit
`tap_action`, `hold_action` and `double_tap_action` can use `action: room-details`.
The preview contains three diagnostic entry points:

- HA details use the card's `entity` and disable when missing/unavailable.
- History uses a configured sensor sparkline or `temp_sensor`.
- Status uses contributors from configured `status_groups`.

The prototype manual checklist was:

1. Desktop sidebar (480px), mobile bottom sheet (90dvh), light/dark, safe-area
   edges, fixed close header and content scroll.
2. Repeated opening, closing, Tab/Shift+Tab, Escape, backdrop and opener focus.
3. HA more-info on top; Escape closes only HA; focus and scroll return. Repeat
   with status → HA details and history. Verify HA's lazy cold first opening.
4. Open a second card's drawer; navigate away; disable; remove the owner preview.
   No orphan host, stale focus trap or background requests should remain.
5. Open from an editor preview and verify its interaction with HA's own editor
   dialog and layering. The owner confirmed this prototype compatibility gate.

Automated DOM tests verify event contracts and cleanup but cannot certify HA's
native top-layer implementation, physical mobile interactions or theme visuals.
Do not merge this prototype as a finished feature, close #127 or publish v1.5.0
before the manual prototype gate and full integration have passed.
