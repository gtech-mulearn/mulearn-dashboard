import type { Metadata } from "next";
import { ManageProblemStatementsDashboard } from "@/features/problem-statements";
import { requireAuth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Problem Statements",
  description: "Create and manage problem statements for your company.",
};

export default async function ManageProblemStatementsPage() {
  await requireAuth();
  return <ManageProblemStatementsDashboard />;
}
