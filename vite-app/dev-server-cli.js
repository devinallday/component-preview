#!/usr/bin/env node

import { createServer } from "vite";
import { resolve, dirname } from "path";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { parseArgs } from "util";
import { fileURLToPath } from "url";

// Parse command line arguments
const { values } = parseArgs({
  options: {
    entry: { type: "string", short: "e" },
    port: { type: "string", short: "p" },
  },
});

const entryFile = values.entry || "src/App.tsx";
const port = parseInt(values.port) || 3000;

// Create temporary files for the dev server
const tempDir = `.vite-temp/port-${port}`;
if (!existsSync(tempDir)) {
  mkdirSync(tempDir, { recursive: true });
}

// Get absolute path to the entry file
const absoluteEntryPath = resolve(process.cwd(), entryFile);

// Find the root CSS file (check common locations)
const possibleCssPaths = [
  resolve(process.cwd(), "src/index.css"),
  resolve(process.cwd(), "index.css"),
  resolve(process.cwd(), "src/main.css"),
  resolve(process.cwd(), "src/App.css"),
];

let rootCssPath = null;
for (const cssPath of possibleCssPaths) {
  if (existsSync(cssPath)) {
    rootCssPath = cssPath;
    break;
  }
}

// Generate the main entry file that imports from absolute path
const mainContent = `import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '${absoluteEntryPath}'
${rootCssPath ? `import '${rootCssPath}'` : "// No CSS file found"}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`;

// Document-level theme bridge (ADDITIVE — see docs/decisions.md).
// Runs inline in <head> before first paint so the previewed page's document
// (background, colorScheme, any Tailwind `dark:`/[data-theme] styling) reflects
// the Component Preview webview's theme signal:
//   1. seeded from the `?previewTheme=light|dark` query param on load, and
//   2. updated live via the `{source:"component-preview",type:"set-theme"}`
//      postMessage the webview posts into this iframe.
// Fully inert when neither the param nor the message is present, so normal
// standalone usage of the dev server is unaffected. Note this is the
// document-level layer; components reading React theme state (e.g. via
// useThemeContext) are handled additionally by the app-side bridge in
// src/contexts/previewThemeBridge.ts + ThemeProvider.
const themeBridgeScript = `<script>
      (function () {
        function applyTheme(theme) {
          if (theme !== "light" && theme !== "dark") return;
          var el = document.documentElement;
          el.setAttribute("data-theme", theme);
          el.classList.remove("light", "dark");
          el.classList.add(theme);
          el.style.colorScheme = theme;
        }
        try {
          var seeded = new URLSearchParams(window.location.search).get("previewTheme");
          if (seeded) applyTheme(seeded);
        } catch (e) {}
        window.addEventListener("message", function (event) {
          var data = event.data;
          if (data && data.source === "component-preview" && data.type === "set-theme") {
            applyTheme(data.theme);
          }
        });
      })();
    </script>`;

// Generate the HTML template
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dev Server - ${entryFile}</title>
    <style>
      html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
      }
    </style>
    ${themeBridgeScript}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>`;

// Write temporary files
writeFileSync(`${tempDir}/main.tsx`, mainContent);
writeFileSync(`${tempDir}/index.html`, htmlContent);

// Create and start the Vite dev server
async function startServer() {
  try {
    const server = await createServer({
      root: tempDir,
      server: {
        port: port,
        open: false,
        hmr: {
          port: port + 1,
        },
      },
      resolve: {
        alias: {
          // Allow imports from the original project structure
          "@": resolve(process.cwd(), "src"),
          "~": process.cwd(),
        },
      },
    });

    await server.listen();

    console.log(`🚀 Dev server running at http://localhost:${port}`);
    console.log(`🔥 HMR running on port ${port + 1}`);
    console.log(`📦 Entry point: ${entryFile}`);

    // Clean up function
    const cleanup = () => {
      console.log("\n👋 Shutting down dev server...");
      server.close();

      // Clean up the port-specific temp directory
      import("fs").then(({ rmSync }) => {
        try {
          rmSync(tempDir, { recursive: true, force: true });
          console.log(`🗑️  Cleaned up ${tempDir}`);
        } catch (err) {
          console.warn(`⚠️  Could not clean up temp directory: ${err.message}`);
        }
      });

      process.exit(0);
    };

    // Clean up temp files on various exit scenarios
    process.on("SIGINT", cleanup); // Ctrl+C
    process.on("SIGTERM", cleanup); // Kill command
    process.on("exit", cleanup); // Normal exit
  } catch (error) {
    console.error("❌ Failed to start dev server:", error);
    process.exit(1);
  }
}

startServer();
