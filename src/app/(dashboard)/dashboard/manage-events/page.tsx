import type { Metadata } from "next";
import { ManageEventsDashboard } from "@/features/events";
import { requireAuth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Manage Events",
  description: "Create and manage events.",
};

export default async function ManageEventsPage() {
  await requireAuth();
  return <ManageEventsDashboard />;
}
