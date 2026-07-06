#!/usr/bin/env node

import { build } from "vite";
import { resolve, dirname } from "path";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { parseArgs } from "util";
import { fileURLToPath } from "url";

// Parse command line arguments
const { values } = parseArgs({
  options: {
    entry: { type: "string", short: "e" },
    out: { type: "string", short: "o" },
  },
});

const entryFile = values.entry || "src/App.tsx";
const outDir = values.out || ".component-preview/dist";

// Create output directory
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
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
// Same as dev-server-cli.js but for static builds (no live postMessage updates).
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
      })();
    </script>`;

// Generate the HTML template
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview - ${entryFile}</title>
    ${themeBridgeScript}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>`;

// Write temporary files for the build
const tempDir = ".vite-temp/build";
if (!existsSync(tempDir)) {
  mkdirSync(tempDir, { recursive: true });
}

writeFileSync(`${tempDir}/main.tsx`, mainContent);
writeFileSync(`${tempDir}/index.html`, htmlContent);

// Run Vite build
async function runBuild() {
  try {
    await build({
      root: tempDir,
      base: "./", // Use relative paths for assets
      build: {
        outDir: resolve(process.cwd(), outDir),
        emptyOutDir: true,
      },
      resolve: {
        alias: {
          "@": resolve(process.cwd(), "src"),
          "~": process.cwd(),
        },
      },
    });

    console.log(`✅ Built preview: ${entryFile}`);
    console.log(`📦 Output: ${outDir}`);

    // Clean up temp directory
    const { rmSync } = await import("fs");
    rmSync(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

runBuild();