# Product Landscape: Storybook, Chromatic, and the Agentic Wedge

_Created: 2026-07-06._

## 1. What Storybook actually is (the incumbent)

Storybook is a workshop for building/testing/documenting UI components in isolation. Its
primitives, and how each maps to our seams:

| Storybook primitive | What it does | Our seam analog |
|---|---|---|
| **Story (CSF)** | A named, rendered example of a component in a specific state, as code. The unit of everything. | #4 Mock artifact contract (`mock.tsx`) |
| **`args` / `argTypes`** | Typed, editable inputs to a story; auto-derived from prop types. | #2 Context + #3 Generation inputs |
| **Controls addon** | Live UI to tweak `args` without editing code. | #7 Presentation (interactive) |
| **Decorators** | Wrap a story in providers/context/layout (theme, router, store). | #2 Provider-graph resolution (our `PlayerProvider` problem) |
| **`play` function** | Scripted interactions (click/type) + assertions via Testing Library. | #6 Verification (interaction) |
| **Autodocs** | Generates docs/prop tables from types (`react-docgen` / `react-docgen-typescript`). | #2 Context (type extraction) |
| **Test addon (Vitest)** | Runs stories as tests in a real browser — render, interaction, a11y, coverage. | #6 Verification |
| **Test-runner (Jest+Playwright)** | Turns every story into a headless-browser smoke/interaction test in CI. | #6 Verification |

**Key insight:** Storybook's decorators are exactly our provider problem (D6), and its
`args`/`argTypes` derived from types is exactly our context-collection ambition (D6/S1). The
"stories are tests" model (test-runner, powered by **Jest + Playwright**) is precisely the D4/D9
render gate we already chose. We are, in effect, rebuilding the load-bearing half of Storybook —
so we should borrow its proven mechanisms, not reinvent them.

## 2. What Chromatic adds (the paid product)

Chromatic is built by the Storybook team and monetizes the **verification + review + persistence**
seams:

- **Visual testing** — snapshots every story across browsers/viewports, diffs against a baseline,
  flags visual regressions. This is seam #6 upgraded from "renders without error" → "looks
  correct." Pricing is per-**snapshot**.
- **TurboSnap** — only re-snapshots stories affected by a git diff (dependency-graph aware), to
  cut cost/time. Now a paid tier.
- **UI Review** — PR-style human review workflow on visual diffs; approvals gate merges.
- **Playwright / Cypress integration** — reuses existing E2E tests as visual tests, not just
  Storybook stories.
- **Hosted Storybook + permalinks** — publishes each build to a shareable URL (this is seam #9,
  persistence/distribution, as a hosted product).

**Key insight:** Chromatic's entire business is *"turn stories into an objective, reviewable,
persisted regression signal."* That is our seams #6 (verification) and #9 (persistence). The
strategic lesson: **the artifact (story/mock) is cheap; the trustworthy signal and the shared,
durable record are what people pay for.** Our golden-set eval (`../golden-set.md`) is a
mini-Chromatic aimed inward at the *generator*.

## 3. The agentic wedge — what changes when the author is an agent

Storybook/Chromatic assume a **human writes the story**. Every feature is a human-ergonomics play
(nice UI to tweak args, nice diffs to review). Two things flip in the agentic era:

1. **Authoring cost → ~0, coverage → automatic.** If an agent reliably writes the mock/story,
   "coverage" stops being a discipline problem. The bottleneck moves entirely to **trust**: can you
   believe the agent-authored render? → This is why **verification (#6) is the whole game**, and
   why D4's render gate is the correct primary investment, not the webview polish.

2. **The feedback loop replaces the controls panel.** Storybook's value-add UI (Controls,
   Interactions panel) exists so a *human* can nudge a story toward a target state. An agent
   nudges via **natural-language intent → generate → render → read errors → refine** (seam #8, our
   D5a). The "controls" become an *intent channel*, and the interaction script (`play`) becomes
   something the **agent authors and the gate verifies**, not something a human hand-writes.

### Concrete feature translations (Storybook/Chromatic → agentic)

| Their feature (human-authored) | Agentic-era version (agent-authored, gate-verified) |
|---|---|
| Write a `Story` per state | Agent enumerates target states from types+usage; emits a mock per state |
| Controls panel to tweak args | NL intent ("show empty-playlist error") drives regeneration (#8) |
| Decorators for providers | **Auto-detected** provider graph, agent wraps the mock (D6) |
| `play` function hand-written | Agent proposes interactions to force hidden states (tooltip open); gate runs them |
| Autodocs from types | Type extraction is *input to generation*, not just docs (#2) |
| Chromatic visual baseline | Golden-set visual/DOM assertions as the generator's regression eval (#6) |
| Chromatic UI Review | Human reviews only when the gate is *uncertain* (escalation, per `seams.md`) |
| Hosted Storybook permalink | Shareable hosted preview of a specific mock (see `persistence-and-distribution.md`) |

## 4. Strategic takeaways for our build

- **We are not competing with Storybook's workshop; we are removing the authoring step.** Position
  the tool as "hit Preview, get a verified isolated render — no story to write."
- **Invest disproportionately in the verification seam (#6).** It is both Chromatic's moat and the
  thing that makes an agent author trustworthy. Everything else (webview polish, controls) is
  secondary and is exactly where the incumbents already win on human ergonomics.
- **Steal the mechanisms, not the UI.** Decorators→provider detection, argTypes→type extraction,
  test-runner→our Playwright gate (D9), stories-as-tests→golden set. These are validated designs.
- **Persistence is the team wedge (L3).** Chromatic proves people pay to make ephemeral previews
  into shared, reviewable, durable records. See `persistence-and-distribution.md`.

## Sources

- Storybook interaction/visual/test docs; `@storybook/test-runner` (Jest+Playwright).
- Storybook `react-docgen` vs `react-docgen-typescript` typescript config.
- Chromatic pricing, visual-test, TurboSnap, and Playwright/Cypress integration pages.
