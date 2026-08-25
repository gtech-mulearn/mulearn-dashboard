import type { Metadata } from "next";
import CollegeLevelsPage from "@/features/college-levels/components/CollegeLevelsPage";
import { FELLOW_MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "College Levels",
  description: "Manage educational levels and institutions.",
};

export default async function Page() {
  await requireRole(FELLOW_MANAGEMENT_ROLES);
  return <CollegeLevelsPage />;
}
