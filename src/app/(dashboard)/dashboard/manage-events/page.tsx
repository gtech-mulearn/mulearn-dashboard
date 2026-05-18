import { ManageEventsDashboard } from "@/features/events";
import { requireAuth } from "@/lib/auth/server";

export default async function ManageEventsPage() {
  await requireAuth();
  return <ManageEventsDashboard />;
}
