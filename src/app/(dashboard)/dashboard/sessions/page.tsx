import type { Metadata } from "next";
import { MenteesPage } from "@/features/mentor/mentees/components/mentees-page";

export const metadata: Metadata = {
  title: "Sessions",
  description: "View and manage your sessions.",
};

export default function LearnerSessionsRoute() {
  return <MenteesPage title="Sessions" />;
}
