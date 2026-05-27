import { Suspense } from "react";
import { ProjectsListingPage } from "@/features/projects";

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsListingPage />
    </Suspense>
  );
}
