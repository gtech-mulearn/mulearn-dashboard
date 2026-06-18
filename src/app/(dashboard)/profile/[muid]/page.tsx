import type { Metadata } from "next";
import { PublicProfilePageClient } from "./publicprofile-client";

export const metadata: Metadata = {
  title: "Profile",
  description: "View user profile details.",
};

interface PageProps {
  params: Promise<{ muid: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { muid } = await params;
  return <PublicProfilePageClient muid={muid} />;
}
