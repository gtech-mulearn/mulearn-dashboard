import type { Metadata } from "next";
import { AdminSessionVerificationPage } from "@/features/mentor/sessions/components/admin-session-verification-page";

export const metadata: Metadata = {
  title: "Session Verification",
  description: "Approve or reject mentor-submitted sessions.",
};

export default function SessionVerificationRoute() {
  return <AdminSessionVerificationPage />;
}
