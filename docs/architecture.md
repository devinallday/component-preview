# Architecture — Current State

_Last updated: 2026-07-06_

## Overview

Two packages in this repo:

- **`vscode-extension/`** — the tool itself (TypeScript VS Code extension).
- **`vite-app/`** — a sample "vibe-coded Spotify clone" used as the target project to preview against.

## Starter flow (happy path)

1. **`codelens.ts`** — `PreviewCodeLensProvider` parses the open `.tsx/.jsx` file with the
   TypeScript compiler API, finds top-level components (function decls / variable decls that
   contain JSX, unwrapping one layer of HOC), and adds a **"Preview Component"** CodeLens above each.
2. **`extension.ts`** — the `component-preview.preview` command orchestrates:
   `collectContext` → `generateMock` → `writeMockFile` → `startDevServer` → `showPreview`.
   API key is stored via `context.secrets` (`previewAgent.anthropicApiKey`).
3. **`context.ts`** — `collectContext` currently reads **only the component's own source file**.
4. **`preview.ts`** — `generateMock` does a **single-shot** Claude call (`claude-sonnet-4-5`)
   asking for a mock `.tsx` that imports the component by absolute path and renders it with
   realistic props. Writes to `<workspace>/.component-preview/mock.tsx`. `startDevServer`
   spawns `node dev-server-cli.js --entry <mock> --port 3000`.
5. **`webview.ts`** — `showPreview` opens a webview panel with an `<iframe src="http://localhost:3000">`.

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

## Known gaps / weak points

- **Context collection is shallow.** Only the component's own file is sent. No dependency
  graph, no types, no context providers, no example usage. Non-trivial components (e.g. `Player`) will fail.
- **No iteration/feedback loop.** One-shot generation; user can't say "make the tooltip always open" and refine.
- **No caching.** Every preview re-calls the LLM.
- **Single server / hardcoded port 3000.** Only one preview at a time; `stopServer` kills the previous.
- **Fragile readiness check.** `startDevServer` resolves on a fixed 2s `setTimeout`, not on actual server-ready.
- **Bare iframe.** No controls (viewport size, theme, re-mock, error surfacing).
- **Error handling.** LLM output is trusted; runtime errors in the mock surface only in the iframe.
