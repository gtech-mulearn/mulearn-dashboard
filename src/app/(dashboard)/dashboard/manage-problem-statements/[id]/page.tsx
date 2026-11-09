import type { Metadata } from "next";
import { ManageProblemStatementDetailView } from "@/features/problem-statements";
import { requireAuth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Manage Problem Statement",
  description:
    "View candidates, analytics, and manage problem statement details.",
};

interface ManageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageProblemStatementDetailPage(
  props: ManageDetailPageProps,
) {
  await requireAuth();
  const { id } = await props.params;
  return <ManageProblemStatementDetailView statementId={id} />;
}
