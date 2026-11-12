import type { Metadata } from "next";
import { CompanyAnalyticsPageClient } from "./company-analytics-client";

export const metadata: Metadata = {
  title: "Analytics & Insights | μLearn",
  description: "View company hiring analytics and insights.",
};

export default function CompanyAnalyticsPage() {
  return <CompanyAnalyticsPageClient />;
}
