/**
 * Meeting Detail Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/[id]/meeting/[meet_id]/page.tsx
 *
 * Individual meeting detail view within a circle.
 */

import type { Metadata } from "next";
import { MeetingDetailView } from "@/features/learning-circle";

export const metadata: Metadata = {
  title: "Meeting Details",
  description: "View details for a learning circle meeting.",
};

interface PageProps {
  params: Promise<{ id: string; meet_id: string }>;
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { id, meet_id } = await params;

  return <MeetingDetailView meetingId={meet_id} circleId={id} />;
}
