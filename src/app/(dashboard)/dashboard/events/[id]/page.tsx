import { EventDetailView } from "@/features/events";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage(props: EventDetailPageProps) {
  const { id } = await props.params;
  return <EventDetailView eventId={id} />;
}
