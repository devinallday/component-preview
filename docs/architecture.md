# Architecture — Current State

_Last updated: 2026-07-06 (post Phase-0 spine: S0/S1/S2 landed)._

## Overview

Two packages in this repo:

- **`vscode-extension/`** — the tool itself (TypeScript VS Code extension).
- **`vite-app/`** — a sample "vibe-coded Spotify clone" used as the target project to preview against.

## Module map (post D8 split)

- **`codelens.ts`** — discovery (seam #1). AST walk for JSX-returning decls → "Preview Component" lens.
- **`context.ts`** — context collection (seam #2, S1). Transitive relative-import walk + provider detection.
- **`preview.ts`** — generation (seam #3). Prompt build + Claude call + `writeMockFile`.
- **`server.ts`** — execution (seam #5). `startDevServer` / `getPreviewUrl` / `stopServer`.
- **`verify.ts`** — verification (seam #6, S2). Headless Playwright render gate.
- **`webview.ts`** — presentation (seam #7). Iframe panel.
- **`types.ts`** — the stable interfaces seam (D8); owned by the spine only.

## Flow (happy path)

1. **`codelens.ts`** — parses the open `.tsx/.jsx` with the TS compiler API, finds top-level
   components (unwrapping one HOC layer), adds a **"Preview Component"** CodeLens above each.
2. **`extension.ts`** — the `component-preview.preview` command orchestrates:
   `collectContext` → `generateMock` → `writeMockFile` → `startDevServer` → `showPreview`.
   API key stored via `context.secrets` (`previewAgent.anthropicApiKey`).
3. **`context.ts`** — `collectContext` walks the component's **transitive relative import graph**
   (TS compiler API, `MAX_DEPTH=4`/`MAX_FILES=25`) to gather types/hooks/context modules, and
   **detects required providers** from the "must be used within a `<Provider>`" guard. When the
   provider file isn't import-reachable (the `Player`→`PlayerProvider` case), it lazily scans the
   nearest `src` tree (skip-listed, capped) to locate + fold it in.
4. **`preview.ts`** — `generateMock` does a **single-shot** Claude call (`claude-sonnet-4-5`),
   injecting the collected dependency files + provider-wrapping instructions, and returns a mock
   `.tsx` that imports the component by absolute path. `writeMockFile` writes
   `<workspace>/.component-preview/mock.tsx`; `startDevServer` spawns
   `node dev-server-cli.js --entry <mock> --port 3000`.
5. **`verify.ts`** — `verifyRender(url, {assertions?})` (Playwright, headless) reports whether the
   mock mounted content in `#root` with no console/`pageerror`/error-overlay, and optionally scores
   golden-set assertions. **Built and smoke-tested, but not yet wired into the command flow.**
6. **`webview.ts`** — `showPreview` opens a webview panel with an `<iframe>` to the preview URL.

## Target app (`vite-app`)

- Components span a difficulty spectrum:
  - `AlbumCard` — pure props (`album`, callbacks). Easy.
  - `Tooltip` — internal state, only visible on hover/focus. Needs interaction mocking.
  - `Dropdown` — internal open/close state.
  - `Player` — depends on `usePlayerContext()` → `PlayerContext` → **`PlayerProvider`**. Throws if not wrapped in a provider. Hardest.
- Shared `types/`, `contexts/`, `hooks/`, `data/`.

## Dev server contract

- `dev-server-cli.js --entry path/to/mock.tsx --port <port>` renders the **default export** of the entry file.
- Aliases `@` → `src`, `~` → project root. Auto-imports first CSS file it finds.
- HMR on `port + 1`.

## Resolved by the spine (S0–S2)

- ✅ **Context collection depth** (S1) — transitive relative-import walk + provider detection;
  `Player` now resolves `PlayerProvider`.
- ✅ **Module ownership** (S0/D8) — monolith split into `context/preview/server/verify` + stable
  `types.ts`.
- ✅ **Verification signal** (S2) — Playwright render gate exists (`verify.ts`), scoreable vs golden set.

## Known gaps / weak points (remaining)

- **Verify not wired in.** `verifyRender` is built but the `preview` command doesn't call it yet;
  no self-correcting retry loop (the core L1 must-do — see `report/product-vision.md`).
- **No iteration/feedback loop.** One-shot generation; no NL "make the tooltip always open" refine (D5a).
- **No caching.** Every preview re-calls the LLM (D5d).
- **Single server / hardcoded port 3000.** One preview at a time; `stopServer` kills the previous (D5c).
- **Fragile readiness check.** `startDevServer` resolves on a fixed 2s `setTimeout`, not server-ready (D5c).
- **Bare iframe.** No controls (viewport, theme, re-mock, error surfacing), no variant gallery (D5b).
- **Error handling.** LLM output is trusted; runtime errors surface only in the iframe until verify is wired in.
- **No persistence.** Single overwritten `mock.tsx`; no pin-to-commit named Previews (D12).
