# Seams, Baseline Quality & the Agentic/Team Path

_Last updated: 2026-07-06_

A **seam** = a boundary in the system where behavior can be observed, substituted, or
extended. Naming the seams tells us (1) where baseline quality is actually won or lost, and
(2) where we plug in agency and team features later without a rewrite. This is the
conceptual map that `decisions.md` (D1–D10) and `tasks.md` execute against.

## The pipeline as seams

Today's flow (`codelens → collectContext → generateMock → writeMockFile → dev-server → webview`)
is really a chain of seams:

| # | Seam | Current impl | What it decides | Baseline-critical? |
|---|---|---|---|---|
| 1 | **Discovery** | `codelens.ts` AST walk for JSX-returning decls | What is previewable at all | Medium |
| 2 | **Context collection** | `context.ts` — reads only the target file | How much the generator *knows* (types, hooks, providers, usage) | **CRITICAL** |
| 3 | **Generation** | `preview.ts` `generateMock` — one-shot prompt | Prompt/model strategy; where intent + few-shot plug in | **CRITICAL** |
| 4 | **Mock artifact contract** | `mock.tsx` default export consumed by `dev-server-cli.js` | The stable boundary between "generate" and "render"; lets both sides evolve independently | **CRITICAL** |
| 5 | **Execution / render** | `dev-server-cli.js` + spawned server (port 3000) | How a mock becomes pixels; build-system integration | Medium |
| 6 | **Verification** | _none today_ | Whether a mock is trustworthy (renders, no errors, meets golden assertions) | **CRITICAL** |
| 7 | **Presentation** | `webview.ts` bare iframe | How the user sees/controls the preview | Medium |
| 8 | **Feedback** | _none today_ | How human/agent intent re-enters generation | High (for agentic) |
| 9 | **Persistence / provenance** | `.component-preview/mock.tsx` (ephemeral, overwritten) | Whether mocks are reusable, shareable, reviewable | High (for teams) |

## Baseline quality: the four load-bearing seams

A "high-quality baseline" means: **a developer hits Preview on any of the golden-set
components and gets a correct, isolated render — reliably.** That is won at four seams:

1. **Context collection (#2)** — the root blocker. Must resolve the *dependency graph*:
   types, hooks, and especially **context providers** (`Player` throws without
   `PlayerProvider`). Without this, generation is guessing. → D6, task S1.
2. **Generation (#3)** — the prompt must consume that context and emit a mock that satisfies
   the artifact contract, including forcing hard-to-reach states (tooltip open, error state).
3. **Artifact contract (#4)** — a small, explicit, versioned contract (default-export React
   component; optional metadata like intended state). Stability here is what lets subagents
   own generation vs rendering independently. → D8 (stable interfaces file).
4. **Verification (#6)** — turns "did it work?" from vibe into signal: render in a headless
   browser, assert no console errors / no error boundary, and score against golden-set
   assertions. This is the gate that lets fast/cheap subagents be trusted. → D4, task S2.

Discovery, execution, and presentation matter for polish but are not where correctness is won.

## Making it agentic

Agency = closing the loop so the system **self-corrects without a human every turn**. The
seams already tell us how:

- **Verification (#6) feeds back into Generation (#3).** The core agentic loop:
  `collect → generate → render → verify → read errors → refine → re-verify`, bounded by a
  retry budget. A runtime error or failed assertion becomes the next prompt, not a dead end.
- **Intent as a first-class input at the Feedback seam (#8).** The user (or an agent) states
  a target state — "show the loading state", "make the dropdown open", "empty-playlist edge
  case" — and the loop drives toward it, verifying it was actually reached.
- **Provider-graph resolution at Context (#2).** Auto-detect required providers and let the
  agent decide how to wrap/mumble them, rather than failing.
- **Escalation, not silent failure.** If the loop exhausts its budget, it surfaces *why*
  (last error, what it tried) instead of a blank iframe.

This is the future **runtime** multi-agent architecture deferred in D2 — but designing the
seams now (stable artifact contract + verification signal) is what makes it a plug-in later,
not a rewrite. Baseline first, then the loop, then multi-agent.

## Making it useful for teams

Team value comes from turning ephemeral previews into **shared, reviewable repo assets** —
mostly at the Persistence (#9) and Verification (#6) seams:

- **Mocks as committed artifacts.** Persist named mocks next to components (e.g.
  `Component.preview.tsx` + metadata) instead of one overwritten `mock.tsx`. Now a teammate
  reopens the exact isolated state; mocks are reviewed in PRs.
- **Golden set as a shared regression eval.** The whole team's "did the mock-generator get
  better/worse?" becomes a CI number (see `golden-set.md`), not one person's vibe.
- **Repo-level convention/config.** A `preview.config` describing global providers/wrappers
  (theme, router, player) so every component in the repo renders consistently — encodes team
  knowledge once instead of re-deriving per component.
- **Provenance.** Record which model/prompt/context produced a mock, so results are
  reproducible and debuggable across the team.
- **Deterministic, reviewable states.** Named target states ("loading", "error", "empty")
  become a shared vocabulary the team previews and reviews against.

## Maturity ladder (how the seams compound)

- **L0 — Starter (today):** one-shot mock, single file of context, bare iframe. Works for
  `AlbumCard`, breaks on `Player`.
- **L1 — High-quality baseline:** seams #2/#3/#4/#6 solid. Any golden-set component renders
  correctly and is verified. _This is the current build target (Phase 0 spine)._
- **L2 — Agentic:** verification feeds generation; intent-driven target states; self-correcting
  loop with escalation. (Feedback seam + runtime agents, post-D2.)
- **L3 — Team:** persisted/named/committed mocks, shared golden eval in CI, repo config,
  provenance. Previews become durable team assets.

## Pointers

- Decisions & rationale: `decisions.md` (D1–D10).
- Execution board & file ownership: `tasks.md`.
- Fixtures/eval that back the Verification seam: `golden-set.md`.
- Current system + gaps: `architecture.md`.
