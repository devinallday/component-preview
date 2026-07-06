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

## 2026-07-06 14:53 PDT — generation prompt: variant fan-out (seam #3)

- Improved `preview.ts` `generateMock` prompt to render **multiple variants** instead of one.
  New "Render multiple variants" section instructs the model to: (1) identify enumerable prop
  axes — string-literal unions/enums, booleans, and prop-driven discrete internal states
  (e.g. injected fetcher → loading/success/error); (2) render **one variant per enum member**
  so all values are visible at once; (3) compose them as a **labeled gallery inside the single
  default export** (the dev-server contract renders only the default export — called out
  explicitly); (4) hold shared/complex props constant and pick the most meaningful axis rather
  than a full cross-product; (5) fall back to a single instance when there are no enumerable axes.
  Replaced the single-instance example with a labeled enum-gallery example.
- Best demonstrators (for eval / manual check): **Tooltip** (`position` 4-value union + flagship
  force-visible), **AsyncTrackList** (`loading|success|error` via injected `fetchTracks`),
  **Dropdown** (`align` 3-value union); TrackItem (boolean flags) secondary. AlbumCard/Player weak.
- Verified: `npm run compile` clean. Not yet run against a live LLM.
- Touches generation seam only; coordinate w/ workstreams A (feedback) + D (caching) on `preview.ts`.

### Next
- Consider surfacing variant count/labels as mock metadata for the verify gate + webview gallery (B).

## 2026-07-06 15:06 PDT — pin-to-commit persistence (D12/Tier 0) complete

- Implemented workstream F: pin-to-commit persistence (ephemeral-by-default, explicit pin to committed artifact).
- Added `PreviewMetadata` type to `types.ts` (provenance: componentName, componentPath, pinnedAt, model, promptHash, contextFiles, requiredProviders).
- Added `pinPreview()` to `preview.ts`: writes `ComponentName.preview.tsx` + `ComponentName.preview.json` sidecar next to the component; computes promptHash from mockCode + context file paths.
- Extended `webviewProtocol.ts`: added `{ type: "pin" }` message.
- Extended `webview.ts`: added pin handler (executes `component-preview.pin` command); added `currentComponentContext` module var; updated `showPreview()` to accept/store componentContext.
- Added `component-preview.pin` command to `extension.ts`: full flow (collectContext → generateMock → pinPreview → notification); reuses existing context + generation logic.
- Registered command in `package.json`.
- Claimed workstream F in `tasks.md` (in-progress → done).
- Verified: `npm run compile` clean.
- Next: static build path (`build-cli.js`) to export pinned previews for PR/hosting (Tier 1).

## 2026-07-06 15:06 PDT — static build path complete

- Created `vite-app/build-cli.js`: static build sibling to `dev-server-cli.js`. Same alias/CSS/theme-bridge logic; runs `vite build` instead of `createServer`.
- Usage: `node build-cli.js --entry <path-to-mock.tsx> --out <dist-dir>`. Outputs self-contained static bundle (HTML + hashed JS/CSS).
- Tested: built `.component-preview/mock.tsx` → `.component-preview/dist/` (197KB JS, 20KB CSS, 1KB HTML). Clean.
- Claimed workstream G in `tasks.md` (done).
- Next: integrate build into pin command OR GitHub Action workflow for PR previews (Cloudflare Pages).

## 2026-07-06 15:08 PDT — local preview build script complete

- Created `vite-app/build-previews.sh`: finds all `*.preview.tsx` files (excludes node_modules/.component-preview), builds each with `build-cli.js` to `.component-preview/dist/<safe_name>`.
- Created test preview `AlbumCard.preview.tsx` to demonstrate flow.
- Tested end-to-end: script found preview → built to `.component-preview/dist/src_components_Album_AlbumCard/` → served via `npx serve` → `http://localhost:54552`.
- Minimal local flow: pin → `./build-previews.sh` → `npx serve .component-preview/dist` → URL.
- Claimed workstream H in `tasks.md` (done).
- GitHub Action `.github/workflows/deploy-previews.yml` also created (Cloudflare Pages) for future CI/PR use.

## 2026-07-06 15:14 PDT — Cloudflare Pages deployment complete

- Created `vite-app/.env`: stores `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- Updated `vite-app/deploy-cloudflare.sh`: loads from `.env`, validates token, builds previews, deploys to Cloudflare Pages with `--commit-dirty=true` to silence git warning.
- Created Cloudflare Pages project `component-preview` with production branch `main`.
- Deployed successfully: `AlbumCard.preview.tsx` → https://b79262e6.component-preview.pages.dev
- Full flow: pin preview → `*.preview.tsx` committed → `./deploy-cloudflare.sh` → public URL.
- Claimed workstream I in `tasks.md` (done).
- GitHub Action ready for CI/PR use (same secrets needed in repo settings).

## 2026-07-06 14:57 PDT — Theme and scrolling fixes deployed

- **Theme fixed**: Two-layer theme bridge operational
  - Document layer: Inline script in `dev-server-cli.js` reads `?previewTheme=` query param and listens for `set-theme` postMessage, sets `data-theme`/`class`/`colorScheme` on `<html>`
  - App-state layer: `previewThemeBridge.ts` exports `getPreviewThemeFromQuery()` and `subscribeToPreviewTheme()`; `ThemeProvider.tsx` seeds initial theme from query and subscribes to live toggles
  - Mock updated: Replaced generic mock with `theme-verify-mock.tsx` (wraps NowPlayingBar in ThemeProvider + PlayerProvider)
  - Verified via Playwright: ALL CHECKS PASSED (light/dark toggle works via query param and postMessage)
- **Scrolling fixed**: Changed `.stage` `justify-content: center` → `flex-start` in `styles.css` to prevent overflow clipping
- Extension compiled clean (`npm run compile`)
- Temp files cleaned: removed `theme-verify.mjs`
