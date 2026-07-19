import type { Metadata } from "next";

import { StateDisplay } from "@/components/ui/state-display";
import { Football } from "./football";

/**
 * FIFA Break Page
 *
 * 📍 src/app/break/page.tsx
 *
 * The only page served while the break gate in `src/proxy.ts` is active: every
 * request is rewritten here until Tue 21 Jul 2026, 10:00 IST, after which the
 * gate goes dead and this route is unreachable in practice.
 *
 * It sits outside every route group on purpose — it inherits the root layout
 * (fonts, theme, providers) and nothing else. No sidebar, no auth guard, no
 * data fetching, so it renders even with the API returning 503.
 *
 * TEMPORARY: delete this route, the `break` variant in state-display.tsx and
 * the gate in proxy.ts once the break is over.
 */

export const metadata: Metadata = {
  title: "Back on Tuesday",
  description:
    "Kerala is celebrating football, and so are we. The μLearn dashboard will return on Tuesday.",
  // The break page must not be snapshotted as the site's homepage.
  robots: { index: false, follow: false },
};

export default function BreakPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <StateDisplay variant="break" size="lg" />
      <Football />
    </main>
  );
}
