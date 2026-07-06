// Presentation seam (see docs/seams.md #7, docs/decisions.md D5b/D18/D19).
//
// OWNERSHIP: fan-out workstream B (Webview / UX). This is now a THIN host shell: it
// creates the panel, builds the HTML that boots the bundled React webview UI
// (webview-ui/, built by Vite into out/webview/), and bridges typed messages between
// the UI and the extension. All UI/behavior lives in the React app; the message +
// state contract is src/webviewProtocol.ts (shared, browser-safe).

import * as vscode from "vscode";
import { stopServer } from "./server";
import { pinPreview } from "./preview";
import {
  PREVIEW_INIT_GLOBAL,
  PreviewInit,
  WebviewToExtension,
} from "./webviewProtocol";

let currentPanel: vscode.WebviewPanel | null = null;

// Current preview target — kept in module scope so the panel's message handler
// (registered once) can act on the latest previewed component.
let currentUrl = "";
let currentComponentName = "";
let currentFilePath = "";
let currentComponentContext: any = null;

export function showPreview(
  url: string,
  componentName: string,
  filePath: string,
  extensionUri: vscode.Uri,
  componentContext: any = null,
) {
  currentUrl = url;
  currentComponentName = componentName;
  currentFilePath = filePath;
  currentComponentContext = componentContext;

  const webviewRoot = vscode.Uri.joinPath(extensionUri, "out", "webview");

  if (currentPanel) {
    currentPanel.reveal();
  } else {
    currentPanel = vscode.window.createWebviewPanel(
      "prevAgent",
      `Preview: ${componentName}`,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [webviewRoot],
      },
    );

    currentPanel.onDidDispose(() => {
      stopServer();
      currentPanel = null;
    });

    currentPanel.webview.onDidReceiveMessage((msg: WebviewToExtension) => {
      switch (msg?.type) {
        case "remock":
          vscode.commands.executeCommand(
            "component-preview.preview",
            currentFilePath,
            currentComponentName,
          );
          break;
        case "openExternal":
          if (currentUrl) {
            vscode.env.openExternal(vscode.Uri.parse(currentUrl));
          }
          break;
        case "pin":
          vscode.commands.executeCommand(
            "component-preview.pin",
            currentFilePath,
            currentComponentName,
          );
          break;
      }
    });
  }

  currentPanel.title = `Preview: ${componentName}`;
  currentPanel.webview.html = getWebviewContent(
    currentPanel.webview,
    webviewRoot,
    { url, componentName },
  );
}

function getNonce(): string {
  let text = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

function getWebviewContent(
  webview: vscode.Webview,
  webviewRoot: vscode.Uri,
  init: PreviewInit,
): string {
  const nonce = getNonce();
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(webviewRoot, "main.js"),
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(webviewRoot, "main.css"),
  );

  // The preview is served from a local dev server (http://localhost:<port>).
  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} data: https:`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src 'nonce-${nonce}' ${webview.cspSource}`,
    `font-src ${webview.cspSource}`,
    "frame-src http://localhost:* http://127.0.0.1:*",
  ].join("; ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${styleUri}">
    <title>Preview: ${init.componentName}</title>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}">
      window.${PREVIEW_INIT_GLOBAL} = ${JSON.stringify(init)};
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
