# Work Summary

## Theme System

### Theme Provider Bridge
- **Problem**: Light/dark toggle in webview wasn't driving the previewed component
- **Solution**: Document-level theme bridge in `dev-server-cli.js`
  - Seeded from `?previewTheme=light|dark` query param
  - Updated live via postMessage from webview
  - Sets `data-theme`, `class`, and `colorScheme` on `<html>`
- **Files**: `vite-app/dev-server-cli.js`
- **Status**: Shipped

### AlbumCard Theme Support
- **Problem**: `AlbumCard` had hardcoded Tailwind classes, didn't use theme system
- **Solution**: Added `theme?: "light" | "dark"` prop with `THEME_STYLES` map
- **Files**: `vite-app/src/components/Album/AlbumCard.tsx`, `AlbumCard.preview.tsx`
- **Status**: Shipped (on `feat/static-toolbar` branch)

## Scrolling

### Preview Stage Scrolling
- **Problem**: Content overflow didn't scroll in preview stage
- **Root cause**: `justify-content: center` in `.stage` CSS prevented overflow scrolling
- **Solution**: Removed flex constraints from `.stage`, made it a block container with `overflow: auto`
- **Files**: `vscode-extension/webview-ui/styles.css`
- **Status**: Shipped

### Root Overflow Scroll
- **Problem**: `#root` in preview iframe didn't have overflow scroll
- **Solution**: Added inline CSS in `dev-server-cli.js` HTML template:
  ```css
  html, body, #root {
    margin: 0; padding: 0;
    width: 100%; height: 100%;
    overflow: auto;
  }
  ```
- **Files**: `vite-app/dev-server-cli.js`
- **Status**: Shipped

## Webview UI

### Toolbar & Controls
- **Features**: Viewport controls (responsive/fixed), zoom-to-fit, backdrop options, theme toggle
- **Files**: `vite-app/src/preview/PreviewToolbar.tsx`
- **Status**: Shipped (on `feat/static-toolbar` branch)

## Documentation

### Vision Document
- **Created**: `docs/vision.html` — single-file HTML artifact with Mermaid diagrams
- **Sections**:
  1. The idea (validate in IDE)
  2. Core improvements (theme bridge, viewport/scroll controls, root overflow)
  3. Making work accessible (Cloudflare, diffs, PR sharing — all planned)
- **Style**: Dark Spotify-style theme, concise bullet points, compact Mermaid diagrams
- **Files**: `docs/vision.html`
- **Status**: Shipped

## Key Decisions

- **Theme bridge**: Document-level for maximum compatibility
- **Scrolling**: Block container with overflow: auto for both stage and root
- **Distribution**: Cloudflare R2 + Workers for isolated, shareable previews (planned)

## Next Steps (Not Yet Shipped)

1. **Content-hashed cache**: Cache keyed on component + dependencies for fast reload
2. **Self-correcting generation loop**: Verify renders in headless browser, repair on failure
3. **Error feedback**: Clear error banner + toast on mock generation failure
4. **Smarter variant galleries**: Enumerate meaningful prop axes (enums, booleans, states)
5. **Cloudflare hosting**: Publish previews to R2 + Workers for team access
6. **Diff-based generation**: Drive model with diffs instead of whole-file rewrites
7. **PR integration**: Comment hosted preview links on pull requests
