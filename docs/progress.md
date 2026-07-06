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

## 2026-07-06 13:10 PDT — product/library research report
<!-- (was mislabeled "(later 3)", colliding with the Phase-0 handoff entry; renamed to timestamp) -->

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

## 2026-07-06 13:18 PDT — orchestration session start (new agent)

- New orchestrator agent picked up the handoff. Read full spine (`types.ts`, `context.ts`,
  `preview.ts`, `server.ts`) + Player dependency chain (`Player.tsx` → `usePlayerContext.ts`
  → `PlayerContext.ts`; provider lives at `contexts/PlayerProvider.tsx`, NOT import-reachable).
- Confirmed the S1 blocker root cause: `detectRequiredProviders` finds the name `PlayerProvider`
  but `files.find(...)` only searches already-collected deps, which never include the provider.
- Added `AGENTS.md` with a REQUIRED timestamped-logging convention for coherent review/presentation.
- Plan: fan out fast subagents under orchestrator review. Kicking off (parallel, disjoint files):
  **S1** provider-file lookup fix (`context.ts`) + **S2** Playwright render-verify gate
  (`verify.ts`, extension `package.json`). Golden-set (E) to follow after spine review (D3).

## 2026-07-06 13:27 PDT — Phase 0 spine COMPLETE (S1 + S2 landed via parallel subagents)

Ran two fast subagents in parallel (disjoint files) under orchestrator review:

- **S1 DONE** (subagent → `context.ts` only). Fixed the provider-lookup blocker: when a
  detected provider name (e.g. `PlayerProvider`) isn't in the collected import graph, we now
  lazily scan the nearest `src` tree (skips node_modules/.git/dist/out/build, capped 2000 files),
  locate the exporting file via the existing export regex, and fold that provider file **plus its
  transitive relative deps** into `dependencies` (deduped by abs path). Existing behavior preserved.
  - Verified on `Player.tsx`: `requiredProviders` = `[{PlayerProvider, .../contexts/PlayerProvider.tsx}]`;
    `dependencies` now includes `PlayerProvider.tsx` + `data/mockData.ts`. Compile + lint clean.
  - Orchestrator reviewed the diff: lazy-scan (only when needed), dedup, and fallbacks are sound.

- **S2 DONE** (subagent → new `verify.ts`, appended `types.ts`, extension `package.json`).
  Playwright headless render gate (seam #6, D4/D9). `verifyRender(url, {assertions?})` captures
  console errors, uncaught `pageerror`s, `vite-error-overlay`, error-text indicators, and whether
  `#root` mounted content; optional golden-set assertion scoring (`{state, mustContain[]}`).
  Decoupled from `server.ts` (takes only a URL). New stable interfaces `VerifyResult`,
  `GoldenAssertion`, `AssertionResult` appended to `types.ts` (append-only, D8).
  - E2E smoke (no LLM): correct mock `<PlayerProvider><Player/></PlayerProvider>` → `ok:true`;
    broken mock `<Player/>` (no provider) → `ok:false`, provider guard captured. Temp files cleaned.
  - Playwright installed as dev dep; `npx playwright install chromium` succeeded.
  - **Gotcha (decision candidate):** extension `tsconfig.json` has `lib:["ES2022"]`, no DOM. Playwright
    types + `page.evaluate` need DOM globals. Subagent contained it to a file-scoped
    `/// <reference lib="dom" />` in `verify.ts` rather than editing shared tsconfig. Fine for now;
    could instead add `"DOM"` to shared tsconfig `lib` if more browser-side code appears.

- Orchestrator re-ran the COMBINED spine: `npm run compile` + `npm run lint` both **clean**.
- **The full spine (context → generation → render-verify) is now in place.** Still untested with a
  live LLM (no Anthropic key run yet) — generation prompt already injects deps + provider-wrapping.

### Next
- Fan-out is now unblocked (D3). Next: workstream **E** (golden-set fixtures + `*.golden.ts` using
  the `{targetStates, assertions:[{state, mustContain[]}]}` contract that S2 consumes).
- Later: wire `verifyRender` into the extension's generate→render flow (caller owns server lifecycle).

## 2026-07-06 13:32 PDT — product vision written + docs consolidated

- Wrote **`report/product-vision.md`** as the **canonical** product doc: the one-Preview-artifact
  model, four personas (incl. ⭐ the coding agent as a user), two input modes (direct-manipulation
  controls + agent), the **L0→L4 topological build map** + three commitments, and beliefs/non-goals.
- Recorded product decisions **D11–D14** in `decisions.md`: (D11) keep Storybook-style controls +
  variant gallery alongside the agent — chatbox is fallback; (D12) Previews ephemeral by default,
  **pin-to-commit**; (D13) agent-native (MCP) + multiplayer as first-class surfaces (D2 still stands);
  (D14) hosted previews on a domain isolated from any control plane.
- **Consolidated to remove repetition:** `report/README.md` now points to product-vision as canonical
  (trimmed duplicated thesis); `product-landscape.md` strategic-takeaways trimmed + "controls kept"
  correction; `persistence-and-distribution.md` reconciled to pin-to-commit (D12/D14).
- **Cleaned stale docs:** `architecture.md` refreshed to post-spine reality (module map, deep context,
  `verify.ts`) with an accurate remaining-gaps list; `goals.md` success criteria checked off (S1/S2)
  + added self-correcting loop & variant fan-out; `README.md` index now lists all docs + `report/`.
- Fixed a duplicate `(later 3)` heading collision above (renamed the research entry to a timestamp).
- No extension code changed — docs only.
