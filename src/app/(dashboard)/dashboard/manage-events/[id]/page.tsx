import { ManageEventDetailView } from "@/features/events";

interface ManageEventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageEventDetailPage(
  props: ManageEventDetailPageProps,
) {
  const { id } = await props.params;
  return <ManageEventDetailView eventId={id} />;
}
