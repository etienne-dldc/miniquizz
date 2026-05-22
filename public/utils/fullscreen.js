/**
 * Handles click on any [data-fullscreen] element and requests fullscreen.
 * It also attempts to lock the orientation to portrait while fullscreen.
 *
 * Optional attributes on the trigger element:
 * - data-fullscreen-target: CSS selector for the element to fullscreen
 * - data-fullscreen-target-closest: CSS selector resolved with closest()
 */

(function fullscreenUtility() {
  const activeOrientationLocks = new Set();

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestElementFullscreen(element) {
    if (typeof element.requestFullscreen === "function") {
      return element.requestFullscreen();
    }

    if (typeof element.webkitRequestFullscreen === "function") {
      return element.webkitRequestFullscreen();
    }

    return Promise.reject(new Error("Fullscreen API is not supported"));
  }

  function exitDocumentFullscreen() {
    if (typeof document.exitFullscreen === "function") {
      return document.exitFullscreen();
    }

    if (typeof document.webkitExitFullscreen === "function") {
      return document.webkitExitFullscreen();
    }

    return Promise.resolve();
  }

  function resolveFullscreenTarget(trigger) {
    const explicitSelector = trigger.getAttribute("data-fullscreen-target");
    if (explicitSelector) {
      const selected = document.querySelector(explicitSelector);
      if (selected instanceof Element) {
        return selected;
      }
    }

    const closestSelector = trigger.getAttribute("data-fullscreen-target-closest");
    if (closestSelector) {
      const closest = trigger.closest(closestSelector);
      if (closest instanceof Element) {
        return closest;
      }
    }

    // Default to the whole page when no explicit target is provided.
    return document.documentElement;
  }

  async function lockPortraitFor(element) {
    if (!screen.orientation || typeof screen.orientation.lock !== "function") {
      return;
    }

    try {
      await screen.orientation.lock("portrait");
      activeOrientationLocks.add(element);
    } catch {
      // Orientation lock commonly fails on unsupported browsers/platforms.
    }
  }

  async function unlockPortraitIfNeeded(element) {
    if (!activeOrientationLocks.has(element)) {
      return;
    }

    if (!screen.orientation || typeof screen.orientation.unlock !== "function") {
      activeOrientationLocks.delete(element);
      return;
    }

    try {
      await screen.orientation.unlock();
    } catch {
      // Ignore unlock errors when browser does not allow it.
    } finally {
      activeOrientationLocks.delete(element);
    }
  }

  async function toggleFullscreen(trigger) {
    const target = resolveFullscreenTarget(trigger);
    const fullscreenElement = getFullscreenElement();

    if (fullscreenElement) {
      await exitDocumentFullscreen();
      await unlockPortraitIfNeeded(fullscreenElement);
      return;
    }

    await requestElementFullscreen(target);
    await lockPortraitFor(target);
  }

  async function onDocumentClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const trigger = target.closest("[data-fullscreen]");
    if (!(trigger instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();

    try {
      await toggleFullscreen(trigger);
    } catch {
      // Ignore errors to avoid breaking interaction flow.
    }
  }

  async function onFullscreenChange() {
    const fullscreenElement = getFullscreenElement();
    if (fullscreenElement) {
      return;
    }

    // Fullscreen exited externally (Esc, browser UI, etc.). Unlock orientation.
    const lockedElements = Array.from(activeOrientationLocks);
    await Promise.all(lockedElements.map((element) => unlockPortraitIfNeeded(element)));
  }

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
})();
