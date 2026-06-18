/**
 * Learning Circle List Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/page.tsx
 *
 * Main page showing all learning circles.
 */

import type { Metadata } from "next";
import { CircleList } from "@/features/learning-circle";
import { LearningCircleHeader } from "./learning-circle-header";

export const metadata: Metadata = {
  title: "Learning Circles",
  description: "Join or create learning circles to collaborate with others.",
};

export default function LearningCirclePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learning Circles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join or create learning circles to collaborate with others
          </p>
        </div>
        <LearningCircleHeader />
      </div>

      <CircleList />
    </div>
  );
}
