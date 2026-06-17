import type { Metadata } from "next";
import CollegeLevelsPage from "@/features/college-levels/components/CollegeLevelsPage";

export const metadata: Metadata = {
  title: "College Levels",
  description: "Manage educational levels and institutions.",
};

export default function Page() {
  return <CollegeLevelsPage />;
}
