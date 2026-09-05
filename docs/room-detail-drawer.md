# Room Detail Drawer — prototype decision

Target: v1.5.0, issue #127. The source modularization passed its manual gate on
2026-09-05 against commit `5756362111f9ce8952eab4871cd087c51302bc21`.
The user confirmed editor/save, existing controls, mobile and light/dark checks.
The browser confirmed the pinned bundle URL and loaded header images.
The modularized baseline has 98 passing automated tests and green PR CI.
No quantitative cold-load timing was recorded; no performance gain is claimed.

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

The prototype does not clone or move active controls. Full integration will
create independent DOM nodes through shared renderers, with the original
`controls` list as the only configuration source. `display_in` handling and
the visual editor section belong to the integration PR after this gate.

## Child dialogs and cleanup

The existing history and status dialogs share the coordinator and render in
the drawer's shadow root when the drawer owns them. Closing a child restores
the triggering button without resetting the drawer scroll position. Opening
the drawer itself does not fetch history or create polling timers.

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

## Test the prototype (release remains blocked)

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

The new **Room details / Raumdetails** header button opens the prototype.
Existing controls stay on the card during this phase. Optional explicit
`tap_action`, `hold_action` and `double_tap_action` can use `action: room-details`.
The preview contains three diagnostic entry points:

- HA details use the card's `entity` and disable when missing/unavailable.
- History uses a configured sensor sparkline or `temp_sensor`.
- Status uses contributors from configured `status_groups`.

Before full control integration, manually verify on the actual HA installation:

1. Desktop sidebar (480px), mobile bottom sheet (90dvh), light/dark, safe-area
   edges, fixed close header and content scroll.
2. Repeated opening, closing, Tab/Shift+Tab, Escape, backdrop and opener focus.
3. HA more-info on top; Escape closes only HA; focus and scroll return. Repeat
   with status → HA details and history. Verify HA's lazy cold first opening.
4. Open a second card's drawer; navigate away; disable; remove the owner preview.
   No orphan host, stale focus trap or background requests should remain.
5. Open from an editor preview and verify its interaction with HA's own editor
   dialog and layering. This is a manual compatibility gate, not yet certified.

Automated DOM tests verify event contracts and cleanup but cannot certify HA's
native top-layer implementation, physical mobile interactions or theme visuals.
Do not merge this prototype as a finished feature, close #127 or publish v1.5.0
before the manual prototype gate and full integration have passed.
