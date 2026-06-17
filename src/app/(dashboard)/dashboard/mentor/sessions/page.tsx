import { SessionsPage } from "@/features/mentor/sessions/components/sessions-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor Sessions",
  description: "View and manage your mentoring sessions.",
};

export default function MentorSessionsRoute() {
  return <SessionsPage />;
}
