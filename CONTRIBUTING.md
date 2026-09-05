# Contributing

## Repository layout

- `src/room-card.js` is the entry point and currently retains runtime/editor classes.
- `src/lib/values.js` owns browser-independent number/string helpers.
- `src/lib/formatting.js` owns HA state/attribute formatting and existing fallbacks.
- `src/lib/temperature.js` owns temperature conversion and locale/precision handling.
- `src/lib/colors.js` owns color parsing, contrast and picker conversion.
- `src/lib/states.js` owns shared state definitions, domain icons and state predicates.
- `src/lib/conditions.js` keeps visibility, room-mode and adaptive-image policies separate; time and screen inputs are supplied by the runtime.
- `src/lib/alerts.js` owns legacy alert normalization and activation rules.
- `src/lib/actions.js` builds HA action payloads; the card still owns availability checks and event dispatch.
- `src/lib/history.js` owns shared cache primitives and history parsing/requests through an explicit HA callback. Per-card refresh timers, cache coordination and DOM updates stay in the runtime.
- `src/i18n/translations.js` owns the unchanged EN/DE/FR dictionaries and fallback lookup.
- `dist/room-card.js` is the generated HACS artifact and must not be edited directly.
- `dist/rooms/` contains the additional assets installed by HACS.
- `tests/` contains automated regression tests.
- `scripts/` contains build and release-consistency tooling.
- `docs/` contains screenshots and supporting documentation.

Runtime and editor remain together during the initial helper extractions. Each module family is moved in its own test-gated PR so existing Home Assistant behavior remains stable.
See [the modularization plan](docs/modularization-plan.md) and [manual Home Assistant smoke-test matrix](docs/manual-smoke-test.md) before changing the build pipeline or moving source code.

## Local checks

Node.js 20 or newer is required. The project has no runtime dependencies.
The build uses esbuild pinned to `0.28.2`. It produces one readable ESM file,
without minification, code splitting, source maps, or runtime imports.

```sh
npm ci
npm run build
npm run check
```

After changing anything under `src/`, always run `npm run build` and commit the matching `dist/room-card.js` artifact. CI rejects stale distribution output and inconsistent release versions.

`scripts/build-config.mjs` owns the shared build options. `npm run check:dist`
builds into an isolated temporary directory, compares that artifact byte for
byte with the committed distribution, and removes only its temporary output.
It does not repair or overwrite a stale committed artifact. `dist/rooms/` stays
alongside the bundle and is not transformed by esbuild.

Runtime/editor tests import the actual distribution. Direct helper assertions
use explicit named ESM exports declared in the source, not exports appended to
bundler-generated text. These internal test seams are not a supported consumer
API; they will move with their owning modules during the gated extraction.

## Release metadata

For a release, keep these values identical:

- `const VERSION` in `src/room-card.js`
- the generated `VERSION` value in `dist/room-card.js` (esbuild may emit `var`)
- `version` in `package.json`
- the newest version heading in `CHANGELOG.md`
- the “What's new” version in `README.md`
- the Git tag in the form `vX.Y.Z`

## Manual release checklist

Release publication remains manual. CI validates a release but does not create a
GitHub release or publish artifacts.

1. Update `VERSION`, `package.json`, the README “What's new” heading, and the
   newest changelog version to the same `X.Y.Z` value.
2. Move applicable Unreleased entries under that changelog version.
3. Run `npm ci`, `npm run build`, and `npm run check` from a clean checkout.
4. Run the Home Assistant checks in `docs/manual-smoke-test.md` when runtime,
   editor, build, or packaging behavior changed.
5. Commit the generated `dist/room-card.js` and any changed `dist/rooms/` assets.
6. Merge only after the Validate workflow and HACS validation pass.
7. Create and push the annotated tag `vX.Y.Z`; tag CI will reject a mismatch.
8. Manually create the GitHub release and attach/package the tested `dist/`
   contents according to the existing HACS release process.
