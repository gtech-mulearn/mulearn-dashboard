import { MentorsSearchClient } from "@/features/search";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Mentors",
  description: "Search and discover mentors.",
};

export default function MentorsSearchPage() {
  return (
    <div className="space-y-6">
      <MentorsSearchClient />
    </div>
  );
}
