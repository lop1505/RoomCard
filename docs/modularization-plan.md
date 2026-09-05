# Test-gated modularization plan

This note tracks the test-gated implementation of issue #100 for v1.5.0.
The approved baseline is published v1.4.0 (`88b2314`), with 68 passing automated
tests and the completed manual Home Assistant test. That single-file source and
copy build remain the rollback point for the separate Gate 1 bundler PR.
No helper extraction starts until Gate 1 passes CI and its manual HA smoke test.

## Build approach decision

Use **esbuild**, pinned exactly to `0.28.2`, for Gate 1.
That version was reviewed on 2026-08-20 from the [official npm package](https://www.npmjs.com/package/esbuild).
It is selected because it can bundle ESM into one readable, unminified ESM
artifact without adding a browser/runtime dependency. Rollup remains the
fallback if esbuild changes registration order or output semantics.

The Gate 1 experiment must use these constraints:

```js
{
  bundle: true,
  format: "esm",
  minify: false,
  sourcemap: false,
  outfile: "dist/room-card.js"
}
```

The Gate 1 PR installs the dependency and replaces only the build pipeline.
Runtime/editor bodies, translations, image resolution and registration order
remain unchanged. The sole source addition is an explicit named-export block
for internal tests; tests no longer append exports to the generated bundle.
Tree shaking is disabled during this first step to avoid silently pruning
existing code. The browser target is ES2022, retaining native `import.meta.url`.
This reversible PR must pass the manual matrix in `docs/manual-smoke-test.md`
before source extraction begins.

## Current baseline and artifact contract

- `src/room-card.js` is the canonical, single-file source.
- `dist/room-card.js` is the readable generated HACS artifact.
- `scripts/build.mjs` bundles using shared options in `scripts/build-config.mjs`.
- `scripts/check-build.mjs` builds into a unique temporary directory, compares
  bytes with the committed artifact, and cleans up without rewriting `dist/`.
- `scripts/check-release.mjs` rejects stale output and version drift.
- CI builds from a clean checkout, rejects a changed artifact, runs syntax and
  regression checks, then runs the HACS validator.
- The artifact contains no runtime imports or external browser dependencies.
- All registration remains in the same entry artifact and is duplicate-safe.
  Card/editor/`window.customCards` registration shares the final registration
  block; the compatibility input remains guarded directly after its class until
  a later gated move can preserve its cold-load order.
- Tests assert the order input wrapper → editor → card and a single custom-card
  registration after loading the artifact twice.
- Build metadata rejects additional output files and runtime imports. Tests
  resolve all 16 presets against the real bundle URL and check that every JPEG
  exists under the adjacent `dist/rooms/` HACS directory.
- A separate module probe evaluates the unchanged artifact with HACS, pinned
  CDN and `/local/` URLs. It verifies that images resolve beside the module,
  never relative to the dashboard page; it does not replace the real HA test.

The initial generated bundle is 498,265 bytes versus the v1.4.0 artifact's
499,441 bytes (about 0.24% smaller). This is a formatting/build comparison, not
a claimed browser load-time improvement. Manual cold-load timing and behavior
remain part of the HA gate.

This establishes a known-good build/test baseline without changing runtime
behavior. Automated coverage includes cold-load editor behavior, actions,
service calls, media, alerts, images, templates, sparklines, security boundaries,
multi-card performance, and lifecycle cleanup. Manual Home Assistant coverage
remains a required Gate 1 check because tests do not reproduce every internal
HA component-loading order.

## Recovered and likely failure modes

No preserved modular branch or patch was found in the reachable repository
history. The available evidence and current architecture identify these concrete
risks:

1. Runtime ESM imports would violate the single-artifact HACS contract.
2. Moving registration can define custom elements twice or in the wrong order.
3. Extracted editor callbacks can lose `this`, live-preview state, pending-save
   state, or drag/drop state.
4. Home Assistant may open the editor before `ha-input` / `ha-textfield` exists;
   the native compatibility fallback must survive intact.
5. A build that is not checked from a clean checkout can silently publish stale
   `dist/room-card.js`.
6. Combining file moves with behavior changes makes failures hard to explain and
   removes the safe rollback point.

## Gates and PR boundaries

1. **Gate 0 — baseline:** keep all checks green and complete the manual smoke
   matrix before changing the build tool.
2. **Gate 1 — bundler only:** pin esbuild, bundle the unchanged source, verify
   deterministic readable output, registration count/order, cold load, editor
   save, and HACS validation. Stop and revert if any result is unexplained.
3. **Gate 2 — pure helpers:** extract one tested helper family per PR. No DOM,
   timer, global, or `this` dependencies may enter `lib/`.
4. **Gate 3 — translations:** move dictionaries only after adding locale key
   parity coverage; do not edit wording in the move.
5. **Gates 4–5 — isolated services/runtime:** use explicit inputs and callbacks;
   keep DOM/listener ownership in the card until interfaces are proven.
6. **Gate 6 — editor last:** first move the compatibility wrapper intact, then
   the editor class intact. Section renderers are a later decision.

Every gate is a separate PR and rollback point. A failed gate is reverted rather
than repaired by stacking more structural changes on top.

## Intended dependency direction

```text
entry → card/editor → lib/i18n
```

`lib` and `i18n` must never import card or editor code. Custom-element and
`window.customCards` registration stays exclusively in the entry module.
