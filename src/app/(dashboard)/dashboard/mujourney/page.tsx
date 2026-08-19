/**
 * MuJourney Main Page
 *
 * Server component: delegates all data fetching to the client.
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";

const MuJourneyDashboard = dynamic(() =>
  import("@/features/mujourney").then((mod) => ({
    default: mod.MuJourneyDashboard,
  })),
);

export const metadata: Metadata = {
  title: "MuJourney",
  description: "Track your learning journey and progress.",
};

export default async function MuJourneyPage() {
  return <MuJourneyDashboard />;
}
