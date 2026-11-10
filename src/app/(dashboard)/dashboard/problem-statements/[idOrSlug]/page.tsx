import type { Metadata } from "next";
import { ProblemStatementDetailView } from "@/features/problem-statements";

export const metadata: Metadata = {
  title: "Problem Statement",
  description: "View problem statement challenge details and join.",
};

interface ProblemStatementDetailPageProps {
  params: Promise<{ idOrSlug: string }>;
}

export default async function ProblemStatementDetailPage(
  props: ProblemStatementDetailPageProps,
) {
  const { idOrSlug } = await props.params;
  return <ProblemStatementDetailView idOrSlug={idOrSlug} />;
}
