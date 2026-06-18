import type { Metadata } from "next";
import CollegeLevelsPage from "@/features/college-levels/components/CollegeLevelsPage";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "College Levels",
  description: "Manage educational levels and institutions.",
};

export default async function Page() {
  await requireRole([ROLES.ADMIN]);
  return <CollegeLevelsPage />;
}
