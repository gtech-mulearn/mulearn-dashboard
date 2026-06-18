import type { Metadata } from "next";
import { LeaveManagementPageClient } from "./intern-leave-client";

export const metadata: Metadata = {
  title: "Leave Management",
  description: "Request and manage leave.",
};

export default function LeaveManagementPage() {
  return <LeaveManagementPageClient />;
}
