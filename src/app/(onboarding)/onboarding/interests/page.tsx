/**
 * Interests Selection Page
 *
 * 📍 src/app/(onboarding)/onboarding/interests/page.tsx
 */

import type { Metadata } from "next";
import { InterestsClient } from "./interests-client";

export const metadata: Metadata = {
  title: "Choose Your Path | μLearn",
  description: "Select your learning interests and goals",
};

interface InterestsPageProps {
  searchParams: Promise<{
    ruri?: string;
    mode?: string;
    mentor_tier?: string;
    mentor_company?: string;
    mentor_org_id?: string;
  }>;
}

export default async function InterestsPage({
  searchParams,
}: InterestsPageProps) {
  const params = await searchParams;
  return (
    <InterestsClient
      redirectUri={params.ruri}
      mode={params.mode as "quiz" | "direct" | undefined}
      mentorTier={params.mentor_tier}
      mentorCompany={params.mentor_company}
      mentorOrgId={params.mentor_org_id}
    />
  );
}
