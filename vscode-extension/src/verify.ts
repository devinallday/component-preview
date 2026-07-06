// Render-verification seam. See docs/seams.md (#6) and docs/decisions.md (D4/D9).
// The DOM lib reference is required: Playwright's types and the page.evaluate callback
// need browser globals, but the extension's tsconfig targets ES2022 without DOM.
/// <reference lib="dom" />

import { chromium, Browser, ConsoleMessage } from "playwright";
import { GoldenAssertion, AssertionResult, VerifyResult } from "./types";

export interface VerifyOptions {
  assertions?: GoldenAssertion[];
  timeoutMs?: number;
  settleMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_SETTLE_MS = 750;

// Text that signals a broken render even when nothing hit the console — e.g. a thrown
// provider guard caught by an error boundary, or a stack shown in Vite's overlay.
const ERROR_TEXT_INDICATORS = [
  "must be used within",
  "is not defined",
  "Cannot read propert",
  "is not a function",
  "Failed to resolve import",
  "Internal Server Error",
];

export async function verifyRender(
  url: string,
  options: VerifyOptions = {},
): Promise<VerifyResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const settleMs = options.settleMs ?? DEFAULT_SETTLE_MS;

  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err: Error) => {
      pageErrors.push(err.message || String(err));
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
    // Settle so late microtask/effect errors surface before we inspect the page.
    await page.waitForTimeout(settleMs);

    // Vite reports build/runtime errors through a custom <vite-error-overlay> element.
    const overlayCount = await page
      .locator("vite-error-overlay")
      .count()
      .catch(() => 0);
    if (overlayCount > 0) {
      const overlayText = await page
        .locator("vite-error-overlay")
        .first()
        .innerText()
        .catch(() => "vite-error-overlay present");
      pageErrors.push(`vite-error-overlay: ${overlayText.trim().slice(0, 500)}`);
    }

    const bodyText = (await page
      .locator("body")
      .innerText()
      .catch(() => "")) as string;

    for (const indicator of ERROR_TEXT_INDICATORS) {
      if (bodyText.includes(indicator)) {
        pageErrors.push(`error indicator in page text: "${indicator}"`);
      }
    }

    const renderedContent = await page
      .evaluate(() => {
        const root = document.getElementById("root");
        if (!root) {
          return false;
        }
        const text = (root.textContent ?? "").trim();
        return root.children.length > 0 || text.length > 0;
      })
      .catch(() => false);

    let assertionResults: AssertionResult[] | undefined;
    if (options.assertions && options.assertions.length > 0) {
      assertionResults = options.assertions.map((assertion) =>
        scoreAssertion(assertion, bodyText),
      );
    }

    const ok =
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      renderedContent;

    return {
      ok,
      consoleErrors,
      pageErrors,
      renderedContent,
      assertionResults,
    };
  } catch (err) {
    // A navigation/timeout failure is itself a verification failure, not a crash.
    pageErrors.push(
      `verifyRender failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return {
      ok: false,
      consoleErrors,
      pageErrors,
      renderedContent: false,
      assertionResults: options.assertions ? [] : undefined,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {
        /* best-effort cleanup */
      });
    }
  }
}

function scoreAssertion(
  assertion: GoldenAssertion,
  bodyText: string,
): AssertionResult {
  const required = assertion.mustContain ?? [];
  const missing = required.filter((needle) => !bodyText.includes(needle));
  if (missing.length === 0) {
    return {
      state: assertion.state,
      passed: true,
      detail:
        required.length > 0
          ? `all ${required.length} required substring(s) present`
          : "no substrings required",
    };
  }
  return {
    state: assertion.state,
    passed: false,
    detail: `missing substring(s): ${missing.map((m) => JSON.stringify(m)).join(", ")}`,
  };
}
