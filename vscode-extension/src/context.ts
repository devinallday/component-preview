// Context-collection seam (see docs/seams.md #2, docs/decisions.md D6).
// OWNERSHIP: spine workstream S1.
//
// Walks the target component's *relative* import graph transitively (depth/count
// capped) to gather the types, hooks, and other local modules the generator needs.
// Also detects React context providers the component requires to render, by finding
// the conventional "must be used within a <Provider>" guard thrown by context hooks
// and locating the module that exports that provider (e.g. Player -> PlayerProvider).

import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import {
  ComponentContext,
  CollectedFile,
  RequiredProvider,
} from "./types";

/** Caps to bound token cost and avoid runaway walks (D6). */
const MAX_DEPTH = 4;
const MAX_FILES = 25;

const RESOLVE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

/**
 * Resolve a relative import specifier from an importer file to an absolute path
 * on disk, trying common TS/JS extensions and index files. Returns null if no
 * file is found (e.g. it's a type-only path that doesn't exist, or external).
 */
function resolveRelativeImport(
  importerFile: string,
  specifier: string,
): string | null {
  const base = path.resolve(path.dirname(importerFile), specifier);

  // Direct file with an explicit or inferred extension.
  if (fs.existsSync(base) && fs.statSync(base).isFile()) {
    return base;
  }
  for (const ext of RESOLVE_EXTENSIONS) {
    if (fs.existsSync(base + ext)) {
      return base + ext;
    }
  }
  // Directory with an index file.
  for (const ext of RESOLVE_EXTENSIONS) {
    const indexPath = path.join(base, "index" + ext);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }
  return null;
}

/** Extract the relative import specifiers declared in a source file. */
function getRelativeImports(fileContent: string, fileName: string): string[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") || fileName.endsWith(".jsx")
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS,
  );

  const specifiers: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const spec = node.moduleSpecifier.text;
      if (spec.startsWith(".")) {
        specifiers.push(spec);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return specifiers;
}

/**
 * Transitively collect local dependency files reachable from the entry file via
 * relative imports. The entry file itself is excluded from the returned list.
 */
function collectDependencies(entryFile: string): CollectedFile[] {
  const collected = new Map<string, CollectedFile>();
  const visited = new Set<string>([entryFile]);
  const queue: { file: string; depth: number }[] = [
    { file: entryFile, depth: 0 },
  ];

  while (queue.length > 0 && collected.size < MAX_FILES) {
    const { file, depth } = queue.shift()!;
    if (depth >= MAX_DEPTH) {
      continue;
    }

    let content: string;
    try {
      content = fs.readFileSync(file, "utf-8");
    } catch {
      continue;
    }

    for (const spec of getRelativeImports(content, file)) {
      const resolved = resolveRelativeImport(file, spec);
      if (!resolved || visited.has(resolved)) {
        continue;
      }
      visited.add(resolved);

      let depContent: string;
      try {
        depContent = fs.readFileSync(resolved, "utf-8");
      } catch {
        continue;
      }
      collected.set(resolved, { filePath: resolved, content: depContent });
      queue.push({ file: resolved, depth: depth + 1 });
      if (collected.size >= MAX_FILES) {
        break;
      }
    }
  }

  return Array.from(collected.values());
}

/**
 * Detect required context providers by scanning collected files for the
 * conventional guard message thrown by context hooks:
 *   "<hook> must be used within a <Provider>"
 * then locating which collected file exports that provider.
 */
function detectRequiredProviders(
  files: CollectedFile[],
): RequiredProvider[] {
  const guardRegex =
    /must be used within (?:a |an |the )?<?([A-Z][A-Za-z0-9_]*)>?/g;

  const providerNames = new Set<string>();
  for (const file of files) {
    let match: RegExpExecArray | null;
    guardRegex.lastIndex = 0;
    while ((match = guardRegex.exec(file.content)) !== null) {
      providerNames.add(match[1]);
    }
  }

  const providers: RequiredProvider[] = [];
  for (const name of providerNames) {
    const exportRegex = new RegExp(
      `export\\s+(?:default\\s+)?(?:const|function|class|let)?\\s*${name}\\b|export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`,
    );
    const owner = files.find((f) => exportRegex.test(f.content));
    if (owner) {
      providers.push({ providerName: name, filePath: owner.filePath });
    }
  }
  return providers;
}

export async function collectContext(
  filePath: string,
  componentName: string,
): Promise<ComponentContext> {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const dependencies = collectDependencies(filePath);
  const requiredProviders = detectRequiredProviders(dependencies);

  return {
    filePath,
    fileContent,
    componentName,
    dependencies,
    requiredProviders,
  };
}
