import { MenteesPage } from "@/features/mentor/mentees/components/mentees-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentees",
  description: "View and manage your mentees.",
};

export default function MentorMenteesRoute() {
  return <MenteesPage />;
}
