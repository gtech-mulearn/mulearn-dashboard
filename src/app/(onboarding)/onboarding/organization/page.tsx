/**
 * Organization Selection Page
 *
 * 📍 src/app/(onboarding)/onboarding/organization/page.tsx
 */

import type { Metadata } from "next";
import { OrganizationClient } from "./organization-client";

export const metadata: Metadata = {
  title: "Select Organization | μLearn",
  description: "Select your college or company to connect with your community",
};

interface OrganizationPageProps {
  searchParams: Promise<{ ruri?: string }>;
}

export default async function OrganizationPage({
  searchParams,
}: OrganizationPageProps) {
  const params = await searchParams;
  return <OrganizationClient redirectUri={params.ruri} />;
}
