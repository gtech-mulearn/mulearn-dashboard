import { AnalyticsView } from "@/features/url-shortner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Analytics",
  description: "View analytics for a shortened URL.",
};

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  return <AnalyticsView params={Promise.resolve(params)} />;
}
