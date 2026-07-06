// Mock generation seam (see docs/seams.md #3).
// OWNERSHIP: spine + fan-out workstreams A (feedback loop) and D (caching).
// Server management now lives in ./server.ts (D8 module split).

import * as fs from "fs";
import * as path from "path";
import { ComponentContext } from "./types";
import Anthropic from "@anthropic-ai/sdk";

/** Render the collected transitive dependencies as labelled code blocks. */
function formatDependencies(context: ComponentContext): string {
  const deps = context.dependencies ?? [];
  if (deps.length === 0) {
    return "";
  }
  const blocks = deps
    .map(
      (dep) => `// FILE: ${dep.filePath}
\`\`\`tsx
${dep.content}
\`\`\``,
    )
    .join("\n\n");
  return `\nThese are the local modules the component imports (types, hooks, contexts). Use them to build correct, well-typed props and to satisfy any required context:\n\n${blocks}\n`;
}

/** Instructions for wrapping the component in any required context providers. */
function formatProviders(context: ComponentContext): string {
  const providers = context.requiredProviders ?? [];
  if (providers.length === 0) {
    return "";
  }
  const list = providers
    .map((p) => `- "${p.providerName}" from the absolute path "${p.filePath}"`)
    .join("\n");
  return `\nIMPORTANT — this component (or its hooks) requires the following React context provider(s) to render without throwing. You MUST import and wrap the rendered component in them, importing each from its ABSOLUTE path:\n${list}\n`;
}

export async function generateMock(
  context: ComponentContext,
  apiKey: string,
): Promise<string | null> {
  const client = new Anthropic({ apiKey });

  const prompt = `Generate a React mock file that imports and renders the component "${context.componentName}" from the absolute path "${context.filePath}".

Here is the component source:
\`\`\`tsx
${context.fileContent}
\`\`\`
${formatDependencies(context)}${formatProviders(context)}
Requirements:
- Import the component using the ABSOLUTE path: "${context.filePath}"
- Create realistic mock props for the component, using the real types shown above
- Export a default function component that renders "${context.componentName}" with mock props
- If the component needs state or interactions to show interesting UI (like tooltips), mock it to be visible
- If required context providers are listed above, wrap the component in them and supply any props they need
- Only output the code, no explanation

Example structure:
\`\`\`tsx
import React from 'react'
import ComponentName from '${context.filePath}'

export default function Mock() {
  return <ComponentName prop1="value" prop2={123} />
}
\`\`\`

Output just the TSX code.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find(
      (block: { type: string }) => block.type === "text",
    );
    if (!textBlock || textBlock.type !== "text") {
      return null;
    }

    // Extract code from markdown code block if present
    let code = textBlock.text;
    const codeMatch = code.match(/```(?:tsx?|jsx?)?\n([\s\S]*?)```/);
    if (codeMatch) {
      code = codeMatch[1];
    }

    return code;
  } catch (error) {
    throw new Error(`Claude API error: ${error}`);
  }
}

export async function writeMockFile(
  mockCode: string,
  workspaceRoot: string,
): Promise<string> {
  const tempDir = path.join(workspaceRoot, ".component-preview");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const mockPath = path.join(tempDir, "mock.tsx");
  fs.writeFileSync(mockPath, mockCode);
  return mockPath;
}
