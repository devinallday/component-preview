# Product Vision — the coherent surface

_Created: 2026-07-06. Canonical product doc: **who** we serve, **what** the coherent product is,
and **what order** we build it. Competitive research lives in `product-landscape.md`; library
choices in `libraries.md`; distribution in `persistence-and-distribution.md`; the architectural
boundaries in `../seams.md`._

## The one primitive that makes it coherent

Everything is a view over a single artifact:

> **A Preview** = a *named, reproducible, verified rendered state* of a component — stored as
> `mock.tsx` + metadata (props/state, providers used, target state, model/prompt/context
> provenance, gate result).

This is the role Storybook's `.stories` file plays, but **agent-authored and gate-verified**. It is
the output of the `ComponentContext` contract in `vscode-extension/src/types.ts`. Keeping it a
stable typed artifact (D8) is what lets every surface stay coherent: **one artifact, one loop, many
surfaces.**

## Two input modes, one artifact (the Storybook reconciliation)

We split *authoring* (hard, agent-owned) from *tweaking* (fast, human-owned). Both edit the same
Preview — a chatbox alone is the wrong interface, and so is manual story-writing.

- **Direct control (Storybook-style).** Auto-generated **controls** from the prop types we already
  extract (`context.ts`), plus **state toggles** and viewport/theme. Instant, no LLM. The fast path
  for exploration. Control tweaks persist back into the Preview.
- **Agent.** Does what controls can't: generate the initial mock, wire providers, fabricate
  realistic nested data, reach structural states, and **fan out variants** ("show every state").
  Natural-language intent is for states you can't click to — a *fallback input*, not the product.

**Coherence rule:** controls edit `args`; the agent edits structure. One shared, multiplayer Preview.

## User profiles (empathy)

- **Maya — Design engineer.** JTBD: *see every state at real fidelity without running the whole
  app, and share a link.* Wants the variant gallery, theme/viewport, direct controls, annotate +
  share. Never wants to write a story.
- **Devin — Product engineer (daily driver).** JTBD: *polish this component fast and trust it
  works.* Wants one-click preview, auto-providers, the self-correcting loop, and committed named
  states he can reopen.
- **Sam — Staff/EM (the "non-product engineer / manager").** JTBD: *is the UI healthy, is this
  trustworthy, what does it cost, who maintains it?* Wants a golden-set regression number in CI,
  coverage visibility, bounded cost, near-zero maintenance.
- **⭐ The coding agent itself.** The under-named profile and the real "agentic era" move: another
  agent (Claude/Cursor in the repo) changes UI and needs to **see whether its change rendered
  correctly** — closing *its own* loop without a human. The Preview + verify gate become the **eyes
  of every other agent**, exposed via an agent-callable (MCP) interface.

## The product as one loop across four surfaces

Loop: **Discover → Preview → Refine → Verify → Save → Share → Track.** Identical everywhere;
surfaces expose different slices of the same artifact.

| Surface | Primary users | What they do with the *same* Preview |
|---|---|---|
| **IDE panel** | Devin, Maya | Author/iterate: preview, controls, variant gallery, theme/viewport, NL intent |
| **PR / CI** | Sam, Devin | Verify + review: gate runs, diffs post as PR comment, golden-set score |
| **Hosted link** | Maya, PMs | View/annotate a specific state — no repo, no `npm run dev` |
| **Agent tool (MCP)** | ⭐ the agent | Create/verify a Preview programmatically to check its own UI edit |

## Topological map — build order (dependencies flow upward)

**L0 is already built** (spine: S0/S1/S2 — context, generation, verify gate, stable artifact).

```
L0  FOUNDATION (done)          context-collection + generation + render-verify → Preview artifact
L1  CORE MUST-DOS  ← L0        out-of-box preview · self-correcting loop · variant fan-out
L2  DIRECT INTERACTION ← L1    auto-controls from types · variant gallery · viewport/theme
L3  PERSISTENCE & SHARING ← L1 pin-to-commit named Preview · hosted shareable link
L4  AGENT-NATIVE & MULTIPLAYER ← L2/L3   MCP interface · multiplayer live Preview ·
                                          golden-set regression in CI · visual baselines
```

### The three commitments

- **Core must-dos (L1) — no product without these.**
  - **Out-of-box preview** — one click, providers auto-wired. The promise.
  - **Self-correcting loop** — generate → render → read error → refine, automatically. The trust
    engine; failures don't become the human's problem.
  - **Variant fan-out** — agent renders all meaningful states by default, not one.
- **Natural extensions (L2–L3) — high value, each unlocked by L1.** Controls + gallery (direct
  manipulation over the variants we already generate), pin-to-commit, hosted links.
- **Frontier (L4) — the agentic-era payoff, only coherent once L1–L3 hold.** MCP surface,
  multiplayer, CI regression, visual baselines.

**Ordering rule:** nothing in L2–L4 is worth starting until L1 is solid on the golden set. Controls
over untrustworthy mocks — or a shared link to a broken render — actively destroys trust. **Depth on
L1 first, then breadth.**

## What we believe / don't believe

**Believe:**
- One verified, reproducible **Preview** artifact; every surface is a view over it.
- **Verification is the product** — it makes an agent-author trustworthy (the moat).
- The **self-correcting loop** and **variant fan-out** are the core.
- **Direct-manipulation controls + gallery** are a real need (borrowed from Storybook) — not
  everything should route through a chatbox.
- **Agent-native + multiplayer** are first-class surfaces, not afterthoughts.
- **Defaults carry 90%**; config is opt-in.

**Don't believe (non-goals / restraint):**
- **Rebuilding Storybook's authoring burden** — docs site, MDX, hand-written stories. We remove
  authoring; we keep its *controls*.
- **Committing every generated mock** — repo rot + review noise. **Ephemeral by default; pin to
  commit** (see `persistence-and-distribution.md`).
- **Runtime multi-agent swarms now** (D2) — nondeterminism before the single loop is trustworthy.
- **Visual regression on every component** — that's a separate product; scope baselines to the
  golden set (inward, measuring the generator).
- **Breadth as a proxy for ambition** — "unlimited resources" should buy depth on the loop + the
  agent surface, not three half-products.

**One line:** agent authors + humans directly manipulate, over one shared multiplayer Preview —
controls for the easy 90%, agent for the hard 10% and the variant fan-out; verification underneath
makes all of it trustworthy.
