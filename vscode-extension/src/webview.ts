import * as vscode from "vscode";
import { stopServer } from "./server";

let currentPanel: vscode.WebviewPanel | null = null;

export function showPreview(url: string, componentName: string) {
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
      },
    );

    currentPanel.onDidDispose(() => {
      stopServer();
      currentPanel = null;
    });
  }

  currentPanel.title = `Preview: ${componentName}`;
  currentPanel.webview.html = getWebviewContent(url);
}

function getWebviewContent(url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body>
    <iframe src="${url}"></iframe>
</body>
</html>`;
}
