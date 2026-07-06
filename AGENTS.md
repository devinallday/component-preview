# Agent Working Instructions

Persistent instructions for any agent (or orchestrator + subagents) working in this repo.
Read `docs/README.md` first — `docs/` is the cross-agent source of truth.

## Logging (REQUIRED)

Keep a coherent, reviewable log of work over time so it can be presented at the end.

- **Every unit of work gets logged to `docs/progress.md`** — append-only, newest at the bottom.
- **Every entry is timestamped** with date **and** time (e.g. `## 2026-07-06 13:17 PDT — <summary>`).
  Get the real time with `date "+%Y-%m-%d %H:%M %Z"`; do not guess.
- Keep entries terse but specific: what changed, why, what was verified, what's next.
- When orchestrating subagents, log which subagent did what and the orchestrator's review outcome.
- Record design decisions (with reasoning) in `docs/decisions.md`; update the task board in `docs/tasks.md`.
- Do not rewrite history — append.

## Coordination

- Claim a workstream in `docs/tasks.md` (owner + status + files) before editing code (D3/D7/D8).
- `vscode-extension/src/types.ts` is the stable-interface seam — don't edit without coordinating (D8).
- Prefer minimal, focused changes over speculative rewrites.

## Build / verify

- Extension: `cd vscode-extension && npm run compile` (tsc) and `npm run lint`.
- Full quality gate for the mock/render path is the Playwright render-verify gate (D4/D9),
  scored against the golden set (`docs/golden-set.md`). Build+lint suffices for peripheral work.
