import type { Metadata } from "next";
import { OpportunitiesPage } from "@/features/mentor/opportunities";

export const metadata: Metadata = {
  title: "Mentor Opportunities",
  description: "Browse available mentoring opportunities.",
};

export default function MentorOpportunitiesRoute() {
  return <OpportunitiesPage />;
}
