import type { Metadata } from "next";
import { JobDetailPageClient } from "./job-detail-client";

export const metadata: Metadata = {
  title: "Job Details",
  description: "View and manage job listing details.",
};

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { jobId } = await params;
  return <JobDetailPageClient jobId={jobId} />;
}
