/**
 * driver.js Adapter
 *
 * 📍 src/features/tour/lib/driver-adapter.ts
 *
 * Thin wrapper isolating the third-party API so it can be swapped later
 * without touching `useTour` or step definitions.
 */

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { TourStep } from "../types";
import { waitForElementSettle } from "./wait-for-sheet";

export interface LaunchDriverHandlers {
  onSkip: () => void;
  onComplete: () => void;
  /**
   * Mobile-only hook: called with the step being moved *to*, before driver.js
   * measures/highlights it. Resolve once the off-canvas sidebar sheet is in
   * the right open/closed state for that step (open for a nav-item step,
   * closed for a `centered` one) and has visually settled. No-op on desktop,
   * where every step's element is already on-screen.
   */
  prepareStep?: (step: TourStep) => Promise<void>;
}

/**
 * True while any driver.js tour (home or page) is currently on-screen.
 * driver.js stamps this class on `<html>` for the duration of `d.drive()`.
 * Used to stop a page tour launching over a still-open home tour (or
 * vice versa) when a route change fires mid-tour.
 */
export function isAnyTourActive(): boolean {
  return document.documentElement.classList.contains("driver-active");
}

export function launchDriver(
  steps: readonly TourStep[],
  handlers: LaunchDriverHandlers,
) {
  let d: ReturnType<typeof driver>;

  const goToIndex = (index: number, direction: "next" | "prev") => {
    const target = steps[index];
    void (async () => {
      await handlers.prepareStep?.(target);
      if (direction === "next") d.moveNext();
      else d.movePrevious();

      // On mobile, `prepareStep` only waits for the sheet panel itself to
      // stop moving — if the sheet was already open (consecutive nav-item
      // steps), its rect is stable instantly, before the target link has
      // scrolled into view inside the sheet's own `overflow:auto` nav list.
      // That inner scroll never fires a `window` scroll event, so driver.js
      // never re-syncs its overlay on its own: it freezes on whatever rect
      // it sampled mid-scroll. Re-measure the real target and force a
      // refresh once it's actually settled.
      if (!target.centered) {
        const selector = `[data-tour-id="${target.navId ?? target.elementId}"]`;
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ block: "nearest" });
          await waitForElementSettle(el);
          d.refresh();
        }
      }
    })();
  };

  d = driver({
    showProgress: true,
    progressText: "Step {{current}} of {{total}}",
    doneBtnText: "Finish",
    showButtons: ["next", "previous"],
    smoothScroll: true,
    allowClose: false,
    steps: steps.map((s) => ({
      element: s.centered
        ? undefined
        : `[data-tour-id="${s.navId ?? s.elementId}"]`,
      popover: { title: s.title, description: s.description },
    })),
    onNextClick: (_element, _step, opts) => {
      // The "Finish" button on the last step reuses this same hook (there's
      // no separate onDoneClick configured) — destroy directly instead of
      // stepping past the end; `onDestroyStarted` below reads `isLastStep()`
      // to route this to `onComplete`.
      if (d.isLastStep()) {
        d.destroy();
        return;
      }
      goToIndex((opts.state.activeIndex ?? 0) + 1, "next");
    },
    onPrevClick: (_element, _step, opts) => {
      goToIndex((opts.state.activeIndex ?? 0) - 1, "prev");
    },
    onPopoverRender: (popover) => {
      // Default close (×) button is dropped entirely: its slot is taken by
      // the "Step X of Y" progress text, moved up out of the footer, while
      // the footer slot it vacates gets an explicit "Skip tour" action —
      // same destroy path `onDestroyStarted` below already handles.
      popover.wrapper.appendChild(popover.progress);
      popover.progress.classList.add("driver-popover-progress-corner");

      const skipBtn = document.createElement("button");
      skipBtn.type = "button";
      skipBtn.textContent = "Skip tour";
      skipBtn.className = "driver-popover-footer-btn driver-popover-skip-btn";
      skipBtn.addEventListener("click", () => d.destroy());
      popover.footer.insertBefore(skipBtn, popover.footer.firstChild);
    },
    onDestroyStarted: () => {
      // Fires for Skip, Esc, and outside-click alike — driver.js doesn't
      // distinguish these by default, so `isLastStep()` is the signal used
      // to tell a natural Finish apart from every other exit path (Esc /
      // outside-click must still count as Skip, not a silent no-op).
      if (d.isLastStep()) {
        handlers.onComplete();
      } else {
        handlers.onSkip();
      }
      // Abandoning mid-tour (Skip/Esc/outside-click) may leave the mobile
      // sidebar sheet open — `centered: true` is the same "close it back
      // down" signal a real centered step carries, no full step needed.
      void handlers.prepareStep?.({ centered: true } as TourStep);
      d.destroy();
    },
  });

  d.drive();

  return d;
}
