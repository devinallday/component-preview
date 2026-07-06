# Task Board

Coordination surface for parallel agents (see `decisions.md` D3/D7/D8).
**Before editing code, claim your workstream here** (set owner + status `in-progress` +
list files you will touch). Update to `done` when merged. Respect file ownership to avoid
collisions. Newest status wins; do not delete others' rows.

Status values: `todo` | `in-progress` | `blocked` | `done`

## Phase 0 — Spine (sequential, must land first)

| ID | Workstream | Owner | Status | Files (owned) | Notes |
|---|---|---|---|---|---|
| S0 | Refactor into owned modules + stable interfaces file | orchestrator | done | `src/context.ts`, `src/preview.ts`, new `src/server.ts`, new `src/types.ts` | Done; compiles clean |
| S1 | Context collection: transitive relative-import walk + provider detection | orchestrator | done | `src/context.ts` | D6; provider-file lookup fixed (workspace src scan); verified on Player |
| S2 | Render-verification gate (Playwright harness) | orchestrator | done | new `src/verify.ts`, `src/types.ts` (append), extension `package.json` | D4/D9; `verifyRender(url,{assertions})`; smoke-tested pass+fail on Player |

## Phase 1 — Fan-out (parallel, after spine)

| ID | Workstream | Owner | Status | Files (owned) | Notes |
|---|---|---|---|---|---|
| A | Feedback / iteration loop | _unclaimed_ | todo | `src/preview.ts` (generation), webview msg channel | D5a |
| B | Webview / UX (viewport, theme, re-mock, errors) | _unclaimed_ | todo | `src/webview.ts` | D5b |
| C | Multi-preview server manager (kill port 3000 + 2s wait) | _unclaimed_ | todo | `src/server.ts`, `dev-server-cli.js` | D5c |
| D | Mock caching / reuse | _unclaimed_ | todo | `src/preview.ts` (cache layer) | D5d — coordinate w/ A on `preview.ts` |
| E | Golden-set fixtures + scoring harness | _partially started_ | in-progress | `vite-app/src/...` fixtures, `*.golden.ts` | See `golden-set.md`; started by another agent |
| F | Pin-to-commit persistence (D12/Tier 0) | orchestrator | done | `src/types.ts` (append), `src/preview.ts` (pinPreview), `src/webviewProtocol.ts` (pin msg), `src/webview.ts` (handler), `src/extension.ts` (command), `package.json` | `*.preview.tsx` + `*.preview.json` provenance; compile clean |
| G | Static build path (build-cli.js) | orchestrator | done | `vite-app/build-cli.js` | Sibling to dev-server-cli.js; vite build → static dist; tested on mock.tsx |
| H | Local preview build script | orchestrator | done | `vite-app/build-previews.sh` | Finds all *.preview.tsx, builds each, serves via npx serve; tested end-to-end |
| I | Cloudflare Pages deployment | orchestrator | done | `vite-app/.env`, `vite-app/deploy-cloudflare.sh`, Cloudflare project | API token + account ID; project created; deployed to https://b79262e6.component-preview.pages.dev |

## Open cross-cutting questions

- Golden-set fixture location + scoring format (tracked in `golden-set.md`).
- `preview.ts` is shared by workstreams A and D — sequence them or split into `generate.ts` + `cache.ts`.
