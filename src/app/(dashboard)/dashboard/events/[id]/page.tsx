import type { Metadata } from "next";
import { EventDetailView } from "@/features/events";

export const metadata: Metadata = {
  title: "Event Details",
  description: "View details for a specific event.",
};

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage(props: EventDetailPageProps) {
  const { id } = await props.params;
  return <EventDetailView eventId={id} layout="full" showVenue={false} />;
}
