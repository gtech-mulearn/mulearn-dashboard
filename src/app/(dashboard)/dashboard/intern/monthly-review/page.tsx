import type { Metadata } from "next";
import { MonthlyReviewPageClient } from "./monthly-review-client";

export const metadata: Metadata = {
  title: "Monthly Review",
  description:
    "Submit your monthly review: reflect on your month, share learnings and challenges, and plan the next one.",
};

export default function MonthlyReviewPage() {
  return <MonthlyReviewPageClient />;
}
