# Contributing

## Repository layout

- `src/room-card.js` is the canonical source file.
- `dist/room-card.js` is the generated HACS artifact and must not be edited directly.
- `dist/rooms/` contains the additional assets installed by HACS.
- `tests/` contains automated regression tests.
- `scripts/` contains build and release-consistency tooling.
- `docs/` contains screenshots and supporting documentation.

The current source intentionally remains a single file. Structural extraction should happen only in small, test-gated changes so existing Home Assistant behavior remains stable.

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
