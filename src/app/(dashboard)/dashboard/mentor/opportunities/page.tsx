import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor Opportunities",
  description: "Browse available mentoring opportunities.",
};

/**
 * The Opportunities page has been removed from the mentor dashboard.
 * Redirect any direct URL hits back to the main dashboard.
 */
export default function MentorOpportunitiesRoute() {
  redirect("/dashboard");
}
