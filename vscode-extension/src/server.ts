// Dev-server management seam (see docs/seams.md #5, docs/decisions.md D5c).
//
// OWNERSHIP: fan-out workstream C. For now this preserves the starter behavior
// (single server, fixed port, 2s readiness wait). Workstream C will replace the
// fixed wait + hardcoded port with real readiness detection + multi-preview support.

import { ChildProcess, spawn } from "child_process";

let currentServer: ChildProcess | null = null;
const PREVIEW_PORT = 3000;

export async function startDevServer(
  mockPath: string,
  workspaceRoot: string,
): Promise<boolean> {
  stopServer();

  console.log(`[preview] Starting server: ${mockPath} on port ${PREVIEW_PORT}`);

  return new Promise((resolve, reject) => {
    currentServer = spawn(
      "node",
      [
        "dev-server-cli.js",
        "--entry",
        mockPath,
        "--port",
        String(PREVIEW_PORT),
      ],
      {
        cwd: workspaceRoot,
        stdio: "pipe",
      },
    );

    currentServer.on("error", (err) => {
      console.error("[preview] Failed to start server:", err);
      reject(err);
    });

    currentServer.on("exit", (code) => {
      console.log("[preview] Server exited with code:", code);
    });

    currentServer.stdout?.on("data", (data) => {
      console.log("[preview] stdout:", data.toString());
    });

    currentServer.stderr?.on("data", (data) => {
      console.error("[preview] stderr:", data.toString());
    });

    setTimeout(() => {
      console.log("[preview] Server ready");
      resolve(true);
    }, 2000);
  });
}

export function getPreviewUrl(): string {
  return `http://localhost:${PREVIEW_PORT}`;
}

export function stopServer() {
  if (currentServer) {
    console.log("[preview] Stopping server, pid:", currentServer.pid);
    currentServer.kill("SIGTERM");
    currentServer = null;
  }
}
