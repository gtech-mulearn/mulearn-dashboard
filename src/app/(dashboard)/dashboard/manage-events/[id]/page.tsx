import type { Metadata } from "next";
import { ManageEventDetailView } from "@/features/events";

export const metadata: Metadata = {
  title: "Event Management",
  description: "Manage details for a specific event.",
};

interface ManageEventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageEventDetailPage(
  props: ManageEventDetailPageProps,
) {
  const { id } = await props.params;
  return <ManageEventDetailView eventId={id} />;
}
