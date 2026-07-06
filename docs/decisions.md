# Decisions Log (ADR-style)

Design decisions made during planning/grilling sessions. Newest last. Each entry:
what was decided, why, and any rejected alternatives.

---

## Session 2026-07-06 — Initial grilling

_In progress. Decisions appended as we resolve open questions._

### D1 — Optimize for orchestration, not a single direction
The goal is not to pick one README direction. It's to plan how an **orchestrator (me)**
drives multiple **fast subagents** to push many directions in parallel while enforcing quality.

### D2 — "Subagents" = dev-time only (for now)
This session designs the **dev-time** orchestration: parallel agents building the tool,
coordinating through `docs/`. A **runtime** multi-agent mock-generation pipeline inside the
product is explicitly **deferred** — we'll revisit agent architecture once we're deeper into
the `vscode-extension`. The product pipeline stays straightforward until then.

### D3 — Parallelization strategy: spine-then-fan-out
_(Orchestrator call — user delegated: "you will figure it out.")_
The shared codebase is small (~6 files in `vscode-extension/src`) and nothing is worth
polishing until mocks actually render. So: land **one thin vertical slice sequentially**
(context collection + generation + render verification, proven on `Player`), which
stabilizes the core interfaces, **then fan out** parallel subagents on file-isolated
workstreams. Rejected: full-parallel-now (merge conflicts, unvalidatable mocks) and
parallel-by-file-ownership before the render path exists.

### D4 — Tiered quality gate
_(User: "depends on the work.")_
- **Full render-verification** (compile + lint + headless-browser render, asserting no
  console errors / no React error boundary) for anything on the **mock-generation / render path**.
- **Build + lint only** for peripheral work (webview styling, config, docs).
The render gate is scored against the **golden set** (see `golden-set.md`) — that harness
is the objective substrate that lets fast/cheap subagents be checked by the orchestrator.

### D5 — Workstreams (the fan-out set)
Spine: `context-collection + generation + render-verify`.
Parallel workstreams after the spine lands:
- **(a)** Feedback / iteration loop (refine a mock in NL without full regeneration).
- **(b)** Webview / UX (viewport, theme toggle, re-mock button, error surfacing).
- **(c)** Multi-preview server manager (remove hardcoded port 3000 + fixed 2s wait).
- **(d)** Mock caching / reuse.
- **(e)** Golden-set fixtures + scoring harness (owned jointly with the agent that started
  `golden-set.md`; it is the eval substrate for D4).

### D6 — Context-collection depth
Use the TS compiler API (already used in `codelens.ts`) to walk **relative imports
transitively** from the target component — capturing types, hooks, and **detecting required
context providers** (e.g. `usePlayerContext`'s thrown error → auto-wrap the mock in
`PlayerProvider`). Depth/size-capped to control token cost.

### D7 — Coordination protocol
Add `docs/tasks.md` as a lightweight task board (owner-agent, status, touched files).
Subagents update it on claim + completion; orchestrator reconciles. Decisions → `decisions.md`,
progress → `progress.md`, fixtures spec → `golden-set.md`.

### D8 — File-ownership boundaries
Before fan-out, refactor the monolith into separately-owned modules: `context.ts`,
`preview.ts` (generation), a new `server.ts` (server mgmt), `webview.ts`. Shared types live
in a stable interfaces file touched only by the spine, to prevent parallel collisions.

### D9 — Tooling
Add **Playwright** as a dev dependency (extension package) for the render gate. Keep the
Anthropic SDK + model as-is for now. No other new runtime deps.

### D10 — This session's deliverable = plan only
Stop at an agreed written plan (docs updated; no extension code changes yet). Begin coding
only after the user confirms shared understanding.

> Note: D3–D9 are orchestrator recommendations recorded under the user's explicit delegation
> ("you will figure it out" / "move faster"). Any of them can be revised; flag in `tasks.md`.
>
> **2026-07-06 — CONFIRMED.** User confirmed D3–D9 as written and cleared Phase 0 to begin
> (D10 satisfied). S0→S1→S2 in progress; see `tasks.md`.
