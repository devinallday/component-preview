// Thin typed wrapper around the VS Code webview bridge. `acquireVsCodeApi` is a
// global injected by VS Code exactly once per webview, so we grab it here and share it.

import type {
  PreviewInit,
  PreviewUiState,
  WebviewToExtension,
} from "../src/webviewProtocol";
import { PREVIEW_INIT_GLOBAL } from "../src/webviewProtocol";

interface VsCodeApi<S> {
  postMessage: (message: unknown) => void;
  getState: () => S | undefined;
  setState: (state: S) => void;
}

declare global {
  interface Window {
    acquireVsCodeApi?: <S>() => VsCodeApi<S>;
    [PREVIEW_INIT_GLOBAL]?: PreviewInit;
  }
}

const api = window.acquireVsCodeApi
  ? window.acquireVsCodeApi<PreviewUiState>()
  : // Fallback for running the bundle outside VS Code (e.g. plain browser dev).
    {
      postMessage: () => undefined,
      getState: () => undefined,
      setState: () => undefined,
    };

/** The init payload the extension embedded in the HTML shell. */
export function getInit(): PreviewInit {
  return (
    window[PREVIEW_INIT_GLOBAL] ?? { url: "", componentName: "Component" }
  );
}

export function postToExtension(message: WebviewToExtension): void {
  api.postMessage(message);
}

export function loadState(): PreviewUiState | undefined {
  return api.getState();
}

export function saveState(state: PreviewUiState): void {
  api.setState(state);
}
