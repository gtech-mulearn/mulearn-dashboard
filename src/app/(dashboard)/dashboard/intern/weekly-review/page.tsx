import type { Metadata } from "next";
import { WeeklyReviewPageClient } from "./weekly-review-client";

export const metadata: Metadata = {
  title: "Weekly Review",
  description:
    "Submit your weekly review to showcase your progress, highlight key achievements, share challenges, and outline your plan for the upcoming week.",
};

export default function WeeklyReviewPage() {
  return <WeeklyReviewPageClient />;
}
