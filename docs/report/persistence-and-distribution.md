# Persistence & Distribution: Getting Mocks Out of the Editor

_Created: 2026-07-06. Maps to seam #9 (Persistence/provenance) and the L3 "team" rung._

Today a preview is **ephemeral**: `generateMock` → `.component-preview/mock.tsx` (a single file,
overwritten every run — `preview.ts:97-104`) → dev server → iframe. The moment you preview a second
component, the first is gone. This section is about the three escalating ways to make mocks
**durable, shareable, and reviewable**, per the user's prompt ("artifacts? cloudflare?").

## Tier 0 — Persistable repo artifacts, **ephemeral by default / pin-to-commit**

> **Revised stance (see `product-vision.md`):** do *not* auto-commit every generated mock — that
> creates repo rot and PR review noise. Previews are **ephemeral by default**; a human **pins** the
> ones worth keeping, and only pinned Previews become committed `*.preview.tsx` + metadata.

**When pinned, move from one throwaway `mock.tsx` to a named `*.preview.tsx` + sidecar metadata**,
colocated with the component (the Storybook/react-cosmos file-convention model).

- **Shape:** `AlbumCard.preview.tsx` (default-export mock, the #4 artifact) + `AlbumCard.preview.json`
  (provenance: model, prompt hash, context files used, target state, timestamp, gate result).
- **Why it matters (validated by Chromatic's business):**
  - A teammate reopens the *exact* isolated state — no regeneration, no drift.
  - Mocks show up in PR diffs → reviewable UI states become part of code review.
  - Provenance makes results **reproducible & debuggable** ("which model/prompt/context made this?").
  - The golden set becomes a committed, CI-runnable regression eval (mini-Chromatic, inward-facing).
- **Cost:** near-zero — a naming + write-location change plus a metadata writer, gated behind an
  explicit "pin" action. This is the single most valuable persistence step and should precede any
  hosting work.
- **Optional convention:** a repo-level `preview.config.ts` declaring global wrappers (theme,
  router, `PlayerProvider`) so every component renders consistently — encodes team knowledge once
  (Storybook decorators / react-cosmos decorators pattern).

## Tier 1 — Shareable hosted preview (review outside the IDE)

Goal: a URL a designer/PM/reviewer opens in a browser — no VS Code, no `npm run dev`. This is
Chromatic's "hosted Storybook permalink" reduced to a single mock. Two viable hosts:

### Option A — Static build pushed to object storage + edge (simplest)

- Build the mock with Vite (`dev-server-cli.js` already knows how) → static bundle → upload to
  **Cloudflare R2** (or any static host) → serve via a **Worker** at a stable path
  `/(project)/(component)/(state)`.
- **Pros:** dead simple, cheap, cache-friendly, no live compute. **Cons:** static only — a mock that
  needs live API responses must bake MSW handlers into the bundle (fine, and deterministic).
- **Cloudflare mechanics:** store the built assets in R2 (recommended for larger/image assets), KV
  as a hot cache; a Worker maps request path → asset via an asset manifest
  (`@cloudflare/worker-bundler` `handleAssetRequest()`), long-cache content, short-cache manifest so
  new deploys appear fast.

### Option B — Dynamic Workers with a stable alias (Chromatic-like versioned previews)

- The `vite-dynamic-workers-preview` pattern: build → upload snapshot → a **Durable Object** holds
  the latest version and a **Worker Loader** serves it; the **public URL stays fixed** while the
  underlying version changes. Cloudflare also has first-class **Preview URLs** (versioned +
  human-readable aliases) for Workers — good for "share this branch's mock" links.
- **Pros:** stable link across regenerations, supports live edge API routes if a mock needs them.
  **Cons:** more infra; Preview URLs aren't generated for Workers that use Durable Objects (a real
  constraint to design around); Dynamic Workers static-asset serving is runtime-sourced from
  R2/KV, not deploy-time.

### Security note (important, from the `protocontent` design)

Agent-authored mock HTML/JS is **untrusted code**. Serve it from a **separate registrable domain**
from any control plane (e.g. content on `*.preview-sandbox.app`, API on `api.yourtool.com`) so a
malicious/hallucinated mock can't touch your session cookies or dashboard. This mirrors how VS Code
already sandboxes the webview; extend the same discipline to the hosted surface.

## Tier 2 — Visual baselines & the shared eval (the Chromatic endgame)

Once mocks are committed (Tier 0) and hostable (Tier 1), the verification seam (#6) can store
**screenshot baselines** per `(component, state)` alongside the metadata (or in R2). CI then runs
the Playwright gate against the golden set on every PR and posts diffs — a self-hosted, inward
Chromatic focused on *"did the mock generator get better or worse?"* (`../golden-set.md`). This is
the L3 team rung and the point at which the tool produces a durable, trusted team asset rather than
a disposable dev convenience.

## Recommended sequencing

1. **Tier 0 first** (pin → committed `*.preview.tsx` + provenance). Cheap, unlocks review +
   reproducibility, requires no external infra. Slots into the persistence gap in `../seams.md` §9.
2. **Playwright gate storing results** into the sidecar metadata (S2 already builds the gate).
3. **Tier 1 Option A** (R2 + Worker static host) when someone needs to share a preview outside the
   editor. Start static; add Dynamic Workers only if live edge behavior is required.
4. **Tier 2** visual baselines in CI once the golden set is stable — the team regression signal.

## Decision hooks for `../decisions.md`

- Recorded as **D12**: **"Previews are ephemeral by default; pinning promotes one to a committed
  named artifact with provenance."** (Keeps the `.component-preview/` temp file for one-off
  previews; only pinned Previews enter the repo/PR/CI path.)
- Recorded as **D14**: **"Hosted previews (if built) live on a domain isolated from any control
  plane."** (Security invariant for serving agent-authored code.)

## Sources

- Cloudflare: Dynamic Workers static assets (R2/KV + `handleAssetRequest`), Workers Preview URLs
  (versioned/aliased), `vite-dynamic-workers-preview` (Durable Object + Worker Loader stable URL).
- `protocontent` (R2 + D1 + Durable Object; content/control-plane domain isolation for agent
  artifacts).
- Chromatic hosted Storybook / permalinks / visual baselines; react-cosmos & Storybook file
  conventions for colocated fixtures.
