# Goals

_Status: confirmed (D3–D9). Product surface detailed in `report/product-vision.md`._

## North star

Let a developer live-preview a React component **in isolation inside their IDE**, with AI
filling in whatever props/state/context the component needs to render in a useful state —
so they can iterate on UI polish and behavior faster than round-tripping through the full app.

The fuller product framing (personas, the one-Preview-artifact model, the two input modes
— direct-manipulation controls + agent — and the L0→L4 build order) lives in
`report/product-vision.md`. This file stays the concise north-star + success criteria.

## Why

- Faster, more focused iteration than a full dev server (no navigating the app to the right screen).
- Force otherwise-hard-to-reach states: a tooltip always open, a toast always showing, a loading/error state on demand.

## Success criteria (see `decisions.md`; status tracked in `tasks.md`)

- [ ] Can preview all four reference components: `AlbumCard`, `Tooltip`, `Dropdown`, `Player`.
      _(spine ready; not yet run end-to-end with a live LLM.)_
- [x] `Player`'s `PlayerProvider` dependency is resolved by context collection — D6/S1.
- [x] An automated **render-verification gate** exists (`verify.ts`, Playwright), scoreable vs the
      **golden set** — D4/S2. _(Built; not yet wired into the preview command.)_
- [x] Work is decomposed into orchestrated, file-isolated **workstreams** — D3/D5/D8 (spine S0–S2 done).
- [ ] **Self-correcting loop:** verify feeds regeneration on failure (the core L1 must-do).
- [ ] User can refine a mock via intent/controls without full regeneration — D5a.
- [ ] **Variant fan-out:** agent renders meaningful states by default, not one.
- [ ] Preview is reasonably fast on repeat (caching / reuse) — D5d.

## Meta-goal (the actual north star of this effort)

Not a single feature — an **effective orchestrator + fast-subagent workflow** that can push
many directions at once with quality enforced by objective gates, coordinated through `docs/`.

## Explicitly out of scope (for now)

- **Runtime** multi-agent mock generation inside the product (deferred — D2).
- Non-relative / node_modules dependency mocking beyond what's needed to render fixtures.
- Framework support beyond the provided Vite + `dev-server-cli.js` contract.

## Open questions

Live grilling questions resolve into `decisions.md`. Fixture-specific questions live in
`golden-set.md`. Work claiming + status live in `tasks.md`.
