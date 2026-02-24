import { AnalyticsView } from "@/features/url-shortner";

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  return <AnalyticsView params={Promise.resolve(params)} />;
}
