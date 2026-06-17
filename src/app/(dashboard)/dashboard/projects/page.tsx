import { Suspense } from "react";
import { ProjectsListingPage } from "@/features/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse and discover community projects.",
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsListingPage />
    </Suspense>
  );
}
