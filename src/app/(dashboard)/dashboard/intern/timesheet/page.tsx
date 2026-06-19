import type { Metadata } from "next";
import { TimesheetPageClient } from "./intern-timesheet-client";

export const metadata: Metadata = {
  title: "Timesheet",
  description: "Track and manage your work hours.",
};

export default function TimesheetPage() {
  return <TimesheetPageClient />;
}
