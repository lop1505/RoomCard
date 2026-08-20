# Contributing

## Repository layout

- `src/room-card.js` is the canonical source file.
- `dist/room-card.js` is the generated HACS artifact and must not be edited directly.
- `dist/rooms/` contains the additional assets installed by HACS.
- `tests/` contains automated regression tests.
- `scripts/` contains build and release-consistency tooling.
- `docs/` contains screenshots and supporting documentation.

The current source intentionally remains a single file. Structural extraction should happen only in small, test-gated changes so existing Home Assistant behavior remains stable.
See [the modularization plan](docs/modularization-plan.md) and [manual Home Assistant smoke-test matrix](docs/manual-smoke-test.md) before changing the build pipeline or moving source code.

## Local checks

Node.js 20 or newer is required. The project has no runtime dependencies.

```sh
npm ci
npm run build
npm run check
```

After changing `src/room-card.js`, always run `npm run build` and commit the matching `dist/room-card.js` artifact. CI rejects stale distribution output and inconsistent release versions.

## Release metadata

For a release, keep these values identical:

- `const VERSION` in `src/room-card.js`
- `const VERSION` in `dist/room-card.js`
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
