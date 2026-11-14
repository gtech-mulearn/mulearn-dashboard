/**
 * Wait for Mobile Sidebar Sheet
 *
 * 📍 src/features/tour/lib/wait-for-sheet.ts
 *
 * `[data-mobile="true"]` is the only reliable selector for the sheet panel —
 * `ui/sidebar.tsx` passes `data-slot="sidebar"` into `SheetContent`, which
 * spreads `...props` *after* its own `data-slot="sheet-content"` default, so
 * the caller's value wins and the "sheet-content" slot name never actually
 * reaches the DOM.
 */

const SHEET_SELECTOR = '[data-mobile="true"]';
const TIMEOUT_MS = 900;
/** Two consecutive unchanged frames (~32ms) count as "stopped moving". */
const STABLE_FRAMES_REQUIRED = 2;

/**
 * Resolves once `el`'s position has stopped changing (e.g. after a nested
 * `overflow:auto` list finishes scrolling it into view). Unlike window
 * scroll, scroll on a nested container doesn't fire a `window` `scroll`
 * event, so driver.js's overlay never re-syncs on its own — callers must
 * poll the real target and force a `d.refresh()` once it settles.
 */
export function waitForElementSettle(el: Element): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + TIMEOUT_MS;
    let settled = false;
    let lastKey: string | null = null;
    let stableFrames = 0;

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const check = () => {
      const rect = el.getBoundingClientRect();
      const key = `${rect.left},${rect.top}`;
      if (lastKey === key) {
        stableFrames++;
        if (stableFrames >= STABLE_FRAMES_REQUIRED) {
          finish();
          return;
        }
      } else {
        stableFrames = 0;
      }
      lastKey = key;

      if (Date.now() > deadline) {
        finish();
        return;
      }
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

/**
 * Resolves once the off-canvas sidebar sheet is in the expected open/closed
 * state and, if opening, has visually finished its slide-in transition.
 * Position-agnostic (tracks both axes) so it works regardless of which
 * edge the sheet slides in from.
 */
export function waitForMobileSheet(expectOpen: boolean): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + TIMEOUT_MS;
    let settled = false;
    let lastKey: string | null = null;
    let stableFrames = 0;

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const check = () => {
      const el = document.querySelector(SHEET_SELECTOR);

      if (!expectOpen) {
        // Radix fully unmounts the closed sheet after its exit animation.
        if (!el) {
          finish();
          return;
        }
      } else if (el) {
        const rect = el.getBoundingClientRect();
        const key = `${rect.left},${rect.top}`;
        if (lastKey === key) {
          stableFrames++;
          if (stableFrames >= STABLE_FRAMES_REQUIRED) {
            finish();
            return;
          }
        } else {
          stableFrames = 0;
        }
        lastKey = key;
      }

      if (Date.now() > deadline) {
        finish();
        return;
      }
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}
