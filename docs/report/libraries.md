# Library Recommendations (per seam)

_Created: 2026-07-06. Grounded in the current extension code (see `../architecture.md`)._

Current runtime deps are intentionally minimal: `@anthropic-ai/sdk` (model
`claude-sonnet-4-5-20250929`), the TS compiler API (via `typescript`, already used in
`codelens.ts`), and `dev-server-cli.js` for rendering. Recommendations below are additive and
seam-scoped, with a build-vs-adopt call each.

---

## Seam #3 Generation + #8 Feedback — the agent loop

### Recommend: **Vercel AI SDK (`ai`, v5/v6)** wrapping the existing Anthropic model

- **Why:** The current `generateMock` is a single `client.messages.create` call that string-matches
  a markdown code block out of the response (`preview.ts:49-61`). That is exactly the brittle part
  the agentic loop needs to replace. AI SDK gives, in one library:
  - `ToolLoopAgent` — a built-in **tool loop with a step budget** (`stopWhen: stepCountIs(n)`),
    which *is* the `generate → render → verify → refine` loop from `../seams.md` §"Making it
    agentic", with `onStepFinish`/lifecycle hooks to enforce guardrails and abort.
  - **Structured output** (`Output.object(zodSchema)`) — replaces regex code-extraction with a
    validated `{ mockCode, targetState, providersUsed, ... }` object. This directly hardens the
    **artifact contract (#4)**.
  - **Provider-agnostic** — keeps the Anthropic model (D9 says keep it) but lets us swap/add providers later
    with no call-site change.
  - **Tools** — the render gate (#6), file reads for context (#2), and provider detection can be
    exposed as tools the model calls, giving a real ReAct loop instead of one-shot.
- **Fit / caveat:** With Anthropic, forcing a JSON schema and extended *thinking* simultaneously
  conflicts (`tool_choice: {type: tool}` is rejected with thinking on) — known AI SDK issue #7220.
  Mitigation: use `Output` without forced thinking, or the documented middleware patch. Note this
  in the spine work (S0/S1).
- **Alternative considered:** Anthropic's own **Agent SDK** (`@anthropic-ai/agent-sdk`, the Claude
  Code engine) has native sub-agent spawning + context compaction. Powerful, but heavier and
  Anthropic-locked; overkill for a bounded 3–5 step mock loop. **Adopt AI SDK; revisit Agent SDK
  only if D2's runtime multi-agent pipeline is un-deferred.**
- **Build-vs-adopt:** *Adopt* AI SDK. Do **not** hand-roll the tool loop.

---

## Seam #2 Context collection — types & provider graph

### Recommend: **`react-docgen-typescript`** for prop extraction, TS compiler API for the import walk

- **Why:** D6/S1 wants transitive relative-import walking + provider detection + types. Two layers:
  - **Prop/type shape:** `react-docgen-typescript` invokes the real TS compiler, so it resolves
    *imported* union types, generics, and JSDoc — the exact things a naive AST parser (and the
    lighter `react-docgen`) collapses to `string`. This is what Storybook uses for accurate
    `argTypes`; it's the highest-signal, lowest-effort input we can hand the generator. Trade-off:
    ~2s/component compiler overhead (cache it — see caching workstream D5d).
  - **Import graph + provider detection:** stay on the **TS compiler API** we already load in
    `codelens.ts`. Walk relative imports (depth/size-capped per D6), and detect provider
    requirements by finding `useXContext()` calls whose hook throws without a provider (the
    `Player`/`PlayerProvider` case).
- **Build-vs-adopt:** *Adopt* `react-docgen-typescript` for prop types; *build* the import-graph +
  provider-detection walk on the compiler API (it's small, domain-specific, and owned by S1).

---

## Seam #3/#4 — deterministic mock **data** (fallback + cheap path)

### Recommend: **`zod` + a zod→faker bridge** (`zod-schema-faker` or `zod-to-mock-data`)

- **Why:** Not every field needs an LLM. For typed domain props (`Album`, `Track`), a schema-driven
  faker produces realistic, **deterministic (seeded)** data instantly and for free — ideal for the
  caching/optimistic path (D5d) and for making golden-set renders reproducible. The LLM is then
  reserved for the genuinely contextual decisions (which *state* to force, how to wrap providers).
  This is the same split the `mocky` project formalizes (faker for pattern fields, LLM for
  contextual content).
- **How it composes:** the generation step emits a **zod schema** for props (structured output),
  the faker bridge fills it deterministically, and only ambiguous/contextual fields are
  LLM-authored. Zod is also the natural schema for the AI SDK structured output above — one
  dependency, two uses.
- **Build-vs-adopt:** *Adopt* `zod`; *adopt* a thin zod→faker lib but wrap it behind our own
  interface (these libs are small/young — avoid deep coupling).

---

## Seam #5 Execution — network & module isolation at render time

### Recommend: **MSW (Mock Service Worker)** for network; keep `dev-server-cli.js` for bundling

- **Why:** Components like the planned `AsyncTrackList` fixture fetch data. In isolation those
  fetches fail, producing a perpetual loading/error render that looks like a generation bug but is
  really an environment gap. **MSW intercepts at the network layer** (Service Worker in browser),
  so the mock renders against deterministic responses without touching component code — the same
  pattern Storybook uses for network-dependent stories. This lets the agent *force* loading /
  success / error states by choosing the MSW handler, which is exactly the async axis in
  `../golden-set.md`.
- **Fit:** injected via the generated mock's provider wrapper (alongside detected React providers),
  so it lives at the artifact-contract layer (#4), not in `dev-server-cli.js`.
- **Build-vs-adopt:** *Adopt* MSW. Keep `dev-server-cli.js` as the Vite bundling/HMR host (per
  README contract); don't replace it yet.

---

## Seam #6 Verification — the render/visual gate (the important one)

### Recommend: **Playwright** (already D9) as the headless render + assertion + screenshot engine

- **Why:** D4/D9 already chose Playwright. Validation from the product research: **Storybook's
  test-runner and Chromatic both run on Playwright** for exactly this — mount a component in a real
  browser, assert no console errors / no error boundary, run scripted interactions, and capture
  screenshots. We get three tiers off one dependency:
  1. **Smoke** — page loads, no `console.error`, no React error-boundary text. (Baseline gate.)
  2. **Assertion** — golden-set `assertions` per target state appear (`../golden-set.md`).
  3. **Visual (later, Chromatic-style)** — screenshot + pixel/DOM diff against a stored baseline;
     this is the L3/team upgrade and the natural place a hosted service (below) plugs in.
- **Optional add:** `@axe-core/playwright` for a11y assertions (Storybook's test addon includes
  a11y) — cheap, high-signal, defensible.
- **Build-vs-adopt:** *Adopt* Playwright + the harness code is *ours* (`src/verify.ts`, S2). The
  console/error-boundary capture and golden scoring are domain logic we own.

---

## Seam #7 Presentation — webview UX

### Recommend: keep it light — **plain iframe now**; if it grows, a React webview with `@vscode/webview-ui-toolkit` + Vite

- **Why:** `webview.ts` is a bare iframe today (correctly minimal). D5b wants viewport/theme/re-mock
  controls + error surfacing. That's a small toolbar around the iframe — doesn't justify a heavy
  framework yet. If/when the panel becomes interactive (intent input box for the #8 feedback loop,
  state switcher, diff view), adopt a React webview bundled with Vite and VS Code's webview UI
  toolkit for native-looking, theme-aware controls with minimal CSS.
- **Build-vs-adopt:** *Build* the toolbar now (tiny). *Adopt* a webview framework only when the
  feedback loop lands an interactive panel. Don't front-load this — it's the incumbent's ergonomics
  turf and not where correctness is won.

---

## Summary table

| Seam | Need | Recommended lib | Build vs adopt |
|---|---|---|---|
| #3 Generation / #8 Feedback | Bounded agent tool loop + structured output | **Vercel AI SDK** (`ai`) around current Anthropic model | Adopt SDK, own the prompts/tools |
| #2 Context | Accurate prop/union/generic types | **react-docgen-typescript** | Adopt |
| #2 Context | Import graph + provider detection | TS compiler API (already present) | Build (owned by S1) |
| #3/#4 Data | Deterministic realistic prop data | **zod** + zod→faker (`zod-schema-faker`) | Adopt, wrap thinly |
| #5 Execution | Network isolation / force async states | **MSW** | Adopt |
| #6 Verification | Headless render + assert + screenshot | **Playwright** (+ optional `@axe-core/playwright`) | Adopt engine, own harness |
| #7 Presentation | Preview panel + controls | iframe now; later React + `@vscode/webview-ui-toolkit` | Build now, adopt later |

## The one-line build philosophy

**Own the seams where correctness lives (context walk, prompts, verification harness, artifact
contract). Adopt mature libraries for the plumbing (agent loop, type extraction, faker, browser
automation, network mocking).** This matches D8's file-ownership model and keeps the dependency
surface auditable.

## Sources

- Vercel AI SDK v5/v6 docs (`ToolLoopAgent`, `Output`, tool calling); AI SDK issue #7220 (Anthropic
  thinking + structured-output conflict); 2026 agent-SDK comparison (Anthropic Agent SDK vs AI SDK).
- `react-docgen-typescript` README + Storybook typescript config docs.
- `zod-schema-faker`, `zod-to-mock-data`, `mocky` (AI+faker split) npm/GitHub.
- MSW docs + Storybook-MSW integration guides.
- Storybook test-runner (Jest+Playwright) + Chromatic visual-test docs.
