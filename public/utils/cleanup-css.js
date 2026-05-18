/**
 * With SSE + Hono JSX, CSS for the streamed content is appended to the end of the #hono-css <style> element, even if the css in question already exists.
 * This mean that the #hono-css <style> element can grow indefinitely, which is not ideal.
 * This script removes duplicate CSS declarations from the #hono-css <style> element, keeping a single instance of each declaration.
 * It uses document.styleSheets to efficiently parse the CSS and identify duplicates, rather than relying on string manipulation.
 * It will automatically start and run whenever the #hono-css <style> element is updated (with a throttle to avoid excessive processing), ensuring that the CSS remains clean and efficient without manual intervention.
 */

const LOG_ENABLED = false;
const STYLE_ID = "hono-css";
const THROTTLE_MS = 5000;

(function cleanupHonoCss() {
  function log(...args) {
    if (!LOG_ENABLED) {
      return;
    }
    console.debug("[cleanup-css]", ...args);
  }

  /** @type {MutationObserver | null} */
  let styleObserver = null;

  /** @type {MutationObserver | null} */
  let rootObserver = null;

  /** @type {number | null} */
  let throttleTimer = null;

  let isCleaning = false;
  let suppressObserverUntil = 0;

  function isSuppressedMutation() {
    return performance.now() < suppressObserverUntil;
  }

  /** @returns {HTMLStyleElement | null} */
  function getStyleElement() {
    const element = document.getElementById(STYLE_ID);
    if (!(element instanceof HTMLStyleElement)) {
      log("style element not found");
      return null;
    }
    return element;
  }

  /**
   * @param {HTMLStyleElement} styleElement
   * @returns {CSSStyleSheet | null}
   */
  function getOwnedStyleSheet(styleElement) {
    for (const sheet of document.styleSheets) {
      if (sheet.ownerNode === styleElement) {
        return /** @type {CSSStyleSheet} */ (sheet);
      }
    }
    return null;
  }

  /**
   * @param {HTMLStyleElement} styleElement
   */
  function removeDuplicateRules(styleElement) {
    if (isCleaning) {
      log("cleanup skipped: already cleaning");
      return;
    }

    const styleSheet = getOwnedStyleSheet(styleElement);
    if (!styleSheet) {
      log("cleanup skipped: stylesheet not found");
      return;
    }

    let rules;
    try {
      rules = Array.from(styleSheet.cssRules);
    } catch {
      log("cleanup skipped: unable to read cssRules");
      return;
    }

    if (rules.length === 0) {
      log("cleanup skipped: no rules");
      return;
    }

    const seen = new Set();
    const uniqueCssTexts = [];

    for (const rule of rules) {
      const cssText = rule.cssText.trim();
      if (!cssText || seen.has(cssText)) {
        continue;
      }

      seen.add(cssText);
      uniqueCssTexts.push(cssText);
    }

    if (uniqueCssTexts.length === rules.length) {
      log("cleanup complete: no duplicates", { totalRules: rules.length });
      return;
    }

    const duplicatesRemoved = rules.length - uniqueCssTexts.length;

    const nextCss = uniqueCssTexts.join("\n");
    const currentCss = styleElement.textContent ?? "";
    if (nextCss === currentCss.trim()) {
      log("cleanup skipped: computed css unchanged", {
        totalRules: rules.length,
        duplicatesRemoved,
      });
      return;
    }

    isCleaning = true;
    try {
      log("cleanup writing css", {
        totalRules: rules.length,
        uniqueRules: uniqueCssTexts.length,
        duplicatesRemoved,
      });

      // Avoid scheduling cleanup from our own DOM write.
      suppressObserverUntil = performance.now() + 50;
      styleElement.textContent = nextCss;
    } finally {
      isCleaning = false;
    }
  }

  function scheduleCleanup() {
    if (throttleTimer !== null) {
      log("schedule skipped: timer already running");
      return;
    }

    log("schedule cleanup", { throttleMs: THROTTLE_MS });

    throttleTimer = globalThis.setTimeout(() => {
      throttleTimer = null;
      const styleElement = getStyleElement();
      if (!styleElement) {
        log("cleanup tick: style element still missing");
        return;
      }
      log("cleanup tick: running dedupe");
      removeDuplicateRules(styleElement);
    }, THROTTLE_MS);
  }

  function attachStyleObserver() {
    const styleElement = getStyleElement();

    if (!styleElement) {
      if (styleObserver) {
        log("disconnect style observer: style element missing");
        styleObserver.disconnect();
        styleObserver = null;
      }
      return;
    }

    if (styleObserver) {
      log("reconnect style observer");
      styleObserver.disconnect();
    }

    styleObserver = new MutationObserver(() => {
      if (isSuppressedMutation()) {
        log("style observer skipped: internal write");
        return;
      }
      log("style observer triggered");
      scheduleCleanup();
    });

    styleObserver.observe(styleElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    log("style observer attached");
  }

  function attachRootObserver() {
    if (rootObserver) {
      log("root observer already attached");
      return;
    }

    rootObserver = new MutationObserver(() => {
      if (isSuppressedMutation()) {
        log("root observer skipped: internal write");
        return;
      }
      log("root observer triggered");
      attachStyleObserver();
      scheduleCleanup();
    });

    rootObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    log("root observer attached");
  }

  function start() {
    log("start", { readyState: document.readyState });
    attachStyleObserver();
    attachRootObserver();
    scheduleCleanup();
  }

  if (document.readyState === "loading") {
    log("waiting for DOMContentLoaded");
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
