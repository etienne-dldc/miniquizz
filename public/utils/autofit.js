/**
 * This script watches the DOM to find any element with the attribute data-autofit, and apply the CSS properties to make it fit its content.
 * data-autofit elements are expected to have a single child with fixed width and height.
 * When an element is found, it should position the child in the center of the parent and apply a scale transform to make the child fit the parent, while keeping its aspect ratio.
 * The script should also watch for changes in the parent element size and update the scale transform accordingly.
 * We need to make sure we properly clean up any element that is removed from the DOM, to avoid memory leaks.
 */

// Map to store ResizeObservers and child dimensions for each element
const elementData = new WeakMap();

/**
 * Calculate and apply the scale transform to fit the child within the parent.
 * Uses stored child dimensions measured once at init time.
 */
function updateScale(parentElement) {
  const data = elementData.get(parentElement);
  if (!data) return;

  const { child, childWidth, childHeight } = data;

  const parentRect = parentElement.getBoundingClientRect();
  const parentWidth = parentRect.width;
  const parentHeight = parentRect.height;

  if (parentWidth <= 0 || parentHeight <= 0) {
    return;
  }

  // Calculate scale to fit child within parent, maintaining aspect ratio
  const scaleX = parentWidth / childWidth;
  const scaleY = parentHeight / childHeight;
  const scale = Math.min(scaleX, scaleY);

  // Apply the transform
  child.style.transform = `scale(${scale})`;
}

/**
 * Setup and initialize a data-autofit element
 */
function setupAutofitElement(element) {
  // Apply initial styles to position child in center
  element.style.display = "grid";
  element.style.placeItems = "center";
  element.style.overflow = "hidden";

  const child = element.firstElementChild;
  if (!child) return;

  child.style.transformOrigin = "center";

  // Measure child dimensions once at init time
  const childRect = child.getBoundingClientRect();
  const childWidth = childRect.width;
  const childHeight = childRect.height;

  if (childWidth <= 0 || childHeight <= 0) {
    return;
  }

  // Create and setup ResizeObserver for this element
  const resizeObserver = new ResizeObserver(() => {
    updateScale(element);
  });

  elementData.set(element, { child, childWidth, childHeight, resizeObserver });
  resizeObserver.observe(element);

  // Initial scale calculation
  updateScale(element);
}

/**
 * Cleanup a data-autofit element
 */
function cleanupAutofitElement(element) {
  const data = elementData.get(element);
  if (data) {
    data.resizeObserver.disconnect();
    elementData.delete(element);
  }
}

/**
 * Find all data-autofit elements and setup them
 */
function initializeAutofitElements() {
  const autofitElements = document.querySelectorAll("[data-autofit]");
  autofitElements.forEach(setupAutofitElement);
}

/**
 * Setup MutationObserver to watch for added/removed data-autofit elements
 */
function setupMutationObserver() {
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Handle added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        // Check if the node itself has data-autofit
        if (node.hasAttribute && node.hasAttribute("data-autofit")) {
          setupAutofitElement(node);
        }

        // Check if any descendants have data-autofit
        if (node.querySelectorAll) {
          node.querySelectorAll("[data-autofit]").forEach(setupAutofitElement);
        }
      });

      // Handle removed nodes
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        // Check if the node itself has data-autofit
        if (node.hasAttribute && node.hasAttribute("data-autofit")) {
          cleanupAutofitElement(node);
        }

        // Check if any descendants have data-autofit
        if (node.querySelectorAll) {
          node.querySelectorAll("[data-autofit]").forEach(cleanupAutofitElement);
        }
      });
    });
  });

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeAutofitElements();
    setupMutationObserver();
  });
} else {
  initializeAutofitElements();
  setupMutationObserver();
}
