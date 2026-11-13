# Automatic RoomCard sections — issue #158

Date: 2026-11-13. Status: implemented on the unreleased
`codex/test-automatic-room-sections-20261113` test branch.
Automated and local browser checks cover the feature. The live HA 2026.11 picker,
save/reopen and registry-update checks remain pending. No release was created.

## Decision

Use an optional **RoomCard section strategy** for HA 2026.11. It generates one
section with a stable adapter that owns one ordinary RoomCard for a selected
area. The existing standalone card and one-time Area Setup remain available.
Defer a second, standalone-card live-discovery mode until there is a demonstrated
need outside sections views.

This recommendation follows a documented public extension point, rather than
assuming a custom card is automatically available in the section picker.

## Verified extension contract

HA 2026.11 introduced Community sections in the automatic-section picker. A
separate strategy element implements static `generate(config, hass)` and returns
a section configuration. Registration uses `window.customStrategies` with
`strategyType: "section"`; a matching `ll-strategy-section-<name>` custom element
provides the generator. `getStubConfig(hass)` supplies the picker preview and
initial configuration; `getConfigElement()` supplies the visual strategy editor.
The existing dashboard JavaScript resource can load these definitions.

Sources: [section-strategy announcement](https://contributors.home-assistant.io/blog/2026/10/28/custom-section-strategies-in-the-dashboard-editor/),
[custom-strategy documentation](https://contributors.home-assistant.io/frontend/custom-ui/strategy/).

HA Core 2026.11.0 pins frontend **20261028.4**. That frontend exposes strategy
`registryDependencies` and `shouldRegenerate`. The default registry dependencies
are entities, devices, areas and floors; ordinary state updates do not trigger
the default check. Explicitly include labels if label filtering is later added.
Use the supplied `hass.entities`, `hass.devices` and `hass.areas` snapshots for
discovery; leave state rendering to RoomCard.

Sources: [Core manifest](https://github.com/home-assistant/core/blob/2026.11.0/homeassistant/components/frontend/manifest.json),
[released strategy interface](https://github.com/home-assistant/frontend/blob/20261028.4/src/panels/lovelace/strategies/types.ts),
[released regeneration implementation](https://github.com/home-assistant/frontend/blob/20261028.4/src/panels/lovelace/strategies/get-strategy.ts).

## Lifecycle implementation

The released HA `hui-section` recreates every card when its generated section
changes ([source](https://github.com/home-assistant/frontend/blob/20261028.4/src/panels/lovelace/sections/hui-section.ts)).
Therefore the RoomCard strategy declares `registryDependencies = []` and returns
a stable `custom:oneline-room-auto-card` containing the saved strategy settings.
That adapter compares registry references and relevant device-class metadata as
HA supplies `hass`. It derives controls with the pure discovery helper, updates
the existing RoomCard through `setConfig()` only when its effective config
changes, and forwards ordinary state updates through `hass`. It has no polling,
network fetches or global subscriptions.

This keeps an open drawer alive when automatic membership changes. The generated
card uses an area-scoped `collapse_key` so a renamed room or a changed automatic
climate selection does not reset collapse preferences. Structural control updates
restore the matching entity's keyboard focus, including native media controls.
Removing the selected area disconnects the inner card, closes its dialogs through
normal cleanup and shows a translated message. A restored area reuses the card.

## Comparison

| Approach | Feasibility | Maintenance and scope |
|---|---|---|
| Community section with a stable RoomCard adapter | Implemented using the supported extension contract | HA owns the picker and section layout. The adapter handles discovery updates while retaining the ordinary card instance. Available in sections views. |
| Optional live area selection inside each standalone RoomCard | Feasible as a separate feature | Works in other dashboard layouts, but RoomCard must own discovery invalidation, effective config, renderer caches, drawer synchronization and lifecycle cleanup. Shares the future pure selection helper, not a second selection policy. |
| Existing Area Setup button (#54) | Already implemented | Editor action fetches registries and writes concrete entity IDs. It does not track later devices. Remains useful for manually maintained cards. |

Do not register the card class itself as a strategy: its instance rendering API
is different from the static generator contract. Do not patch HA's built-in
Entities strategy, import private frontend modules, introduce polling, or make a
backend integration a prerequisite. Native filtering does not by itself turn
the resulting tiles into a configured RoomCard.

## First-version UX

1. In a sections view, choose **Create section → Automatic section → Community
   sections → RoomCard**. Show a preview using a suitable existing area.
2. Pick one area and the included control domains. Start with the domains already
   supported by Area Setup: lights, switches, covers, fans, media players and
   locks. Offer an automatic climate/header selection with explicit overrides.
3. Show discovered entities separately from explicitly configured controls.
   **Customize** creates a saved control override; **Exclude** removes an entity
   from discovery. Describe that devices assigned to this area appear or leave
   automatically. Avoid silently converting a generated list into saved controls.
4. Reuse existing RoomCard appearance, image, action and drawer settings. Offer
   manual controls in their existing order, including templates and deliberate
   duplicate controls. The section editor edits selectors and overrides; the
   generated card remains derived output.

Implemented schema for the section (the visual editor also writes this):

```yaml
strategy:
  type: custom:oneline-room
  area: living_room
  domains: [light, switch, cover, fan, media_player, lock]
  exclude_entities: [switch.maintenance]
  card:
    image_preset: living-room
    controls:
      - entity: light.reading
        name: Reading lamp
        display_in: drawer
```

The example derives the room name and eligible entities from the selected
area. The explicit reading-lamp control takes precedence over its discovered
default and retains its drawer placement. No existing YAML gains these semantics.

## Selection and change policy

* Resolve area as `entity.area_id` first, then the device's area only when the
  entity has no explicit area. An entity assigned to another room must not enter
  through its device. The current editor `_getAreaEntities()` uses an OR check;
  extract a correct pure resolver rather than copying that check into live mode.
* Discover supported domains only. Exclude disabled/hidden entities and diagnostic
  or configuration entities by default. Explicit manual controls retain the
  existing card behavior and can intentionally include an entity outside the area.
* Apply `exclude_entities` to automatic discovery. Explicit controls are
  authoritative, appear first in saved order and suppress the corresponding
  automatically generated duplicate. Do not deduplicate deliberate manual rows.
* Order remaining controls by the existing preferred domain order, then entity
  ID. Renaming a friendly name must not reorder the automatically generated list.
  New devices have a deterministic insertion point. Explicit order/overrides can
  pin important controls; removal/reappearance of the same entity ID retains
  those saved preferences.
* Adding/removing or moving an entity changes only generated membership. A
  temporarily unavailable entity stays in the section with the card's normal
  unavailable presentation. State changes update the card without regenerating
  section membership. Never filter automatic membership by on/off state.
* Persist selectors, exclusions and manual overrides only. `generate()` must not
  mutate its input, save dashboard config, emit `config-changed`, call services
  or retain observers/timers. The explicit editor Save flow remains the boundary
  for configuration changes.
* For a missing/deleted area, show a translated configuration message rather than
  widening discovery to the entire home. Keep explicit configuration available
  for recovery. Multiple candidate climate/temperature/humidity entities need
  deterministic defaults and visible explicit selectors; do not overwrite saved
  choices as devices appear.

## Backwards compatibility and verification

Existing `custom:oneline-room-card` configurations stay manual. Do not alter them
on upgrade, enable discovery implicitly, or remove the Area Setup button. The
new section picker is optional and targets HA 2026.11; loading the ordinary card
on older supported HA versions must remain safe. Keep the single JavaScript
artifact and duplicate-safe registration, extending its registration tests for
the additional elements.

Automated checks in `tests/room-discovery.test.mjs` and
`tests/room-section.test.mjs` cover:

* Pure selection tests for area precedence, supported domains, hidden/disabled
  entities, exclusions, manual precedence, deterministic order, deleted areas and
  additions/removals/moves. Cover a temporarily unavailable device explicitly.
* Generator/registration tests proving repeatable output, no input mutation or
  config writes, duplicate-safe loading, correct preview and a visual editor.
* Editor roundtrip and deferred-save tests for selectors and control overrides.
  Dynamic membership must preserve custom names, actions and drawer placement.
* Stable inner card identity, no unnecessary configuration resets on ordinary
  state or unrelated registry changes, retained drawers/collapse/scroll/focus on
  membership changes, late device classes and deleted-area cleanup/recovery.
* Preview routing in a native section editor, translated labels and text-safe
  entity names. A local browser fixture verifies room changes, discovery,
  customization, exclusion/restoration and actual preset-image loading.

Live HA 2026.11 checks remain required before a release: choose the Community
section without YAML, save and reopen it, then add/move/remove devices. Check
collapse, open drawers, keyboard focus, history, images and existing manual cards.
See [today's test checklist](testing/2026-11-13.md). No issue was closed and no
GitHub release was created by this local implementation.
