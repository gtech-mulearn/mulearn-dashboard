import type { Metadata } from "next";
import { SessionsPage } from "@/features/mentor";

export const metadata: Metadata = {
  title: "Mentor Sessions",
  description: "View and manage your mentoring sessions.",
};

export default function MentorSessionsRoute() {
  return <SessionsPage />;
}
