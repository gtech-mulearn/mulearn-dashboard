import type { Metadata } from "next";
import { WeeklyReviewPageClient } from "./weekly-review-client";

export const metadata: Metadata = {
  title: "Weekly Review",
  description: "Review your weekly internship progress.",
};

export default function WeeklyReviewPage() {
  return <WeeklyReviewPageClient />;
}
