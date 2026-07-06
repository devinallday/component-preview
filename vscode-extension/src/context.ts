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

const SCAN_SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "out",
  "build",
  ".component-preview",
]);
const MAX_SCAN_FILES = 2000;

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

/** Nearest ancestor `src` dir, else nearest dir with a `package.json`, else the file's own dir. */
function findSearchRoot(entryFile: string): string {
  const entryDir = path.dirname(entryFile);

  for (let dir = entryDir; ; ) {
    if (path.basename(dir) === "src") {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  for (let dir = entryDir; ; ) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  return entryDir;
}

/**
 * Scan the workspace source tree (bounded, skipping vendored/build dirs) to locate a
 * provider the component depends on via a hook/context but never imports directly.
 */
function scanWorkspaceSourceFiles(entryFile: string): CollectedFile[] {
  const root = findSearchRoot(entryFile);
  const results: CollectedFile[] = [];
  const stack: string[] = [root];

  while (stack.length > 0 && results.length < MAX_SCAN_FILES) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (results.length >= MAX_SCAN_FILES) {
        break;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SCAN_SKIP_DIRS.has(entry.name)) {
          continue;
        }
        stack.push(full);
      } else if (
        entry.isFile() &&
        RESOLVE_EXTENSIONS.includes(path.extname(entry.name))
      ) {
        let content: string;
        try {
          content = fs.readFileSync(full, "utf-8");
        } catch {
          continue;
        }
        results.push({ filePath: full, content });
      }
    }
  }

  return results;
}

/**
 * Detect required context providers via the conventional guard thrown by context
 * hooks ("<hook> must be used within a <Provider>"), then find the provider's file.
 * The provider is often not in the collected deps (the component imports the
 * hook/context, not the provider), so unresolved names are looked up by scanning the
 * workspace; the found file + its deps are returned in `extraDependencies`.
 */
function detectRequiredProviders(
  files: CollectedFile[],
  entryFile: string,
): { providers: RequiredProvider[]; extraDependencies: CollectedFile[] } {
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
  const extraDependencies: CollectedFile[] = [];
  const seenPaths = new Set<string>(files.map((f) => f.filePath));

  // Scan the workspace at most once, and only if a provider is missing from the deps.
  let workspaceFiles: CollectedFile[] | null = null;
  const getWorkspaceFiles = (): CollectedFile[] => {
    if (workspaceFiles === null) {
      workspaceFiles = scanWorkspaceSourceFiles(entryFile);
    }
    return workspaceFiles;
  };

  for (const name of providerNames) {
    const exportRegex = new RegExp(
      `export\\s+(?:default\\s+)?(?:const|function|class|let)?\\s*${name}\\b|export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`,
    );
    const owner =
      files.find((f) => exportRegex.test(f.content)) ??
      getWorkspaceFiles().find((f) => exportRegex.test(f.content));
    if (!owner) {
      continue;
    }

    providers.push({ providerName: name, filePath: owner.filePath });
    for (const dep of [owner, ...collectDependencies(owner.filePath)]) {
      if (!seenPaths.has(dep.filePath)) {
        seenPaths.add(dep.filePath);
        extraDependencies.push(dep);
      }
    }
  }
  return { providers, extraDependencies };
}

export async function collectContext(
  filePath: string,
  componentName: string,
): Promise<ComponentContext> {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const dependencies = collectDependencies(filePath);
  const { providers: requiredProviders, extraDependencies } =
    detectRequiredProviders(dependencies, filePath);

  const seenPaths = new Set<string>(dependencies.map((d) => d.filePath));
  for (const dep of extraDependencies) {
    if (!seenPaths.has(dep.filePath)) {
      seenPaths.add(dep.filePath);
      dependencies.push(dep);
    }
  }

  return {
    filePath,
    fileContent,
    componentName,
    dependencies,
    requiredProviders,
  };
}
