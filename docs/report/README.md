# Report: Storybook-for-the-Agentic-Era — Product & Library Research

_Created: 2026-07-06. Owner: research pass (orchestrator)._

## Why this exists

The user framed the north star as **"Storybook, but built for an agentic era."** This report
surveys (1) what Storybook + its paid product **Chromatic** actually give teams, (2) which
libraries are worth reaching for to get a good **agentic** experience inside the VS Code
extension, and (3) how to **persist and distribute mocks outside the editor** (artifacts,
Cloudflare, etc.).

It is deliberately mapped onto the **nine seams** already defined in `../seams.md` so
recommendations plug into existing decisions (`../decisions.md`) rather than proposing a rewrite.

> **Start here:** `product-vision.md` is the canonical product doc (personas, the coherent surface,
> build order, beliefs/non-goals). The other files are supporting research it draws on.

## Files

- **`product-vision.md`** — **canonical.** User profiles, the one-artifact/one-loop/four-surfaces
  model, the two input modes (direct-manipulation controls + agent), the L0→L4 topological build
  map, and what we believe / don't believe. Read this first.
- **`product-landscape.md`** — Storybook feature surface + Chromatic paid product. What the
  "manual, human-authored" incumbent does, and what changes when an agent (not a human) is the
  author of stories/mocks. The strategic wedge.
- **`libraries.md`** — Concrete library recommendations per seam: LLM/agent SDK, prop-type
  extraction, deterministic mock data, network mocking, render/verification harness, webview UI.
  Each with a fit note against the current code and a build-vs-adopt call.
- **`persistence-and-distribution.md`** — Getting mocks out of the editor: committed repo
  artifacts, a shareable preview URL, and the Cloudflare (Workers/R2/Durable Objects) options for
  hosting ephemeral previews. Maps to seam #9 (Persistence/provenance).

## TL;DR

- **The wedge** (full argument in `product-vision.md`): both Storybook and Chromatic assume a
  *human* authors the story; the agentic move is **the agent authors the Preview and an objective
  render/verify gate (seam #6) makes it trustworthy.** Verification is the moat (D4).
- **Assemble a thin loop, don't build a framework** (`libraries.md`): **Vercel AI SDK** around the
  existing Anthropic model, **Playwright** gate (D9), **react-docgen-typescript** for prop types,
  **MSW** for network isolation, **zod + faker** for deterministic data.
- **Persistence is the team unlock** (`persistence-and-distribution.md`): **ephemeral by default,
  pin-to-commit** named `*.preview.tsx` + provenance, then a Cloudflare-hosted shareable preview.

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
