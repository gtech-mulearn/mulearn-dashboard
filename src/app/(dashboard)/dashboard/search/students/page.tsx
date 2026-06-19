import type { Metadata } from "next";
import { StudentsSearchClient } from "@/features/search";

export const metadata: Metadata = {
  title: "Search Students",
  description: "Search and discover students.",
};

export default function StudentsSearchPage() {
  return (
    <div className="space-y-6">
      <StudentsSearchClient />
    </div>
  );
}
