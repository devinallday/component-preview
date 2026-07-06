// Stable shared interfaces for the Component Preview extension.
//
// OWNERSHIP: this file is the "stable interfaces" seam (see docs/decisions.md D8).
// It is owned by the spine only. Parallel fan-out workstreams should treat these
// types as a contract and avoid changing them without coordinating on the task board.

/**
 * A source file pulled in while collecting context for a component.
 * Used by the context-collection seam (S1) to describe transitive dependencies.
 */
export interface CollectedFile {
  /** Absolute path to the dependency file. */
  filePath: string;
  /** Full text content of the file. */
  content: string;
}

/**
 * A React context provider that a component (transitively) requires in order to
 * render. Detected by the context-collection seam so the generated mock can wrap
 * the component in the provider (e.g. Player -> PlayerProvider).
 */
export interface RequiredProvider {
  /** The provider component name, e.g. "PlayerProvider". */
  providerName: string;
  /** Absolute path to the module that exports the provider. */
  filePath: string;
}

/**
 * Everything the generation seam needs to know about a component in order to
 * produce a mock that renders in isolation.
 *
 * NOTE: `dependencies` and `requiredProviders` are optional so the interface is
 * forward-compatible — S0 populates only the base fields; S1 fills the rest.
 */
export interface ComponentContext {
  /** Absolute path to the file containing the target component. */
  filePath: string;
  /** Full source of the target component's own file. */
  fileContent: string;
  /** The exported component name to render. */
  componentName: string;
  /** Transitive local dependencies gathered by the import walk (S1). */
  dependencies?: CollectedFile[];
  /** Context providers the component needs to be wrapped in to render (S1). */
  requiredProviders?: RequiredProvider[];
}

/**
 * A golden-set assertion for one target state: every `mustContain` substring must
 * appear in the rendered page text for that state to pass. Fixtures declare these in
 * a sibling `*.golden.ts`; the verification seam only consumes the parsed shape.
 */
export interface GoldenAssertion {
  state: string;
  mustContain?: string[];
}

export interface AssertionResult {
  state: string;
  passed: boolean;
  detail: string;
}

/** Result of the render-verification gate: the objective signal that a mock is trustworthy. */
export interface VerifyResult {
  /** True iff no console/page errors, no error overlay, and `#root` rendered content. */
  ok: boolean;
  consoleErrors: string[];
  pageErrors: string[];
  renderedContent: boolean;
  assertionResults?: AssertionResult[];
}

/**
 * Provenance metadata for a pinned preview (D12/Tier 0).
 * Written as a sidecar JSON alongside `*.preview.tsx` to make mocks reproducible.
 */
export interface PreviewMetadata {
  /** Component name this preview targets. */
  componentName: string;
  /** Absolute path to the component file. */
  componentPath: string;
  /** When this preview was pinned. */
  pinnedAt: string;
  /** Model used for generation. */
  model: string;
  /** Hash of the prompt (for reproducibility). */
  promptHash: string;
  /** Context files used in generation (absolute paths). */
  contextFiles: string[];
  /** Required providers detected. */
  requiredProviders: string[];
}

/**
 * A cached mock entry for the preview generation cache.
 * Stored in `.component-preview/cache.json` keyed by content hash.
 */
export interface CacheEntry {
  /** The generated mock code. */
  mockCode: string;
  /** When this entry was created (for TTL and LRU). */
  timestamp: number;
}
