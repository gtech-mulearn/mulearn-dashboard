/**
 * MuJourney Layout
 *
 * 📍 src/app/(dashboard)/mujourney/layout.tsx
 */

import type { ReactNode } from "react";

export default function MuJourneyLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}
