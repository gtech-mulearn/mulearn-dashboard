/**
 * MuJourney Layout
 *
 * 📍 src/app/(dashboard)/mujourney/layout.tsx
 */

import type { ReactNode } from "react";

export default function MuJourneyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">{children}</div>
  );
}
