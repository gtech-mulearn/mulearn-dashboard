import type { Metadata } from "next";
import { EventReportPageClient } from "./event-report-client";

export const metadata: Metadata = {
  title: "Reports",
  description: "View and manage reports.",
};

export default function ReportsPage() {
  return <EventReportPageClient />;
}
