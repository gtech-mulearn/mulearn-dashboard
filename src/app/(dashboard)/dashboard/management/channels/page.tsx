import type { Metadata } from "next";
import ChannelsPage from "@/features/channels/components/channel-page";

export const metadata: Metadata = {
  title: "Channels",
  description: "Configure communication channels.",
};

export default function Page() {
  return <ChannelsPage />;
}
