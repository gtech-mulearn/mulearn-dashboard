import { redirect } from "next/navigation";

/**
 * The Opportunities page has been removed from the mentor dashboard.
 * Redirect any direct URL hits back to the main dashboard.
 */
export default function MentorOpportunitiesRoute() {
  redirect("/dashboard");
}
