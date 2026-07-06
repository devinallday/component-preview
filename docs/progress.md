# Progress Log

Append-only. Newest entries at the bottom. Keep terse and dated.

---

## 2026-07-06

- Reviewed README + full starter system (`vscode-extension/src/*`, `dev-server-cli.js`).
- Wrote `architecture.md` capturing current flow and known gaps.
- Identified the primary weak point: **shallow context collection** (`context.ts` only reads
  the component's own file), which will break context-dependent components like `Player`.
- Set up this `docs/` folder for cross-agent collaboration.
- Started an initial grilling session to lock down goals + where to spike. Decisions -> `decisions.md`.

- Interviewer feedback: also improve `vite-app` with more complex components; build a
  "golden set" (existing 4 + new complex ones) as an eval/regression harness.
- Wrote `golden-set.md`: coverage matrix (8 fixtures, grouped by capability axis) +
  proposed `.golden.ts` scoring model. New adds: `AsyncTrackList` (loading/error),
  `TrackMenuModal` (portal), `NowPlayingBar` (multi-context), `CreatePlaylistForm` (form).

### Next

- Resolve open design questions via grilling.
- Then pick the first spike and implement.
- Decide fixture location + scoring format (open questions in `golden-set.md`).

## 2026-07-06 (later) — grilling decisions recorded

- Reframed effort around **orchestration**: orchestrator + fast subagents pushing many
  directions, quality via objective gates. Dev-time only for now (runtime agents deferred).
- Recorded decisions **D1–D10** in `decisions.md` (spine-then-fan-out, tiered quality gate,
  workstreams, transitive context walk + provider detection, Playwright render gate, etc.).
- Folded the other agent's **golden set** in as workstream E and the eval substrate for the
  render gate (D4).
- Added `docs/tasks.md` task board (claim workstreams there before editing code).
- Finalized `goals.md` success criteria + scope.
- **No extension code changed** — plan-only pending user confirmation (D10).

### Next

- User confirms/adjusts D3–D9, then Phase 0 spine (S0→S1→S2) begins.

## 2026-07-06 (later 3) — HANDOFF: Phase 0 in progress

**Status:** D3–D9 CONFIRMED. Building the spine. Extension compiles clean (`npm run compile`).

- **S0 DONE** — pure structural refactor (D8). New `src/types.ts` (stable interfaces:
  `ComponentContext`, `CollectedFile`, `RequiredProvider`) and `src/server.ts` (moved
  `startDevServer`/`getPreviewUrl`/`stopServer` out of `preview.ts`). `preview.ts` = generation
  only; `context.ts` imports types; `extension.ts`/`webview.ts` imports updated. No behavior change.
- **S1 IN PROGRESS** — `context.ts` now walks the transitive **relative** import graph
  (TS compiler API, `MAX_DEPTH=4`, `MAX_FILES=25`) and `preview.ts` prompt now includes the
  collected dependency files + provider-wrapping instructions.
  - Verified on `Player.tsx`: deps = `usePlayerContext.ts`, `PlayerContext.ts`, `types/index.ts`. Good.
  - **KNOWN BUG (blocker for `Player`):** `detectRequiredProviders` finds the provider *name*
    (`PlayerProvider`, from the "must be used within a PlayerProvider" guard) but returns `[]`
    because `PlayerProvider.tsx` is **not reachable via imports** from `Player.tsx` — the
    component imports the *hook/context*, never the *provider*. Fix: locate the provider's
    exporting file by searching the workspace `src` (or the context's sibling dir) rather than
    only within the already-collected deps. Then re-verify providers is non-empty.
- **S2 NOT STARTED** — render-verification gate (Playwright), scored vs golden set.

**Coordination:** `tasks.md` S0=done(update), S1=in-progress, S2=todo (all owner=orchestrator).
Fan-out (A–E) still blocked on spine. Don't edit `types.ts` without coordinating (D8).

## 2026-07-06 (later 2) — seam analysis persisted

- Wrote `seams.md`: mapped the pipeline as 9 seams; identified the **four load-bearing
  seams** for a high-quality baseline — **context collection (#2), generation (#3), the mock
  artifact contract (#4), and verification (#6)**.
- Framed **agentic** experience as closing the verify→generate loop (self-correcting,
  intent-driven target states, escalation) — enabled by a stable artifact contract +
  verification signal, so the deferred runtime agents (D2) plug in rather than require a rewrite.
- Framed **team** value as persistence/provenance seams: committed named mocks, golden set as
  shared CI eval, repo-level provider config, reproducibility.
- Added an L0→L3 maturity ladder tying it together. Linked `seams.md` from `README.md`.
- No code changed; still plan-only (D10).

## 2026-07-06 (later 3) — product/library research report

- Compiled `docs/report/` (README + 3 files) on "Storybook for the agentic era":
  - `product-landscape.md`: Storybook primitives + Chromatic paid product mapped to our 9 seams;
    the agentic wedge = agent authors the story/mock, objective render+visual gate (#6) makes it
    trustworthy. Verification is the moat.
  - `libraries.md`: per-seam lib picks — **Vercel AI SDK** (`ToolLoopAgent` + structured output)
    around the current Anthropic model, **react-docgen-typescript** for prop types, **zod + faker
    bridge** for deterministic data, **MSW** for network isolation, **Playwright** for the render
    gate (confirms D9; same engine Storybook test-runner/Chromatic use). Build-vs-adopt calls.
  - `persistence-and-distribution.md`: seam #9 — committed `*.preview.tsx` + provenance (Tier 0),
    Cloudflare R2/Worker static host then Dynamic Workers (Tier 1), visual baselines in CI (Tier 2).
    Flagged content/control-plane domain isolation for serving agent-authored code.
- Two new decision candidates flagged for `decisions.md` (committed-artifact model; hosted-preview
  domain isolation). No code changed.

### Method note

- "Subagents" here = 1 serial `code_search` (Fast Context) pass over `vscode-extension/src` +
  parallel `search_web` batches. True parallel dev-time fan-out (D3/D5) is a cross-session
  orchestration pattern, not a single-tool capability — noted so expectations stay grounded.
