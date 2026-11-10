import type { Metadata } from "next";
import { ProblemStatementsClient } from "@/features/problem-statements";

export const metadata: Metadata = {
  title: "Problem Statements",
  description:
    "Discover real-world problem statements and collaborate on innovative solutions.",
};

export default function ProblemStatementsPage() {
  return <ProblemStatementsClient />;
}
