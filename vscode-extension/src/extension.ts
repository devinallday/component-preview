import * as vscode from "vscode";
import * as path from "path";
import { collectContext } from "./context";
import { generateMock, writeMockFile, pinPreview } from "./preview";
import { startDevServer, getPreviewUrl, stopServer } from "./server";
import { showPreview } from "./webview";
import { PreviewCodeLensProvider } from "./codelens";

const API_KEY_SECRET = "previewAgent.anthropicApiKey";

export function activate(context: vscode.ExtensionContext) {
  const setKeyCommand = vscode.commands.registerCommand(
    "component-preview.setApiKey",
    async () => {
      const key = await vscode.window.showInputBox({
        prompt: "Enter your Anthropic API key",
        password: true,
        placeHolder: "sk-ant-...",
      });
      if (key) {
        await context.secrets.store(API_KEY_SECRET, key);
        vscode.window.showInformationMessage("Anthropic API key saved");
      }
    },
  );
  context.subscriptions.push(setKeyCommand);

  const codeLensProvider = new PreviewCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      [{ language: "typescriptreact" }, { language: "javascriptreact" }],
      codeLensProvider,
    ),
  );

  const disposable = vscode.commands.registerCommand(
    "component-preview.preview",
    async (filePath: string, componentName: string) => {
      if (!filePath || !componentName) {
        vscode.window.showErrorMessage("No component specified");
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Preview: ${componentName}`,
            cancellable: false,
          },
          async (progress) => {
            progress.report({ message: "Collecting context..." });
            const componentContext = await collectContext(
              filePath,
              componentName,
            );

            const workspaceRoot =
              vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
              throw new Error("No workspace folder open");
            }

            progress.report({ message: "Generating mock..." });
            const apiKey = await context.secrets.get(API_KEY_SECRET);
            if (!apiKey) {
              throw new Error(
                "API key not set. Run 'Preview: Set API Key' command.",
              );
            }

            const mockCode = await generateMock(componentContext, apiKey);
            if (!mockCode) {
              throw new Error("Failed to generate mock");
            }

            progress.report({ message: "Writing mock file..." });
            const mockPath = await writeMockFile(mockCode, workspaceRoot);

            progress.report({ message: "Starting dev server..." });
            await startDevServer(mockPath, workspaceRoot);

            showPreview(
              getPreviewUrl(),
              componentContext.componentName,
              componentContext.filePath,
              context.extensionUri,
              componentContext,
            );
          },
        );
      } catch (err) {
        vscode.window.showErrorMessage(
          `Preview failed: ${err instanceof Error ? err.message : err}`,
        );
      }
    },
  );

  context.subscriptions.push(disposable);

  const pinCommand = vscode.commands.registerCommand(
    "component-preview.pin",
    async (filePath: string, componentName: string) => {
      if (!filePath || !componentName) {
        vscode.window.showErrorMessage("No component specified");
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Pinning: ${componentName}`,
            cancellable: false,
          },
          async (progress) => {
            progress.report({ message: "Collecting context..." });
            const componentContext = await collectContext(
              filePath,
              componentName,
            );

            const workspaceRoot =
              vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
              throw new Error("No workspace folder open");
            }

            progress.report({ message: "Generating mock..." });
            const apiKey = await context.secrets.get(API_KEY_SECRET);
            if (!apiKey) {
              throw new Error(
                "API key not set. Run 'Preview: Set API Key' command.",
              );
            }

            const mockCode = await generateMock(componentContext, apiKey);
            if (!mockCode) {
              throw new Error("Failed to generate mock");
            }

            progress.report({ message: "Pinning preview..." });
            const { previewPath, metadataPath } = await pinPreview(
              mockCode,
              componentContext,
              workspaceRoot,
            );

            vscode.window.showInformationMessage(
              `Pinned preview: ${path.basename(previewPath)}`,
            );
          },
        );
      } catch (err) {
        vscode.window.showErrorMessage(
          `Pin failed: ${err instanceof Error ? err.message : err}`,
        );
      }
    },
  );
  context.subscriptions.push(pinCommand);
}

export function deactivate() {
  stopServer();
}
