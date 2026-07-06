// Shared contract between the extension host (webview.ts) and the React webview UI
// (webview-ui/). This module MUST stay free of `vscode` and Node imports so it can be
// bundled into the browser webview build unchanged — it is the single source of truth
// for the message + persisted-state shapes.
//
// OWNERSHIP: fan-out workstream B (Webview / UX).

/** Light/dark signal applied to the previewed app via the dev-server theme bridge (D18). */
export type PreviewTheme = "light" | "dark";

/** Backdrop shown behind the frame on the stage. */
export type BackdropId = "editor" | "checker" | "white" | "black";

/** Zoom level: "fit" auto-scales the frame to the stage; others are fixed ratios. */
export type ZoomId = "fit" | "0.5" | "0.75" | "1" | "1.25" | "1.5";

/** A named viewport size. `width`/`height` null means "responsive" (fill the stage). */
export interface ViewportPreset {
  id: string;
  label: string;
  width: number | null;
  height: number | null;
}

/** Data the extension injects into the webview HTML at render time. */
export interface PreviewInit {
  /** The local dev-server URL serving the mock. */
  url: string;
  /** The component being previewed (for labels). */
  componentName: string;
}

/** Toolbar state persisted across reloads via vscode.getState/setState. */
export interface PreviewUiState {
  viewportId: string;
  customWidth: number;
  customHeight: number;
  zoom: ZoomId;
  theme: PreviewTheme;
  backdrop: BackdropId;
  /** When true, width/height are swapped (rotate). */
  orientation: boolean;
}

/** Messages the webview sends up to the extension host. */
export type WebviewToExtension =
  | { type: "remock" }
  | { type: "openExternal" }
  | { type: "pin" };

/** Messages the extension host sends down to the webview (reserved for status/errors). */
export type ExtensionToWebview = {
  type: "status";
  state: "generating" | "ready" | "error";
  message?: string;
};

/**
 * The message the webview posts into the preview <iframe> to drive theming.
 * Must match what the dev-server theme bridge listens for (see
 * vite-app/dev-server-cli.js, decision D18).
 */
export interface SetThemeMessage {
  source: "component-preview";
  type: "set-theme";
  theme: PreviewTheme;
}

/** The global the extension HTML shell exposes to the bundled webview app. */
export const PREVIEW_INIT_GLOBAL = "__PREVIEW_INIT__";
