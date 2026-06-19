import type { Metadata } from "next";
import { MenteesPage } from "@/features/mentor/mentees/components/mentees-page";

export const metadata: Metadata = {
  title: "Mentees",
  description: "View and manage your mentees.",
};

export default function MentorMenteesRoute() {
  return <MenteesPage />;
}
