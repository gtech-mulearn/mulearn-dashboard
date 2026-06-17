import { CampusesSearchClient } from "@/features/search";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Campuses",
  description: "Search and discover campuses.",
};

export default function CampusesSearchPage() {
  return (
    <div className="space-y-6">
      <CampusesSearchClient />
    </div>
  );
}
