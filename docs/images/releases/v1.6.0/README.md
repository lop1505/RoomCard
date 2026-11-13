# English release screenshots

These browser captures render the committed `dist/room-card.js` bundle and its
actual automatic-section editor. The local demo host supplies fictional Home
Assistant registries and states. No private dashboard capture, account, hostname,
personal room name, device identifier or location is included.

* `automatic-section-editor.jpg`: English area picker, domain filters, discovered
  entities and the live RoomCard preview.
* `automatic-rooms.jpg`: two automatic rooms after a demo light joins Living room.

To reproduce, serve the repository locally and open
`tests/fixtures/release-automatic-room-sections.html`. Capture the full page for
the editor. Append `?view=overview`, click **Add a demo light to Living room**,
and capture the second view. The surrounding demo layout is not the native HA
dialog. The cards, editor labels and discovery updates come from the real bundle.

The demo uses bundled room presets and a small MDI 7.4.47 icon subset, with its
attribution in `tests/support/demo-icons-LICENSE.txt`. Screenshots are direct
browser captures, without retouching or private-data overlays.
