import type { Metadata } from "next";
import { Suspense } from "react";
import { StudentsSearchClient } from "@/features/search";

export const metadata: Metadata = {
  title: "Search Students",
  description: "Search and discover students.",
};

export default function StudentsSearchPage() {
  return (
    <div className="space-y-6">
      <Suspense>
        <StudentsSearchClient />
      </Suspense>
    </div>
  );
}
