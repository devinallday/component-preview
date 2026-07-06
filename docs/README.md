# Component Preview — Working Docs

This folder is the shared source of truth for work on the **Component Preview** tool
(a VS Code extension that live-previews React components in isolation, using AI to
mock their props/context). It is intended for **cross-agent collaboration**: any agent
or human picking up this project should read these docs first.

## Files

- **`goals.md`** — What we are building and why. The north star + success criteria.
- **`seams.md`** — The system's architectural seams, which four are load-bearing for a high-quality baseline, and the path from baseline → agentic → team-useful.
- **`progress.md`** — Running log of what has been done, what's in flight, and what's next. Update this every session.
- **`decisions.md`** — Design decisions (ADR-style) made during grilling/planning sessions, with rationale.
- **`architecture.md`** — Snapshot of how the current system works and where the gaps are.

## Conventions

- Keep entries dated and terse.
- When you finish a chunk of work, append to `progress.md` (don't rewrite history).
- When a design decision is made, record it in `decisions.md` with the reasoning, not just the outcome.
- Prefer minimal, focused changes over speculative rewrites.
