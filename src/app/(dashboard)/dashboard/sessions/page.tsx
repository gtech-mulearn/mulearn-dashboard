import type { Metadata } from "next";
import { StudentSessionsPage } from "@/features/mentor/sessions/components/student-sessions-page";

export const metadata: Metadata = {
  title: "Sessions",
  description: "View and manage your sessions.",
};

export default function LearnerSessionsRoute() {
  return <StudentSessionsPage />;
}
