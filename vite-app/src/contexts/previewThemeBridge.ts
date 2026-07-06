/**
 * Preview theme bridge (app-state side).
 *
 * The Component Preview webview drives the previewed component's theme two ways
 * (see vscode-extension/webview-ui/components/Stage.tsx + the dev server's
 * document-level bridge in vite-app/dev-server-cli.js):
 *   1. an initial `?previewTheme=light|dark` query param on (re)load, and
 *   2. a live `{ source: "component-preview", type: "set-theme", theme }`
 *      postMessage on toggle.
 *
 * These helpers let React state (e.g. ThemeProvider, which NowPlayingBar reads
 * via useThemeContext) honor that signal. They are intentionally additive and
 * inert during normal app usage: the query getter returns null when the param
 * is absent, and the subscription only fires for the specific preview message.
 */

export type PreviewTheme = "light" | "dark";

const PREVIEW_SOURCE = "component-preview";
const SET_THEME_TYPE = "set-theme";

function isPreviewTheme(value: unknown): value is PreviewTheme {
  return value === "light" || value === "dark";
}

/** Read the seeded theme from `?previewTheme=` (null when absent/invalid). */
export function getPreviewThemeFromQuery(): PreviewTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const value = new URLSearchParams(window.location.search).get(
      "previewTheme",
    );
    return isPreviewTheme(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to live `set-theme` messages from the preview webview.
 * Returns an unsubscribe function. No-op (and inert) outside the preview.
 */
export function subscribeToPreviewTheme(
  onTheme: (theme: PreviewTheme) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: MessageEvent) => {
    const data = event.data;
    if (
      data &&
      data.source === PREVIEW_SOURCE &&
      data.type === SET_THEME_TYPE &&
      isPreviewTheme(data.theme)
    ) {
      onTheme(data.theme);
    }
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}
