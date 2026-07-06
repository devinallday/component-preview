// Mock generation seam (see docs/seams.md #3).
// OWNERSHIP: spine + fan-out workstreams A (feedback loop) and D (caching).
// Server management now lives in ./server.ts (D8 module split).

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { ComponentContext, PreviewMetadata } from "./types";
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
- ALWAYS import ThemeProvider as a NAMED import from the absolute path "/Users/devin2/Desktop/preview-agent-interview-bundle/vite-app/src/contexts/ThemeProvider.tsx" - this is required for the preview's light/dark theme toggle to work. Wrap the entire mock in <ThemeProvider>.
- Create realistic mock props for the component, using the real types shown above
- Export a SINGLE default function component. The dev server only renders the default export,
  so everything you want to see must be composed inside that one component.
- If the component needs state or interactions to show interesting UI (like tooltips), mock it to be visible
- If required context providers are listed above, wrap the component in them INSIDE ThemeProvider and supply any props they need
- Make the mock content large enough to require scrolling (render enough variants to overflow the viewport), but focus on RELEVANT, MEANINGFUL coverage - not just volume.
- DO NOT use hardcoded background colors (like backgroundColor: '#121212') - use CSS variables or let the theme control the background, otherwise the theme toggle won't update the background
- Only output the code, no explanation

Render multiple variants, not just one:
- Inspect the component's props and identify every axis with a small, enumerable set of values:
  - String-literal union / enum props (e.g. \`position: "top" | "bottom" | "left" | "right"\`) — render ONE variant per member so ALL values are visible at once.
  - Boolean props — render both \`true\` and \`false\` (or a representative subset if there are many).
  - Discrete internal states the component can be driven into via props (e.g. an injected
    fetcher that resolves / rejects / never-resolves to force loading / success / error).
- Lay the variants out as a labeled gallery: a vertical or grid layout where each cell renders
  the component with one variant's props and a short text label (the prop name + value) above it,
  so a reviewer can compare all states side by side.
- Keep shared/complex props (typed domain objects, callbacks) constant across variants; only vary
  the enumerable axis being demonstrated. If there are multiple enum axes, prefer the most
  visually meaningful one rather than a full cross-product.
- If the component has NO enumerable axes (only free-form data props), render a single sensible instance.

Example structure (a labeled variant gallery for an enum prop):
\`\`\`tsx
import React from 'react'
import ComponentName from '${context.filePath}'

const POSITIONS = ['top', 'bottom', 'left', 'right'] as const

export default function Mock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, padding: 24 }}>
      {POSITIONS.map((position) => (
        <div key={position}>
          <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.7 }}>position="{position}"</div>
          <ComponentName position={position} /* ...shared props... */ />
        </div>
      ))}
    </div>
  )
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

/**
 * Pin a preview as a durable artifact (D12/Tier 0).
 * Writes `ComponentName.preview.tsx` + `ComponentName.preview.json` next to the component.
 */
export async function pinPreview(
  mockCode: string,
  componentContext: ComponentContext,
  workspaceRoot: string,
): Promise<{ previewPath: string; metadataPath: string }> {
  const componentDir = path.dirname(componentContext.filePath);
  const componentName = componentContext.componentName;
  const previewPath = path.join(componentDir, `${componentName}.preview.tsx`);
  const metadataPath = path.join(componentDir, `${componentName}.preview.json`);

  // Write the preview file
  fs.writeFileSync(previewPath, mockCode);

  // Write provenance metadata
  const promptHash = crypto
    .createHash("sha256")
    .update(
      mockCode +
        JSON.stringify(
          componentContext.dependencies?.map((d) => d.filePath) || [],
        ),
    )
    .digest("hex");

  const metadata: PreviewMetadata = {
    componentName,
    componentPath: componentContext.filePath,
    pinnedAt: new Date().toISOString(),
    model: "claude-sonnet-4-5-20250929",
    promptHash,
    contextFiles: componentContext.dependencies?.map((d) => d.filePath) || [],
    requiredProviders:
      componentContext.requiredProviders?.map((p) => p.providerName) || [],
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  return { previewPath, metadataPath };
}
