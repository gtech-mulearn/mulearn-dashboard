import type { Metadata } from "next";
import { MentorDashboard } from "@/features/mentor";

export const metadata: Metadata = {
  title: "Mentor Dashboard | μLearn",
  description: "Manage your mentorship, sessions, and availability",
};

export default function MentorPage() {
  return <MentorDashboard />;
}
