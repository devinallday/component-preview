# Goals

_Status: DRAFT — being refined via a grilling session (see `decisions.md`)._

## North star

Let a developer live-preview a React component **in isolation inside their IDE**, with AI
filling in whatever props/state/context the component needs to render in a useful state —
so they can iterate on UI polish and behavior faster than round-tripping through the full app.

## Why

- Faster, more focused iteration than a full dev server (no navigating the app to the right screen).
- Force otherwise-hard-to-reach states: a tooltip always open, a toast always showing, a loading/error state on demand.

## Success criteria (confirmed via grilling — see `decisions.md`)

- [ ] Can preview all four reference components: `AlbumCard`, `Tooltip`, `Dropdown`, `Player`.
- [ ] `Player` renders despite requiring `PlayerProvider` (context dependency resolved) — D6.
- [ ] An automated **render-verification gate** proves mocks mount without console errors /
      error boundaries, scored against the **golden set** — D4.
- [ ] Work is decomposed into orchestrated, file-isolated **workstreams** that fast subagents
      can execute in parallel after the spine lands — D3/D5/D8.
- [ ] User can give feedback and iteratively refine a mock without full regeneration — D5a.
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
