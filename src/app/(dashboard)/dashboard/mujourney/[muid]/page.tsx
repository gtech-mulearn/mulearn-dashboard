import type { Metadata } from "next";
import { PublicUserJourneyPageClient } from "./mujourney-client";

export const metadata: Metadata = {
  title: "MuJourney",
  description: "Track your learning journey.",
};

interface PageProps {
  params: Promise<{ muid: string }>;
}

export default async function MuJourneyPage({ params }: PageProps) {
  const { muid } = await params;
  return <PublicUserJourneyPageClient muid={muid} />;
}
