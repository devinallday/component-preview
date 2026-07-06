# Component Preview — Working Docs

This folder is the shared source of truth for work on the **Component Preview** tool
(a VS Code extension that live-previews React components in isolation, using AI to
mock their props/context). It is intended for **cross-agent collaboration**: any agent
or human picking up this project should read these docs first.

## Files

- **`goals.md`** — The north star + success criteria (concise). Fuller product surface → `report/`.
- **`seams.md`** — The system's architectural seams, which four are load-bearing for a high-quality baseline, and the path from baseline → agentic → team-useful.
- **`decisions.md`** — Design decisions (ADR-style), with rationale. D1–D10 (build plan) + D11–D14 (product surface).
- **`architecture.md`** — Snapshot of how the current system works (post-spine) and the remaining gaps.
- **`tasks.md`** — Task board: workstream ownership + status. Claim here before editing code.
- **`golden-set.md`** — Fixture/eval spec backing the verification seam.
- **`progress.md`** — Append-only, timestamped running log. Update every session.
- **`report/`** — Product & library research. **Start at `report/product-vision.md`** (canonical
  product doc); then `product-landscape.md`, `libraries.md`, `persistence-and-distribution.md`.

## Conventions

- Keep entries dated and terse.
- When you finish a chunk of work, append to `progress.md` (don't rewrite history).
- When a design decision is made, record it in `decisions.md` with the reasoning, not just the outcome.
- Prefer minimal, focused changes over speculative rewrites.
