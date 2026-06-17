/**
 * MuJourney Main Page
 *
 * 📍 src/app/(dashboard)/mujourney/page.tsx
 *
 * Main MuJourney interface with tabs
 */

import { MuJourneyDashboard } from "@/features/mujourney";
import { fetchPublicLevels } from "@/features/mujourney/api";
import { isAuthenticated } from "@/lib/auth/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MuJourney",
  description: "Track your learning journey and progress.",
};

export default async function MuJourneyPage() {
  const authenticated = await isAuthenticated();

  // Hybrid Approach:
  // 1. If NOT authenticated (Public), fetch public levels on server (SSR for SEO).
  // 2. If authenticated (Private), skip server fetch. Client component will fetch user data (CSR).
  let initialLevels = null;

  if (!authenticated) {
    try {
      const publicData = await fetchPublicLevels();
      // Ensure the structure matches what MuJourneyDashboard expects
      if (publicData) {
        initialLevels = publicData;
      }
    } catch {
      // Non-fatal: authenticated users get their data client-side anyway.
    }
  }

  return (
    <MuJourneyDashboard
      initialLevels={initialLevels}
      isAuthenticated={authenticated}
    />
  );
}
