import type { Metadata } from "next";
import ChannelsPage from "@/features/channels/components/channel-page";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Channels",
  description: "Configure communication channels.",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN]);
  return <ChannelsPage />;
}
