import type { Metadata } from "next";
import { EditJobPageClient } from "./job-edit-client";

export const metadata: Metadata = {
  title: "Edit Job",
  description: "Edit an existing job listing.",
};

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function EditJobPage({ params }: PageProps) {
  const { jobId } = await params;
  return <EditJobPageClient jobId={jobId} />;
}
