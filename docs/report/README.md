# Report: Storybook-for-the-Agentic-Era — Product & Library Research

_Created: 2026-07-06. Owner: research pass (orchestrator)._

## Why this exists

The user framed the north star as **"Storybook, but built for an agentic era."** This report
surveys (1) what Storybook + its paid product **Chromatic** actually give teams, (2) which
libraries are worth reaching for to get a good **agentic** experience inside the VS Code
extension, and (3) how to **persist and distribute mocks outside the editor** (artifacts,
Cloudflare, etc.).

It is deliberately mapped onto the **nine seams** already defined in `../seams.md` so
recommendations plug into existing decisions (`../decisions.md` D1–D10) rather than proposing a
rewrite.

## Files

- **`product-landscape.md`** — Storybook feature surface + Chromatic paid product. What the
  "manual, human-authored" incumbent does, and what changes when an agent (not a human) is the
  author of stories/mocks. The strategic wedge.
- **`libraries.md`** — Concrete library recommendations per seam: LLM/agent SDK, prop-type
  extraction, deterministic mock data, network mocking, render/verification harness, webview UI.
  Each with a fit note against the current code and a build-vs-adopt call.
- **`persistence-and-distribution.md`** — Getting mocks out of the editor: committed repo
  artifacts, a shareable preview URL, and the Cloudflare (Workers/R2/Durable Objects) options for
  hosting ephemeral previews. Maps to seam #9 (Persistence/provenance).

## TL;DR (the thesis)

- **Storybook's moat is the `stories` file**; Chromatic's moat is **turning those stories into a
  visual-regression eval in CI.** Both assume a *human* wrote the story. The agentic wedge is:
  **the agent authors the story/mock, and an objective render+visual gate (our seam #6) is what
  makes the agent trustworthy.** We already decided this (D4) — the industry validates it.
- **Don't build a framework; assemble a thin agentic loop.** Reach for **Vercel AI SDK v5/6**
  (`ToolLoopAgent` + structured output) around the existing Anthropic model, **Playwright** for the
  render gate (D9, same engine Chromatic/Storybook test-runner use), **react-docgen-typescript**
  for prop types, **MSW** for network isolation, and **zod + a faker bridge** for deterministic
  fallback data.
- **Persistence is the team unlock.** Move from one overwritten `mock.tsx` to **committed named
  `*.preview.tsx` + provenance metadata** (seam #9), and offer a **shareable hosted preview** via
  Cloudflare Workers + R2 for review outside the IDE.

## How to read this against the existing plan

| This report section | Existing seam(s) | Existing decision(s) |
|---|---|---|
| Product landscape → agent-authored stories | #3 Generation, #6 Verification | D4 |
| Agent loop / SDK | #3 Generation, #8 Feedback | D2 (runtime deferred), D5a |
| Prop-type + context extraction libs | #2 Context collection | D6 |
| Mock-data + network mocking libs | #3 Generation, #4 Artifact contract | D8 |
| Render/visual verification libs | #6 Verification | D4, D9 |
| Webview UI libs | #7 Presentation | D5b |
| Persistence + hosted previews | #9 Persistence/provenance | (new — L3 on the ladder) |
