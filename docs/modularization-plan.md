# Test-gated modularization plan

This note is the Phase 0 / first-deliverable decision for issue #100. It does
not authorize a source split. The current single-file source and copy build
remain the known-good rollback point until a separate Gate 1 pull request is
reviewed and manually smoke-tested in Home Assistant.

## Build approach decision

Use **esbuild**, pinned exactly to `0.28.2`, for the future Gate 1 experiment.
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

The esbuild dependency is deliberately not installed by this planning change.
Adding it, replacing the current copy build, or moving code requires its own
reversible PR. That PR must compare the generated artifact against the current
baseline and pass the manual matrix in `docs/manual-smoke-test.md`.

## Current baseline and artifact contract

- `src/room-card.js` is the canonical, single-file source.
- `dist/room-card.js` is the readable generated HACS artifact.
- `scripts/build.mjs` currently performs a deterministic byte-for-byte copy.
- `scripts/check-release.mjs` rejects stale output and version drift.
- CI builds from a clean checkout, rejects a changed artifact, runs syntax and
  regression checks, then runs the HACS validator.
- The artifact contains no runtime imports or external browser dependencies.
- All registration remains in the same entry artifact and is duplicate-safe.
  Card/editor/`window.customCards` registration shares the final registration
  block; the compatibility input remains guarded directly after its class until
  a later gated move can preserve its cold-load order.

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
