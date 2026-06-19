import type { Metadata } from "next";
import { EventsPageClient } from "./events-client";

export const metadata: Metadata = {
  title: "Events",
  description: "View and manage events.",
};

export default function EventsPage() {
  return <EventsPageClient />;
}
