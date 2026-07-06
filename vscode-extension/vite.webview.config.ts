import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Builds the React webview UI (webview-ui/) into a single IIFE bundle + CSS that the
// extension loads inside the VS Code webview via `asWebviewUri` (see src/webview.ts).
// Kept separate from the extension host's `tsc` build (browser target, JSX, React bundled).
export default defineConfig({
  plugins: [react()],
  // In library mode Vite does NOT replace `process.env.NODE_ENV`, but React's
  // production bundles reference it. Left unreplaced it throws "process is not
  // defined" in the webview (blank panel). Statically define it for the browser.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: resolve(__dirname, "out/webview"),
    emptyOutDir: true,
    // A webview has no module loader; emit a single self-contained IIFE + one CSS file
    // with stable, unhashed names so the host can reference them directly.
    lib: {
      entry: resolve(__dirname, "webview-ui/main.tsx"),
      formats: ["iife"],
      name: "PreviewWebview",
      fileName: () => "main.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "main.[ext]",
      },
    },
    sourcemap: false,
    // The webview runs in a modern Electron/Chromium; no legacy transpile needed.
    target: "es2022",
  },
});
