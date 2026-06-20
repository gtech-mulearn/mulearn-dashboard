/**
 * Learning Circle List Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/page.tsx
 *
 * Main page showing all learning circles.
 */

import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CircleList } from "@/features/learning-circle";
import { LearningCircleHeader } from "./learning-circle-header";

export const metadata: Metadata = {
  title: "Learning Circles",
  description: "Join or create learning circles to collaborate with others.",
};

export default function LearningCirclePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Circles"
        description="Join or create learning circles to collaborate with others"
        action={<LearningCircleHeader />}
      />

      <CircleList />
    </div>
  );
}
